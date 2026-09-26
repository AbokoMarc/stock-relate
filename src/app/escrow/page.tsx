"use client";

import { useEscrow } from "@/hooks/useEscrow";
import type { EscrowStatus } from "@/lib/types";
import { fcfa, relativeTime } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { AlertTriangle, Send } from "lucide-react";

const STATUS_LABEL: Record<EscrowStatus, { label: string; tone: "neutral" | "clay" | "forest" | "alert" }> = {
  pending_payment: { label: "En attente de paiement", tone: "neutral" },
  momo_push_sent: { label: "Push MoMo envoyé", tone: "clay" },
  paid_awaiting_delivery: { label: "Payé — livraison en cours", tone: "clay" },
  released: { label: "Reversé au compte marchand", tone: "forest" },
  refunded: { label: "Remboursé", tone: "alert" },
  failed: { label: "Échec", tone: "alert" },
};

export default function EscrowPage() {
  const { transactions, release } = useEscrow();

  return (
    <div>
      <PageHeader
        title="Centre de paiement Mobile Money"
        subtitle="Suivi des push MoMo — MTN & Orange Money."
      />

      <div className="mb-5 flex gap-2.5 rounded-lg border border-clay-500/30 bg-clay-500/10 p-3 text-xs text-clay-400">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Cet écran affiche un flux de <strong>paiement direct au compte marchand</strong>, pas un vrai
          compte séquestre tiers : détenir les fonds d&apos;un client en dehors de votre propre compte
          exige un partenariat avec un agrégateur/PSP déjà licencié (voir README, section 1). Les boutons
          ci-dessous sont branchés sur des appels simulés tant que vos identifiants MTN/Orange en
          production ne sont pas configurés (voir <code>stock-relate-worker</code>, route <code>/webhooks/momo</code>).
        </p>
      </div>

      <div className="rounded-xl border border-base-700 bg-base-900 overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Opérateur</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Quand</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((t) => (
                <tr key={t.id} className="border-b border-base-800 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-paper/60">{t.order_ref}</td>
                  <td className="px-4 py-3 text-paper">{t.clients?.name ?? "Client"}</td>
                  <td className="px-4 py-3 text-paper/60 uppercase text-xs">{t.operator}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fcfa(t.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_LABEL[t.status].tone}>{STATUS_LABEL[t.status].label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-paper/40">{relativeTime(t.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {t.status === "paid_awaiting_delivery" && (
                      <button
                        onClick={() => release(t.id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-forest-600 px-2.5 py-1.5 text-xs font-medium text-paper hover:bg-forest-500"
                      >
                        <Send className="h-3.5 w-3.5" /> Valider la livraison
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions !== null && transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-paper/40">
                    Aucune transaction pour l'instant.
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
