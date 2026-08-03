"use client";

import { motion } from "framer-motion";
import { List, ShoppingCart, Plane, Home, Briefcase, Heart, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  list: List,
  "shopping-cart": ShoppingCart,
  plane: Plane,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
};

// Each icon gets its own accent so lists read as distinct, colorful cards
// rather than one flat theme color. Class names are written out in full
// (not built from template strings) so Tailwind's JIT scanner picks them up.
const ICON_STYLE: Record<
  string,
  { color: string; bg: string; text: string; ring: string; hoverRing: string; glow: string }
> = {
  list: {
    color: "blue",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    ring: "border-blue-500/40",
    hoverRing: "hover:border-blue-500/40",
    glow: "shadow-[0_0_16px_rgba(59,130,246,0.35)]",
  },
  "shopping-cart": {
    color: "emerald",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    ring: "border-emerald-500/40",
    hoverRing: "hover:border-emerald-500/40",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.35)]",
  },
  plane: {
    color: "sky",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    ring: "border-sky-500/40",
    hoverRing: "hover:border-sky-500/40",
    glow: "shadow-[0_0_16px_rgba(14,165,233,0.35)]",
  },
  home: {
    color: "orange",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    ring: "border-orange-500/40",
    hoverRing: "hover:border-orange-500/40",
    glow: "shadow-[0_0_16px_rgba(249,115,22,0.35)]",
  },
  briefcase: {
    color: "violet",
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    ring: "border-violet-500/40",
    hoverRing: "hover:border-violet-500/40",
    glow: "shadow-[0_0_16px_rgba(139,92,246,0.35)]",
  },
  heart: {
    color: "pink",
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    ring: "border-pink-500/40",
    hoverRing: "hover:border-pink-500/40",
    glow: "shadow-[0_0_16px_rgba(236,72,153,0.35)]",
  },
};

export function getIconStyle(icon: string) {
  return ICON_STYLE[icon] ?? ICON_STYLE.list;
}

export default function ListIconGlyph({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] ?? List;
  return <Icon className={className} />;
}

export function IconChip({ icon, className }: { icon: string; className?: string }) {
  const style = getIconStyle(icon);
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`h-9 w-9 rounded-full flex items-center justify-center border ${style.bg} ${style.ring} ${style.glow} ${className ?? ""}`}
    >
      <ListIconGlyph icon={icon} className={`h-4 w-4 ${style.text}`} />
    </motion.div>
  );
}

export { ICON_MAP };
