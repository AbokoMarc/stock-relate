"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { navItems } from "@/lib/nav";

export default function MoreMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const secondaryItems = navItems.filter((item) => !item.primary);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-72 bg-base-900 border-l border-base-700 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-sm text-paper/70">Plus</span>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-paper/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/80 hover:bg-base-800"
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
