"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useMovements } from "@/hooks/useMovements";
import Card from "@/components/ui/Card";

export default function MiniMovementsChart() {
  const { movements } = useMovements();

  const data = useMemo(() => {
    const days: { label: string; date: string; mouvements: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      days.push({ date, label: d.toLocaleDateString("fr-FR", { weekday: "short" }), mouvements: 0 });
    }
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
    for (const m of movements ?? []) {
      const bucket = byDate[m.created_at.slice(0, 10)];
      if (bucket) bucket.mouvements += m.quantity;
    }
    return days;
  }, [movements]);

  return (
    <Card>
      <h2 className="font-display text-sm mb-3">Activité — 7 derniers jours</h2>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7A7466" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E7E4DC" }} />
            <Bar dataKey="mouvements" fill="#E07B39" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
