"use client";

import { useState } from "react";
import { fcfa } from "@/lib/format";
import { useProducts } from "@/hooks/useProducts";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ProductModal from "@/components/inventory/ProductModal";
import BarcodeScanModal from "@/components/inventory/BarcodeScanModal";
import { Plus, ScanBarcode, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const { products, source, warning, refresh } = useProducts();

  const filtered = (products ?? []).filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Catalogue référentiel & stocks"
        subtitle="Le jumeau numérique de vos marchandises, par entrepôt — connecté au backend."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-clay-500 px-3.5 py-2 text-sm font-medium text-base-950 hover:bg-clay-400"
          >
            <Plus className="h-4 w-4" /> Nouvelle fiche produit
          </button>
        }
      />

      {source === "cache" && warning && (
        <div className="mb-4 flex gap-2.5 rounded-lg border border-clay-500/30 bg-clay-500/10 p-3 text-xs text-clay-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{warning}</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Rechercher par nom ou SKU…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-base-700 bg-base-800 px-3 py-2 text-sm placeholder:text-paper/40 focus:border-clay-500 focus:outline-none"
        />
        <button
          onClick={() => setScanOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-base-600 px-3 py-2 text-sm text-paper/70 hover:bg-base-800"
          title="Scanner un code-barres pour remplir la recherche"
        >
          <ScanBarcode className="h-4 w-4" /> Scanner
        </button>
      </div>

      <div className="rounded-xl border border-base-700 bg-base-900 overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Désignation</th>
                <th className="px-4 py-3 font-medium text-right">Yaoundé</th>
                <th className="px-4 py-3 font-medium text-right">Douala</th>
                <th className="px-4 py-3 font-medium text-right">Coût détention/j</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const total = p.stock.yaounde + p.stock.douala;
                const critical = total <= p.reorderPoint;
                return (
                  <tr key={p.id} className="border-b border-base-800 last:border-0 hover:bg-base-800/60">
                    <td className="px-4 py-3 font-mono text-xs text-paper/60">{p.sku}</td>
                    <td className="px-4 py-3">
                      <p className="text-paper">{p.name}</p>
                      <p className="text-xs text-paper/40">{p.category}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.stock.yaounde}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.stock.douala}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-paper/60">
                      {fcfa(p.dailyHoldingCost)}
                    </td>
                    <td className="px-4 py-3">
                      {critical ? <Badge tone="alert">Critique</Badge> : <Badge tone="forest">Sécurisé</Badge>}
                    </td>
                  </tr>
                );
              })}
              {products !== null && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-paper/40">
                    Aucun produit ne correspond à cette recherche.
                  </td>
                </tr>
              )}
              {products === null && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-paper/40">
                    Chargement…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <ProductModal onClose={() => setModalOpen(false)} onSaved={refresh} />}
      {scanOpen && (
        <BarcodeScanModal
          onClose={() => setScanOpen(false)}
          onDetected={(code) => {
            setQuery(code);
            setScanOpen(false);
          }}
        />
      )}
    </div>
  );
}
