"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/baseball/ncaab", label: "Scoreboard", icon: "⚾" },
  { href: "/baseball/ncaab/standings", label: "Standings", icon: "🏆" },
  { href: "/account", label: "Account", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-2 py-3 text-xs font-medium text-slate-300">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 transition ${
                isActive ? "text-brand-gold" : "hover:text-brand-gold/80"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
