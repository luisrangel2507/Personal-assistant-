"use client";

import { motion } from "framer-motion";

const FILL: Record<string, string> = {
  blue: "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_1px_6px_rgba(59,130,246,0.45)]",
  emerald: "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_1px_6px_rgba(16,185,129,0.45)]",
  sky: "bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_1px_6px_rgba(14,165,233,0.45)]",
  orange: "bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_1px_6px_rgba(249,115,22,0.45)]",
  violet: "bg-gradient-to-r from-violet-600 to-violet-400 shadow-[0_1px_6px_rgba(139,92,246,0.45)]",
  pink: "bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_1px_6px_rgba(236,72,153,0.45)]",
};

export default function ProgressBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-track">
      <motion.div
        className={`h-full rounded-full ${FILL[color] ?? FILL.blue}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
