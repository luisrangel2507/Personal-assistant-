import { List, ShoppingCart, Plane, Home, Briefcase, Heart, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  list: List,
  "shopping-cart": ShoppingCart,
  plane: Plane,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
};

export default function ListIconGlyph({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] ?? List;
  return <Icon className={className} />;
}

export { ICON_MAP };
