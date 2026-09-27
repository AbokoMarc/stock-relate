"use client";

import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { fcfa, relativeTime } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { MessageCircle, Link2, Check } from "lucide-react";

export default function ClientsPage() {
  const { clients, remind, portalUrl } = useClients();
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [errorFor, setErrorFor] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleRemind(id: string) {
    setRemindingId(id);
    setErrorFor((e) => ({ ...e, [id]: "" }));
    try {
      await remind(id);
    } catch (err) {
      setErrorFor((e) => ({ ...e, [id]: err instanceof Error ? err.message : "Échec de l'envoi." }));
    } finally {
      setRemindingId(null);
    }
  }

  function copyPortalLink(id: string, slug?: string) {
    const url = portalUrl(slug);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      <PageHeader
        title="CRM clients & comptes"
        subtitle="Score de crédit, encours et relances — le cœur de vente B2B/B2C."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {clients?.map((c) => (
          <div key={c.id} className="rounded-xl border border-base-700 bg-base-900 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-sm text-paper">{c.name}</p>
                <p className="text-xs text-paper/40">{c.phone} · {c.city === "yaounde" ? "Yaoundé" : "Douala"}</p>
              </div>
              {c.outstandingBalance > 0 ? (
                <Badge tone="alert">Impayé</Badge>
              ) : (
                <Badge tone="forest">À jour</Badge>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-base-800 p-2">
                <p className="text-paper/40">Score de crédit</p>
                <p className="font-display text-lg text-paper mt-0.5">{c.creditScore}/100</p>
              </div>
              <div className="rounded-md bg-base-800 p-2">
                <p className="text-paper/40">Limite accordée</p>
                <p className="font-display text-lg text-paper mt-0.5">{fcfa(c.creditLimit)}</p>
              </div>
            </div>

            {c.outstandingBalance > 0 && (
              <p className="mt-2 text-xs text-clay-700">{fcfa(c.outstandingBalance)} en attente</p>
            )}
            {c.lastContactAt && (
              <p className="mt-1 text-[11px] text-paper/30">Dernier contact {relativeTime(c.lastContactAt)}</p>
            )}

            <div className="mt-3 flex gap-1.5">
              <button
                onClick={() => handleRemind(c.id)}
                disabled={c.outstandingBalance === 0 || remindingId === c.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-base-600 py-2 text-xs text-paper/70 hover:bg-base-800 disabled:opacity-30"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {remindingId === c.id ? "Envoi…" : "Relancer par WhatsApp"}
              </button>
              <button
                onClick={() => copyPortalLink(c.id, c.slug)}
                disabled={!c.slug}
                title="Copier le lien du portail client (catalogue + solde)"
                className="flex items-center justify-center gap-1.5 rounded-md border border-base-600 px-2.5 py-2 text-xs text-paper/70 hover:bg-base-800 disabled:opacity-30"
              >
                {copiedId === c.id ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errorFor[c.id] && <p className="mt-1.5 text-[11px] text-alert-500">{errorFor[c.id]}</p>}
          </div>
        ))}
        {clients !== null && clients.length === 0 && (
          <p className="text-sm text-paper/40 col-span-full">Aucun client pour l'instant.</p>
        )}
      </div>
    </div>
  );
}

