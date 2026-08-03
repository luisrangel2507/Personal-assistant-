"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ListChecks, Home } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home, active: "bg-sky-500/15 text-sky-400" },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, active: "bg-violet-500/15 text-violet-400" },
  { href: "/lists", label: "Listas", icon: ListChecks, active: "bg-emerald-500/15 text-emerald-400" },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="mx-auto max-w-lg flex px-2 py-2">
        {TABS.map(({ href, label, icon: Icon, active }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-1">
              <div
                className={`h-8 w-12 rounded-xl flex items-center justify-center transition ${
                  isActive ? active : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${isActive ? active.split(" ")[1] : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
