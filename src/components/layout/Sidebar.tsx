"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { Radar } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-base-700 bg-base-900">
      <div className="flex items-center gap-2 px-6 py-6">
        <Radar className="h-6 w-6 text-clay-500" strokeWidth={2.5} />
        <span className="font-display text-lg tracking-tight">Stock Relate</span>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-clay-500/15 text-clay-400 font-medium"
                  : "text-paper/70 hover:bg-base-800 hover:text-paper"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 text-xs text-paper/40 border-t border-base-700">
        Stock Relate — v0.1 (squelette)
      </div>
    </aside>
  );
}
