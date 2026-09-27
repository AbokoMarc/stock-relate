"use client";

import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const INTEGRATIONS = [
  { name: "Supabase (base + auth)", envVar: "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY", where: "Frontend (.env.local)" },
  { name: "Worker Cloudflare (agents)", envVar: "NEXT_PUBLIC_WORKER_URL", where: "Frontend (.env.local)" },
  { name: "Groq (transcription vocale)", envVar: "GROQ_API_KEY", where: "Worker uniquement (wrangler secret)" },
  { name: "Gemini Flash (lecture factures)", envVar: "GEMINI_API_KEY", where: "Worker uniquement (wrangler secret)" },
  { name: "WhatsApp Business Cloud API", envVar: "WHATSAPP_TOKEN / VERIFY_TOKEN", where: "Worker uniquement (wrangler secret)" },
  { name: "MTN / Orange MoMo", envVar: "MTN_MOMO_SUBSCRIPTION_KEY", where: "Worker uniquement (wrangler secret)" },
];

export default function SettingsPage() {
  const online = useOnlineStatus();

  return (
    <div>
      <PageHeader title="Paramètres généraux" subtitle="Équipe, synchronisation et clés d'intégration." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-sm mb-3">État de la synchronisation</h2>
          <p className="text-sm text-paper/70">
            Réseau : <span className={online ? "text-forest-600" : "text-alert-500"}>{online ? "connecté" : "hors-ligne"}</span>
          </p>
          <p className="mt-2 text-xs text-paper/40">
            Inventaire et mouvements sont branchés sur Supabase (source de vérité partagée). Le
            cache IndexedDB ne sert que de secours en lecture si Supabase est injoignable — voir
            le README pour la liste des pages encore en démo locale uniquement.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-sm mb-3">Équipe</h2>
          <ul className="space-y-2 text-sm text-paper/70">
            <li className="flex items-center justify-between rounded-md bg-base-800 px-3 py-2">
              <span>Marc — Yaoundé HQ</span>
              <span className="text-xs text-paper/40">Administrateur</span>
            </li>
            <li className="flex items-center justify-between rounded-md bg-base-800 px-3 py-2">
              <span>Isaac — Douala Hub</span>
              <span className="text-xs text-paper/40">Magasinier</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-paper/40">
            L'authentification est réelle (Supabase Auth), mais les rôles ci-dessus sont encore
            d'affichage seulement — aucune restriction de permission par rôle n'est appliquée par
            les policies RLS pour l'instant (tout utilisateur connecté a accès à tout).
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-sm mb-3">Clés d&apos;intégration</h2>
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-700 text-left text-xs text-paper/40">
                  <th className="py-2 pr-4 font-medium">Service</th>
                  <th className="py-2 pr-4 font-medium">Variable</th>
                  <th className="py-2 font-medium">Où la renseigner</th>
                </tr>
              </thead>
              <tbody>
                {INTEGRATIONS.map((i) => (
                  <tr key={i.name} className="border-b border-base-800 last:border-0">
                    <td className="py-2.5 pr-4 text-paper">{i.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-clay-700">{i.envVar}</td>
                    <td className="py-2.5 text-xs text-paper/50">{i.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-paper/40">
            Règle importante : les clés Groq/Gemini/WhatsApp/MoMo ne doivent jamais apparaître
            dans le frontend (elles seraient visibles dans le navigateur de n'importe qui). C'est
            pour ça qu'elles vivent uniquement dans le Worker Cloudflare.
          </p>
        </Card>
      </div>
    </div>
  );
}
