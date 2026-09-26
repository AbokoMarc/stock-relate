"use client";

import { useSuggestions } from "@/hooks/useSuggestions";
import { relativeTime } from "@/lib/format";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Sparkles } from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  reorder: "Réassort",
  "price_drop": "Prix",
  collections: "Recouvrement",
  "delivery_reassign": "Livraison",
};

export default function SwarmInbox() {
  const { suggestions, dismiss, accept } = useSuggestions();

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-clay-400" />
        <h2 className="font-display text-sm text-paper">Boîte de réception — agents</h2>
        {suggestions && suggestions.length > 0 && <Badge tone="clay">{suggestions.length} actives</Badge>}
      </div>

      {!suggestions || suggestions.length === 0 ? (
        <p className="text-sm text-paper/40 py-4">Aucune suggestion en attente pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {suggestions.map((s) => (
            <li key={s.id} className="rounded-lg border border-base-700 bg-base-800 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge tone="neutral">{KIND_LABEL[s.kind] ?? s.kind}</Badge>
                  <p className="mt-1.5 text-sm font-medium text-paper">{s.title}</p>
                  <p className="mt-1 text-xs text-paper/50">{s.detail}</p>
                  <p className="mt-1.5 text-[11px] text-paper/30">{relativeTime(s.createdAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => accept(s.id, s.title)}
                  className="rounded-md bg-clay-500 px-3 py-1.5 text-xs font-medium text-base-950 hover:bg-clay-400"
                >
                  Valider la suggestion
                </button>
                <button
                  onClick={() => dismiss(s.id)}
                  className="rounded-md border border-base-600 px-3 py-1.5 text-xs text-paper/70 hover:bg-base-700"
                >
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
