import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { EventItem } from "@/lib/types";

type EventRow = {
  id: number;
  title: string;
  event_date: string;
  event_time: string | null;
  notes: string;
  done: boolean;
  created_at: string;
};

function toEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    date: typeof row.event_date === "string" ? row.event_date.slice(0, 10) : row.event_date,
    time: row.event_time,
    notes: row.notes ?? "",
    done: row.done,
    createdAt: row.created_at,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (typeof body.title === "string") {
    fields.push(`title = $${i++}`);
    values.push(body.title.trim());
  }
  if (typeof body.date === "string") {
    fields.push(`event_date = $${i++}`);
    values.push(body.date);
  }
  if (body.time === null || typeof body.time === "string") {
    fields.push(`event_time = $${i++}`);
    values.push(body.time);
  }
  if (typeof body.notes === "string") {
    fields.push(`notes = $${i++}`);
    values.push(body.notes);
  }
  if (typeof body.done === "boolean") {
    fields.push(`done = $${i++}`);
    values.push(body.done);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  values.push(id);
  const rows = await query<EventRow>(
    `UPDATE events SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );

  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(toEvent(rows[0]));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  await query("DELETE FROM events WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
