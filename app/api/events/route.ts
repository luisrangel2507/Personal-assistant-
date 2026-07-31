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

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let rows: EventRow[];
  if (from && to) {
    rows = await query<EventRow>(
      "SELECT * FROM events WHERE event_date BETWEEN $1 AND $2 ORDER BY event_date, event_time NULLS LAST, id",
      [from, to]
    );
  } else {
    rows = await query<EventRow>(
      "SELECT * FROM events ORDER BY event_date, event_time NULLS LAST, id"
    );
  }

  return NextResponse.json(rows.map(toEvent));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = body?.title;
  const date = body?.date;
  const time = body?.time ?? null;
  const notes = body?.notes ?? "";

  if (typeof title !== "string" || !title.trim() || typeof date !== "string") {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const rows = await query<EventRow>(
    `INSERT INTO events (title, event_date, event_time, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title.trim(), date, time, notes]
  );

  return NextResponse.json(toEvent(rows[0]), { status: 201 });
}
