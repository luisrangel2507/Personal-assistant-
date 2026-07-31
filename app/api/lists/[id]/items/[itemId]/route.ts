import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const listId = Number(params.id);
  const itemId = Number(params.itemId);
  if (!Number.isInteger(listId) || !Number.isInteger(itemId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (typeof body.text === "string" && body.text.trim()) {
    fields.push(`text = $${i++}`);
    values.push(body.text.trim());
  }
  if (body.quantity === null || typeof body.quantity === "string") {
    fields.push(`quantity = $${i++}`);
    values.push(body.quantity);
  }
  if (typeof body.checked === "boolean") {
    fields.push(`checked = $${i++}`);
    values.push(body.checked);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  values.push(itemId, listId);
  const rows = await query(
    `UPDATE list_items SET ${fields.join(", ")} WHERE id = $${i} AND list_id = $${i + 1} RETURNING *`,
    values
  );

  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const listId = Number(params.id);
  const itemId = Number(params.itemId);
  if (!Number.isInteger(listId) || !Number.isInteger(itemId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await query("DELETE FROM list_items WHERE id = $1 AND list_id = $2", [itemId, listId]);
  return NextResponse.json({ ok: true });
}
