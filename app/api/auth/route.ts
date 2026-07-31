import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, expectedSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const passcodeEnv = process.env.APP_PASSCODE;
  if (!passcodeEnv) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => null);
  const passcode = body?.passcode;

  if (typeof passcode !== "string" || passcode !== passcodeEnv) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await expectedSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
