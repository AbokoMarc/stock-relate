"use client";

import { useProducts } from "@/hooks/useProducts";
import { useEscrow } from "@/hooks/useEscrow";
import { fcfa } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import SwarmInbox from "@/components/dashboard/SwarmInbox";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
  const { products } = useProducts();
  const { transactions: escrow } = useEscrow();

  const stockValue =
    products?.reduce((sum, p) => sum + p.costPrice * (p.stock.yaounde + p.stock.douala), 0) ?? 0;
  const dailyHoldingCost = products?.reduce((sum, p) => sum + p.dailyHoldingCost, 0) ?? 0;
  const pendingEscrow =
    escrow
      ?.filter((e) => e.status === "paid_awaiting_delivery" || e.status === "momo_push_sent")
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const lowStockCount =
    products?.filter((p) => p.stock.yaounde + p.stock.douala <= p.reorderPoint).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Pilote d'activité"
        subtitle="Vue en direct de vos entrepôts de Yaoundé et Douala."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Valeur du stock" value={fcfa(stockValue)} />
        <StatCard
          label="Coût de détention / jour"
          value={fcfa(dailyHoldingCost)}
          tone={dailyHoldingCost > 0 ? "warn" : "default"}
          hint="Somme des immobilisations"
        />
        <StatCard label="Fonds MoMo en attente" value={fcfa(pendingEscrow)} tone="good" />
        <StatCard
          label="Produits sous seuil"
          value={String(lowStockCount)}
          tone={lowStockCount > 0 ? "warn" : "default"}
          hint="Réassort recommandé"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SwarmInbox />
        <ActivityFeed />
      </div>
    </div>
  );
}
