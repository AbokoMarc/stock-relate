"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import { fcfa } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

const DAYS_WINDOW = 14;

export default function StatisticsPage() {
  const { products } = useProducts();
  const { movements } = useMovements();

  const movementsByDay = useMemo(() => {
    const days: { date: string; label: string; entrées: number; sorties: number }[] = [];
    for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      days.push({ date, label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), entrées: 0, sorties: 0 });
    }
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
    for (const m of movements ?? []) {
      const date = m.created_at.slice(0, 10);
      const bucket = byDate[date];
      if (!bucket) continue;
      if (m.type === "in") bucket["entrées"] += m.quantity;
      if (m.type === "out") bucket["sorties"] += m.quantity;
    }
    return days;
  }, [movements]);

  const valueByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products ?? []) {
      const value = p.costPrice * (p.stock.yaounde + p.stock.douala);
      map.set(p.category, (map.get(p.category) ?? 0) + value);
    }
    return Array.from(map.entries())
      .map(([category, valeur]) => ({ category, valeur }))
      .sort((a, b) => b.valeur - a.valeur);
  }, [products]);

  const totalMovements14d = movementsByDay.reduce((s, d) => s + d["entrées"] + d["sorties"], 0);
  const totalStockValue = valueByCategory.reduce((s, c) => s + c.valeur, 0);

  return (
    <div>
      <PageHeader title="Statistiques" subtitle="Basées sur vos mouvements et votre catalogue réels — aucune donnée d'exemple." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBlock label="Valeur totale du stock" value={fcfa(totalStockValue)} />
        <StatBlock label={`Mouvements (${DAYS_WINDOW} j)`} value={String(totalMovements14d)} />
        <StatBlock label="Produits au catalogue" value={String(products?.length ?? 0)} />
        <StatBlock label="Catégories" value={String(valueByCategory.length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-sm mb-3">Mouvements de stock — {DAYS_WINDOW} derniers jours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DC" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7A7466" }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: "#7A7466" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E7E4DC" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="entrées" fill="#2F6F5E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="sorties" fill="#E07B39" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-sm mb-3">Valeur du stock par catégorie</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByCategory} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DC" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#7A7466" }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#7A7466" }} width={110} />
                <Tooltip
                  formatter={(v: number) => fcfa(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E7E4DC" }}
                />
                <Bar dataKey="valeur" fill="#E07B39" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      <p className="text-xs text-paper/50">{label}</p>
      <p className="font-display text-xl text-paper mt-1">{value}</p>
    </div>
  );
}
