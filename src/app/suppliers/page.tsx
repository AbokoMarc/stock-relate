"use client";

import { useSuppliers } from "@/hooks/useSuppliers";
import { fcfa } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import { Send } from "lucide-react";

export default function SuppliersPage() {
  const { suppliers } = useSuppliers();

  return (
    <div>
      <PageHeader
        title="CRM fournisseurs"
        subtitle="Pilotage des relations grossistes et des imports."
      />

      <div className="rounded-xl border border-base-700 bg-base-900 overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Ville</th>
                <th className="px-4 py-3 font-medium text-right">Délai moyen</th>
                <th className="px-4 py-3 font-medium text-right">Encours dû</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((s) => (
                <tr key={s.id} className="border-b border-base-800 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-paper">{s.name}</p>
                    <p className="text-xs text-paper/40">{s.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-paper/70">{s.city}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.avgLeadTimeDays} j</td>
                  <td className="px-4 py-3 text-right tabular-nums text-clay-700">{fcfa(s.amountOwed)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-md border border-base-600 px-2.5 py-1.5 text-xs text-paper/70 hover:bg-base-800"
                      title="Pousser un bon de commande PDF par WhatsApp — à implémenter dans le Worker Cloudflare (stock-relate-worker)"
                    >
                      <Send className="h-3.5 w-3.5" /> Bon de commande
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
