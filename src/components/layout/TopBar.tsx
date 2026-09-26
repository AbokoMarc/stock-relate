"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, WifiOff, Wifi, Menu, LogOut, UploadCloud } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSeedDb } from "@/hooks/useSeedDb";
import { useOutboxCount } from "@/hooks/useOutboxCount";
import { supabase } from "@/lib/supabase";
import MoreMenu from "./MoreMenu";

export default function TopBar() {
  const online = useOnlineStatus();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const pendingCount = useOutboxCount();
  useSeedDb();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/onboarding");
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-base-700 bg-base-900/90 backdrop-blur px-4 py-3 lg:px-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <select
        className="rounded-md border border-base-700 bg-base-800 px-2.5 py-1.5 text-sm text-paper focus:border-clay-500 focus:outline-none"
        defaultValue="yaounde"
        aria-label="Entrepôt actif"
      >
        <option value="yaounde">Yaoundé HQ</option>
        <option value="douala">Douala Hub</option>
        <option value="all">Tous les entrepôts</option>
      </select>

      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
        <input
          type="search"
          placeholder="SKU, client, commande…"
          className="w-full rounded-md border border-base-700 bg-base-800 py-1.5 pl-9 pr-3 text-sm placeholder:text-paper/40 focus:border-clay-500 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
            online ? "bg-forest-600/20 text-forest-400" : "bg-alert-500/20 text-alert-500"
          }`}
          title={online ? "Connecté — synchro active" : "Hors-ligne — les ventes continuent en local"}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "En ligne" : "Hors-ligne"}
        </span>
        {pendingCount > 0 && (
          <span
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-clay-500/20 px-2.5 py-1 text-xs text-clay-400"
            title={`${pendingCount} produit(s) créé(s) hors-ligne, en attente de synchronisation`}
          >
            <UploadCloud className="h-3.5 w-3.5" /> {pendingCount} en attente
          </span>
        )}
        <button
          onClick={() => setMoreOpen(true)}
          className="lg:hidden rounded-md border border-base-700 p-2 text-paper/70"
          aria-label="Plus d'options"
        >
          <Menu className="h-4 w-4" />
        </button>
        <button
          onClick={logout}
          className="hidden sm:flex items-center gap-1.5 rounded-md border border-base-700 px-2.5 py-1.5 text-xs text-paper/60 hover:text-paper hover:bg-base-800"
          title="Se déconnecter"
        >
          <LogOut className="h-3.5 w-3.5" /> Déconnexion
        </button>
      </div>

      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </header>
  );
}
