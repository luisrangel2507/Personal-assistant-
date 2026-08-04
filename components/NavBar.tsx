"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, ListChecks, Home } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home, glow: "bg-sky-500/10 shadow-[0_1px_8px_rgba(14,165,233,0.25)]", text: "text-sky-600" },
  {
    href: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    glow: "bg-violet-500/10 shadow-[0_1px_8px_rgba(139,92,246,0.25)]",
    text: "text-violet-600",
  },
  {
    href: "/lists",
    label: "Listas",
    icon: ListChecks,
    glow: "bg-emerald-500/10 shadow-[0_1px_8px_rgba(16,185,129,0.25)]",
    text: "text-emerald-600",
  },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="mx-auto max-w-lg flex px-2 py-2">
        {TABS.map(({ href, label, icon: Icon, glow, text }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-1">
              <div className="relative h-8 w-12 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className={`absolute inset-0 rounded-xl ${glow}`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`relative h-5 w-5 transition-colors ${isActive ? text : "text-muted"}`} />
              </div>
              <span className={`text-xs font-medium transition-colors ${isActive ? text : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
