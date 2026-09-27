"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { fcfa } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { Warehouse as WarehouseIcon, Package, AlertTriangle } from "lucide-react";
import type { Warehouse } from "@/lib/types";

const SITES: { key: Warehouse; name: string; subtitle: string }[] = [
  { key: "yaounde", name: "Yaoundé HQ", subtitle: "Entrepôt principal" },
  { key: "douala", name: "Douala Hub", subtitle: "Entrepôt secondaire" },
];

export default function WarehousesPage() {
  const { products } = useProducts();
  const [selected, setSelected] = useState<Warehouse>("yaounde");

  function siteStats(key: Warehouse) {
    const items = products ?? [];
    const totalUnits = items.reduce((sum, p) => sum + p.stock[key], 0);
    const value = items.reduce((sum, p) => sum + p.costPrice * p.stock[key], 0);
    const critical = items.filter((p) => p.stock[key] <= p.reorderPoint).length;
    const distinctSkus = items.filter((p) => p.stock[key] > 0).length;
    return { totalUnits, value, critical, distinctSkus };
  }

  const selectedProducts = (products ?? []).filter((p) => p.stock[selected] > 0);

  return (
    <div>
      <PageHeader title="Entrepôts" subtitle="Vue par site — Yaoundé et Douala." />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {SITES.map((site) => {
          const stats = siteStats(site.key);
          const active = selected === site.key;
          return (
            <button
              key={site.key}
              onClick={() => setSelected(site.key)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active ? "border-clay-500 bg-clay-500/5" : "border-base-700 bg-base-900 hover:border-base-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar/10 text-sidebar">
                  <WarehouseIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm text-paper">{site.name}</p>
                  <p className="text-xs text-paper/40">{site.subtitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-paper/40">Unités</p>
                  <p className="font-display text-base text-paper">{stats.totalUnits}</p>
                </div>
                <div>
                  <p className="text-paper/40">Valeur</p>
                  <p className="font-display text-base text-paper">{fcfa(stats.value)}</p>
                </div>
                <div>
                  <p className="text-paper/40">Critiques</p>
                  <p className={`font-display text-base ${stats.critical > 0 ? "text-alert-500" : "text-paper"}`}>
                    {stats.critical}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-base-700 bg-base-900 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-paper/50" />
          <h2 className="font-display text-sm text-paper">
            Produits présents à {SITES.find((s) => s.key === selected)?.name}
          </h2>
        </div>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Désignation</th>
                <th className="px-3 py-2 font-medium text-right">Quantité</th>
                <th className="px-3 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((p) => {
                const critical = p.stock[selected] <= p.reorderPoint;
                return (
                  <tr key={p.id} className="border-b border-base-800 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-paper/60">{p.sku}</td>
                    <td className="px-3 py-2 text-paper">{p.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.stock[selected]}</td>
                    <td className="px-3 py-2">
                      {critical ? (
                        <Badge tone="alert">
                          <AlertTriangle className="h-3 w-3 mr-1 inline" /> Critique
                        </Badge>
                      ) : (
                        <Badge tone="forest">Sécurisé</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {selectedProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-paper/40">
                    Aucun produit en stock sur ce site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
