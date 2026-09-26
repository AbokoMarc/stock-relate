"use client";

import { useState } from "react";
import { useDraftOrders, type DraftOrderRow } from "@/hooks/useDraftOrders";
import { useProducts } from "@/hooks/useProducts";
import type { Warehouse } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { AlertTriangle, Check, X } from "lucide-react";

export default function DraftsPage() {
  const { drafts, dismiss, validate } = useDraftOrders();
  const { products } = useProducts();

  return (
    <div>
      <PageHeader
        title="Brouillons de commande WhatsApp"
        subtitle="Vocaux et textes clients transcrits par l'agent — à relire avant de créer un vrai mouvement de stock."
      />

      {drafts !== null && drafts.length === 0 && (
        <p className="text-sm text-paper/40">Aucun brouillon en attente pour l'instant.</p>
      )}

      <div className="space-y-4">
        {drafts?.map((d) => (
          <DraftCard key={d.id} draft={d} products={products ?? []} onDismiss={dismiss} onValidate={validate} />
        ))}
      </div>
    </div>
  );
}

function DraftCard({
  draft,
  products,
  onDismiss,
  onValidate,
}: {
  draft: DraftOrderRow;
  products: { id: string; name: string; sku: string }[];
  onDismiss: (id: string) => Promise<void>;
  onValidate: (
    id: string,
    lines: { productId: string; quantity: number }[],
    warehouse: Warehouse
  ) => Promise<void>;
}) {
  const [matches, setMatches] = useState<Record<number, string>>({}); // index -> productId
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(draft.items.map((it, i) => [i, it.quantity]))
  );
  const [warehouse, setWarehouse] = useState<Warehouse>("yaounde");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lowConfidence = draft.confidence < 0.6;

  async function handleValidate() {
    const lines = draft.items
      .map((_, i) => ({ productId: matches[i], quantity: quantities[i] }))
      .filter((l) => l.productId && l.quantity > 0);

    if (lines.length === 0) {
      setError("Associez au moins un article à un vrai produit avant de valider.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onValidate(draft.id, lines, warehouse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la validation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDismiss() {
    setBusy(true);
    try {
      await onDismiss(draft.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-display text-sm text-paper">{draft.client_phone}</p>
          <p className="text-xs text-paper/40">{relativeTime(draft.created_at)}</p>
        </div>
        <Badge tone={lowConfidence ? "alert" : "clay"}>
          Confiance IA : {Math.round(draft.confidence * 100)}%
        </Badge>
      </div>

      <p className="text-sm text-paper/70 italic mb-3">&ldquo;{draft.transcript}&rdquo;</p>

      {lowConfidence && (
        <p className="mb-3 flex gap-2 rounded-md bg-alert-500/10 border border-alert-500/30 px-2.5 py-2 text-xs text-alert-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Confiance faible — l'IA n'est pas sûre d'avoir bien compris. Vérifiez chaque ligne avant de valider.
        </p>
      )}

      <div className="space-y-2 mb-3">
        {draft.items.map((item, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-md bg-base-800 p-2.5">
            <span className="text-xs text-paper/50 min-w-[140px]">
              Deviné : <span className="text-paper">{item.productGuess}</span>
            </span>
            <select
              value={matches[i] ?? ""}
              onChange={(e) => setMatches((m) => ({ ...m, [i]: e.target.value }))}
              className="flex-1 min-w-[160px] rounded-md border border-base-700 bg-base-900 px-2 py-1.5 text-xs focus:border-clay-500 focus:outline-none"
            >
              <option value="">— produit réel non associé —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={quantities[i] ?? 1}
              onChange={(e) => setQuantities((q) => ({ ...q, [i]: Number(e.target.value) }))}
              className="w-16 rounded-md border border-base-700 bg-base-900 px-2 py-1.5 text-xs focus:border-clay-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value as Warehouse)}
          className="rounded-md border border-base-700 bg-base-800 px-2.5 py-1.5 text-xs focus:border-clay-500 focus:outline-none"
        >
          <option value="yaounde">Depuis Yaoundé</option>
          <option value="douala">Depuis Douala</option>
        </select>

        <button
          onClick={handleValidate}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-clay-500 px-3 py-1.5 text-xs font-medium text-base-950 hover:bg-clay-400 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Valider (crée les mouvements)
        </button>
        <button
          onClick={handleDismiss}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md border border-base-600 px-3 py-1.5 text-xs text-paper/70 hover:bg-base-800"
        >
          <X className="h-3.5 w-3.5" /> Rejeter
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-alert-500">{error}</p>}
    </div>
  );
}
