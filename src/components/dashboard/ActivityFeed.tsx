"use client";

import { useActivity } from "@/hooks/useActivity";
import { relativeTime } from "@/lib/format";
import Card from "@/components/ui/Card";
import { History } from "lucide-react";

export default function ActivityFeed() {
  const { entries } = useActivity(8);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-paper/50" />
        <h2 className="font-display text-sm text-paper">Fil d&apos;activité</h2>
      </div>
      {!entries || entries.length === 0 ? (
        <p className="text-sm text-paper/40 py-2">Rien à afficher pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="text-sm">
              <span className="text-paper/80">{e.message}</span>
              <p className="text-[11px] text-paper/30 mt-0.5">
                {e.actor === "ai" ? "Agent IA" : e.actor === "system" ? "Système" : e.actor} · {relativeTime(e.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
