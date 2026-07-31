import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const rows = await query<{ id: number; name: string; icon: string }>(
    "SELECT id, name, icon FROM lists WHERE id = $1",
    [id]
  );
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (typeof body.name === "string" && body.name.trim()) {
    fields.push(`name = $${i++}`);
    values.push(body.name.trim());
  }
  if (typeof body.icon === "string") {
    fields.push(`icon = $${i++}`);
    values.push(body.icon);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  values.push(id);
  const rows = await query(`UPDATE lists SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);

  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await query("DELETE FROM lists WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
