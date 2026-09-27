"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { callVision, fileToBase64, WorkerCallError, type InvoiceExtraction } from "@/lib/worker";
import type { Warehouse } from "@/lib/types";
import { X, Upload, Check, AlertTriangle } from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

export default function InvoiceImportModal({
  onClose,
  onImported,
  products,
}: {
  onClose: () => void;
  onImported: () => void;
  products: ProductOption[];
}) {
  const [step, setStep] = useState<"pick" | "analyzing" | "review">("pick");
  const [extraction, setExtraction] = useState<InvoiceExtraction | null>(null);
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [warehouse, setWarehouse] = useState<Warehouse>("yaounde");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setStep("analyzing");
    setError(null);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const result = await callVision(base64, mimeType);
      setExtraction(result);

      // Pre-association automatique quand le SKU devine correspond exactement
      // a un SKU connu — le reste reste a associer a la main.
      const preMatches: Record<number, string> = {};
      result.lines.forEach((line, i) => {
        const found = products.find((p) => p.sku.toLowerCase() === line.skuGuess.toLowerCase());
        if (found) preMatches[i] = found.id;
      });
      setMatches(preMatches);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof WorkerCallError
          ? err.message
          : "Impossible de joindre le Worker (NEXT_PUBLIC_WORKER_URL est-il configuré et le Worker déployé ?)."
      );
      setStep("pick");
    }
  }

  async function confirmImport() {
    if (!extraction) return;
    setSaving(true);
    setError(null);
    try {
      for (const [indexStr, productId] of Object.entries(matches)) {
        const line = extraction.lines[Number(indexStr)];
        if (!productId || !line || line.quantity <= 0) continue;
        const { error: rpcError } = await supabase.rpc("create_movement", {
          p_type: "in",
          p_product_id: productId,
          p_quantity: line.quantity,
          p_warehouse: warehouse,
          p_to_warehouse: null,
          p_source: "vision_ai",
          p_note: `Facture importée (Vision AI) — fournisseur deviné : ${extraction.supplierGuess}`,
        });
        if (rpcError) throw new Error(rpcError.message);
      }
      onImported();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'import.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-base-700 bg-base-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-paper">Importer une facture (Vision AI)</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-paper/50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "pick" && (
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-600 py-10 cursor-pointer hover:border-clay-500">
            <Upload className="h-6 w-6 text-paper/50" />
            <span className="text-sm text-paper/60">Photographier ou choisir une facture</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        )}

        {step === "analyzing" && (
          <div className="py-10 text-center text-sm text-paper/50">Analyse en cours (Gemini)…</div>
        )}

        {step === "review" && extraction && (
          <div>
            <p className="mb-3 text-xs text-paper/50">
              Fournisseur deviné : <span className="text-paper">{extraction.supplierGuess}</span> — confiance{" "}
              {Math.round(extraction.rawConfidence * 100)}%
            </p>

            <div className="space-y-2 mb-3">
              {extraction.lines.map((line, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-md bg-base-800 p-2.5">
                  <span className="text-xs text-paper/50 min-w-[100px]">
                    SKU deviné : <span className="text-paper">{line.skuGuess || "?"}</span>
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
                  <span className="text-xs text-paper/60">Qté : {line.quantity}</span>
                </div>
              ))}
            </div>

            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value as Warehouse)}
              className="mb-3 w-full rounded-md border border-base-700 bg-base-800 px-2.5 py-1.5 text-xs focus:border-clay-500 focus:outline-none"
            >
              <option value="yaounde">Entrée à Yaoundé</option>
              <option value="douala">Entrée à Douala</option>
            </select>

            <p className="mb-3 flex gap-2 rounded-md bg-clay-500/10 border border-clay-500/30 px-2.5 py-2 text-xs text-clay-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Lecture automatique, pas garantie sur papier froissé/manuscrit — vérifiez chaque ligne avant de confirmer.
            </p>

            {error && <p className="mb-3 text-xs text-alert-500">{error}</p>}

            <button
              onClick={confirmImport}
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-clay-500 py-2.5 text-sm font-medium text-base-950 hover:bg-clay-400 disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> {saving ? "Enregistrement…" : "Confirmer l'entrée en stock"}
            </button>
          </div>
        )}

        {error && step === "pick" && <p className="mt-3 text-xs text-alert-500">{error}</p>}
      </div>
    </div>
  );
}
