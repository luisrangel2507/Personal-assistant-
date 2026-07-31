"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <form
        onSubmit={handleSubmit}
        className="card-base w-full max-w-sm p-6 flex flex-col gap-5 animate-fade-in"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-xl font-semibold tracking-wide text-ink">My Assistant</h1>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label-caps" htmlFor="passcode">
            Passcode
          </label>
          <input
            id="passcode"
            type="password"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter your passcode"
            className="bg-bg border border-border rounded-md px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-danger">Invalid passcode.</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-bg font-semibold uppercase tracking-wide text-sm rounded-md py-2.5 hover:brightness-110 transition disabled:opacity-60"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
