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
const ICON_STYLE: Record<string, { bg: string; text: string; ring: string; hoverRing: string }> = {
  list: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    ring: "border-blue-500/40",
    hoverRing: "hover:border-blue-500/40",
  },
  "shopping-cart": {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    ring: "border-emerald-500/40",
    hoverRing: "hover:border-emerald-500/40",
  },
  plane: {
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    ring: "border-sky-500/40",
    hoverRing: "hover:border-sky-500/40",
  },
  home: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    ring: "border-orange-500/40",
    hoverRing: "hover:border-orange-500/40",
  },
  briefcase: {
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    ring: "border-violet-500/40",
    hoverRing: "hover:border-violet-500/40",
  },
  heart: {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    ring: "border-pink-500/40",
    hoverRing: "hover:border-pink-500/40",
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
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center border ${style.bg} ${style.ring} ${className ?? ""}`}
    >
      <ListIconGlyph icon={icon} className={`h-4 w-4 ${style.text}`} />
    </div>
  );
}

export { ICON_MAP };
