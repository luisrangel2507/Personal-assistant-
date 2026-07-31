import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { ListItem } from "@/lib/types";

type ItemRow = {
  id: number;
  list_id: number;
  text: string;
  quantity: string | null;
  checked: boolean;
  position: number;
  created_at: string;
};

function toItem(row: ItemRow): ListItem {
  return {
    id: row.id,
    listId: row.list_id,
    text: row.text,
    quantity: row.quantity,
    checked: row.checked,
    position: row.position,
    createdAt: row.created_at,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listId = Number(params.id);
  if (!Number.isInteger(listId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const rows = await query<ItemRow>(
    "SELECT * FROM list_items WHERE list_id = $1 ORDER BY checked, position, id",
    [listId]
  );
  return NextResponse.json(rows.map(toItem));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const listId = Number(params.id);
  if (!Number.isInteger(listId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const text = body?.text;
  const quantity = typeof body?.quantity === "string" && body.quantity.trim() ? body.quantity.trim() : null;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const [{ next_position }] = await query<{ next_position: number }>(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM list_items WHERE list_id = $1",
    [listId]
  );

  const rows = await query<ItemRow>(
    `INSERT INTO list_items (list_id, text, quantity, position)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [listId, text.trim(), quantity, next_position]
  );

  return NextResponse.json(toItem(rows[0]), { status: 201 });
}

/** Clears all checked items in the list (used by the "Clear checked" button). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const listId = Number(params.id);
  if (!Number.isInteger(listId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await query("DELETE FROM list_items WHERE list_id = $1 AND checked = TRUE", [listId]);
  return NextResponse.json({ ok: true });
}
