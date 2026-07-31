import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { ListSummary } from "@/lib/types";

type ListRow = {
  id: number;
  name: string;
  icon: string;
  position: number;
  created_at: string;
  item_count: string;
  checked_count: string;
};

function toList(row: ListRow): ListSummary {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    itemCount: Number(row.item_count),
    checkedCount: Number(row.checked_count),
    createdAt: row.created_at,
  };
}

export async function GET() {
  const rows = await query<ListRow>(
    `SELECT l.*,
            COUNT(li.id) AS item_count,
            COUNT(li.id) FILTER (WHERE li.checked) AS checked_count
     FROM lists l
     LEFT JOIN list_items li ON li.list_id = l.id
     GROUP BY l.id
     ORDER BY l.position, l.id`
  );
  return NextResponse.json(rows.map(toList));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name;
  const icon = typeof body?.icon === "string" ? body.icon : "list";

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [{ next_position }] = await query<{ next_position: number }>(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM lists"
  );

  const rows = await query<ListRow & { item_count: string; checked_count: string }>(
    `INSERT INTO lists (name, icon, position)
     VALUES ($1, $2, $3)
     RETURNING *, 0 AS item_count, 0 AS checked_count`,
    [name.trim(), icon, next_position]
  );

  return NextResponse.json(toList(rows[0]), { status: 201 });
}
