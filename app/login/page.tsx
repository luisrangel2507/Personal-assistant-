"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="card-base card-scan w-full max-w-sm p-6 flex flex-col gap-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <motion.div
            animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 22px rgba(139,92,246,0.45)", "0 0 0px rgba(139,92,246,0)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center"
          >
            <Lock className="h-5 w-5 text-violet-600" />
          </motion.div>
          <h1 className="text-xl font-semibold tracking-wide text-ink">Mi Asistente</h1>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label-caps" htmlFor="passcode">
            Código de acceso
          </label>
          <input
            id="passcode"
            type="password"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Ingresa tu código"
            className="bg-bg border border-border rounded-xl px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-danger">Código inválido.</p>}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-accent to-violet-500 text-bg font-semibold uppercase tracking-wide text-sm rounded-xl py-2.5 hover:brightness-110 transition disabled:opacity-60 shadow-[0_2px_10px_rgba(61,111,224,0.3)]"
        >
          Iniciar sesión
        </motion.button>
      </motion.form>
    </main>
  );
}
