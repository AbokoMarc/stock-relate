"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { enqueueProductCreate } from "@/lib/outbox";
import { useSuppliers } from "@/hooks/useSuppliers";
import { X, UploadCloud } from "lucide-react";

export default function ProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    costPrice: "",
    sellPrice: "",
    dailyHoldingCost: "",
    stockYaounde: "",
    stockDouala: "",
    reservedYaounde: "",
    reservedDouala: "",
    reorderPoint: "",
    supplierId: "",
  });
  const { suppliers } = useSuppliers();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      sku: form.sku,
      name: form.name,
      category: form.category || "Non classé",
      cost_price: Number(form.costPrice) || 0,
      sell_price: Number(form.sellPrice) || 0,
      daily_holding_cost: Number(form.dailyHoldingCost) || 0,
      stock_yaounde: Number(form.stockYaounde) || 0,
      stock_douala: Number(form.stockDouala) || 0,
      reserved_yaounde: Number(form.reservedYaounde) || 0,
      reserved_douala: Number(form.reservedDouala) || 0,
      reorder_point: Number(form.reorderPoint) || 0,
      supplier_id: form.supplierId || null,
    };
  }

  async function save() {
    if (!form.sku || !form.name) return;
    setSaving(true);
    setError(null);

    const payload = buildPayload();

    try {
      const { error: insertError } = await supabase.from("products").insert(payload);

      if (insertError) {
        if (insertError.message.toLowerCase().includes("duplicate")) {
          setError("Un produit avec ce SKU existe déjà.");
          setSaving(false);
          return;
        }
        // Erreur qui n'est ni un doublon ni un souci reseau (ex. permission
        // RLS refusee car votre role n'est pas OWNER/ADMIN) : on l'affiche
        // telle quelle, pas de mise en file — ce n'est pas un probleme de
        // connectivite que retenter va resoudre.
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setSaving(false);
      onSaved();
      onClose();
    } catch {
      // Le fetch a echoue avant meme de contacter Supabase (hors-ligne) :
      // on met en file, ce sera rejoue automatiquement au retour du reseau.
      await enqueueProductCreate(payload);
      setQueued(true);
      setSaving(false);
    }
  }

  if (queued) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative z-10 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-base-700 bg-base-900 p-6 text-center">
          <UploadCloud className="mx-auto h-8 w-8 text-clay-700" />
          <p className="mt-3 font-display text-sm text-paper">Mis en file d&apos;attente</p>
          <p className="mt-1.5 text-xs text-paper/50">
            Pas de réseau détecté. "{form.name}" sera créé automatiquement dès que la connexion
            reviendra (voir le compteur en haut de l&apos;écran).
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-md bg-clay-500 py-2 text-sm font-medium text-base-950 hover:bg-clay-400"
          >
            Compris
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-base-700 bg-base-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-paper">Nouvelle fiche produit</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-paper/50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="SKU / code-barres">
            <input className="input" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
          </Field>
          <Field label="Désignation">
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <input className="input" value={form.category} onChange={(e) => update("category", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix d'achat (FCFA)">
              <input type="number" className="input" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
            </Field>
            <Field label="Prix de vente (FCFA)">
              <input type="number" className="input" value={form.sellPrice} onChange={(e) => update("sellPrice", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Yaoundé">
              <input type="number" className="input" value={form.stockYaounde} onChange={(e) => update("stockYaounde", e.target.value)} />
            </Field>
            <Field label="Stock Douala">
              <input type="number" className="input" value={form.stockDouala} onChange={(e) => update("stockDouala", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Coût détention/jour">
              <input type="number" className="input" value={form.dailyHoldingCost} onChange={(e) => update("dailyHoldingCost", e.target.value)} />
            </Field>
            <Field label="Seuil de réassort">
              <input type="number" className="input" value={form.reorderPoint} onChange={(e) => update("reorderPoint", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Réservé Yaoundé">
              <input type="number" className="input" value={form.reservedYaounde} onChange={(e) => update("reservedYaounde", e.target.value)} />
            </Field>
            <Field label="Réservé Douala">
              <input type="number" className="input" value={form.reservedDouala} onChange={(e) => update("reservedDouala", e.target.value)} />
            </Field>
          </div>
          <Field label="Fournisseur">
            <select className="input" value={form.supplierId} onChange={(e) => update("supplierId", e.target.value)}>
              <option value="">— aucun —</option>
              {suppliers?.map((sup) => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-alert-500/10 border border-alert-500/30 px-3 py-2 text-xs text-alert-500">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={save}
            disabled={saving || !form.sku || !form.name}
            className="flex-1 rounded-md bg-clay-500 py-2.5 text-sm font-medium text-base-950 hover:bg-clay-400 disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Enregistrer la fiche"}
          </button>
          <button onClick={onClose} className="rounded-md border border-base-600 px-4 py-2.5 text-sm text-paper/70">
            Annuler
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #E7E4DC;
          background-color: #FFFFFF;
          padding: 0.5rem 0.7rem;
          font-size: 0.875rem;
          color: #211D17;
        }
        .input:focus {
          outline: none;
          border-color: #E07B39;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-paper/50">{label}</span>
      {children}
    </label>
  );
}
