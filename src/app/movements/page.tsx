"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import type { Warehouse } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import InvoiceImportModal from "@/components/movements/InvoiceImportModal";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, AlertTriangle, Camera } from "lucide-react";

type MovementType = "in" | "out" | "transfer";

const TYPE_BADGE: Record<MovementType, { label: string; tone: "forest" | "alert" | "clay" }> = {
  in: { label: "Entrée", tone: "forest" },
  out: { label: "Sortie", tone: "alert" },
  transfer: { label: "Transfert", tone: "clay" },
};

export default function MovementsPage() {
  const { products, refresh: refreshProducts } = useProducts();
  const { movements, createMovement, refresh: refreshMovements } = useMovements();
  const [form, setForm] = useState({ productId: "", type: "in" as MovementType, quantity: "", warehouse: "yaounde" as Warehouse });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.quantity) return;
    setBusy(true);
    setError(null);
    try {
      await createMovement({
        type: form.type,
        productId: form.productId,
        quantity: Number(form.quantity),
        warehouse: form.warehouse,
        // Pour un transfert, l'autre entrepot est toujours l'oppose du champ selectionne.
        toWarehouse: form.type === "transfer" ? (form.warehouse === "yaounde" ? "douala" : "yaounde") : undefined,
      });
      setForm({ productId: "", type: "in", quantity: "", warehouse: "yaounde" });
    } catch (err) {
      // Le message d'erreur vient directement de la fonction Postgres
      // create_movement (ex. "Stock insuffisant a douala...").
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Hub des flux & mouvements"
        subtitle="Traçabilité des entrées, sorties et transferts — via la fonction atomique Supabase."
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="rounded-xl border border-base-700 bg-base-900 p-4 h-fit">
          <h2 className="font-display text-sm mb-3">Déclarer un mouvement</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              {(["in", "out", "transfer"] as MovementType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[11px] ${
                    form.type === t ? "border-clay-500 text-clay-700 bg-clay-500/10" : "border-base-700 text-paper/50"
                  }`}
                >
                  {t === "in" && <ArrowDownToLine className="h-4 w-4" />}
                  {t === "out" && <ArrowUpFromLine className="h-4 w-4" />}
                  {t === "transfer" && <Repeat className="h-4 w-4" />}
                  {TYPE_BADGE[t].label}
                </button>
              ))}
            </div>

            <select
              required
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="input"
            >
              <option value="">Sélectionner un produit…</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={form.warehouse}
              onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value as Warehouse }))}
              className="input"
            >
              <option value="yaounde">
                {form.type === "transfer" ? "Depuis : Yaoundé (vers Douala)" : "Entrepôt : Yaoundé"}
              </option>
              <option value="douala">
                {form.type === "transfer" ? "Depuis : Douala (vers Yaoundé)" : "Entrepôt : Douala"}
              </option>
            </select>

            <input
              required
              type="number"
              min={1}
              placeholder="Quantité"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              className="input"
            />

            {error && (
              <p className="flex gap-2 rounded-md bg-alert-500/10 border border-alert-500/30 px-2.5 py-2 text-xs text-alert-500">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-clay-500 py-2.5 text-sm font-medium text-base-950 hover:bg-clay-400 disabled:opacity-40"
            >
              {busy ? "Enregistrement…" : "Enregistrer le mouvement"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-base-600 py-2.5 text-sm text-paper/70 hover:bg-base-800"
          >
            <Camera className="h-4 w-4" /> Importer une facture (Vision AI)
          </button>
        </div>

        <div className="rounded-xl border border-base-700 bg-base-900 overflow-hidden h-fit">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Produit</th>
                  <th className="px-4 py-3 font-medium text-right">Qté</th>
                  <th className="px-4 py-3 font-medium">Origine</th>
                  <th className="px-4 py-3 font-medium">Quand</th>
                </tr>
              </thead>
              <tbody>
                {movements?.map((m) => (
                  <tr key={m.id} className="border-b border-base-800 last:border-0">
                    <td className="px-4 py-3">
                      <Badge tone={TYPE_BADGE[m.type].tone}>{TYPE_BADGE[m.type].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-paper">{m.products?.name ?? "Produit supprimé"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.quantity}</td>
                    <td className="px-4 py-3 text-xs text-paper/50">
                      {m.source === "whatsapp_voice" ? "Vocal WhatsApp" : m.source === "vision_ai" ? "Photo (Vision AI)" : "Manuel"}
                    </td>
                    <td className="px-4 py-3 text-xs text-paper/40">{relativeTime(m.created_at)}</td>
                  </tr>
                ))}
                {(!movements || movements.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-paper/40">
                      Aucun mouvement enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #E7E4DC;
          background-color: #FFFFFF;
          padding: 0.55rem 0.7rem;
          font-size: 0.875rem;
          color: #211D17;
        }
        .input:focus {
          outline: none;
          border-color: #E07B39;
        }
      `}</style>

      {importOpen && (
        <InvoiceImportModal
          products={products ?? []}
          onClose={() => setImportOpen(false)}
          onImported={() => {
            refreshMovements();
            refreshProducts();
          }}
        />
      )}
    </div>
  );
}
