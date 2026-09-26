"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, WORKER_URL } from "@/lib/supabase";
import { callSendReminder, WorkerCallError } from "@/lib/worker";
import type { Client, Warehouse } from "@/lib/types";

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  city: Warehouse | null;
  credit_score: number;
  credit_limit: number;
  outstanding_balance: number;
  last_contact_at: string | null;
  slug: string | null;
}

function rowToClient(r: ClientRow): Client {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? "",
    city: r.city ?? "yaounde",
    creditScore: r.credit_score,
    creditLimit: r.credit_limit,
    outstandingBalance: r.outstanding_balance,
    lastContactAt: r.last_contact_at ?? undefined,
    slug: r.slug ?? undefined,
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setClients((data as ClientRow[]).map(rowToClient));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Envoie une vraie relance WhatsApp via le Worker (template Meta approuvé
   * requis, voir stock-relate-worker/README.md). Avant cette version,
   * ce bouton ne faisait qu'horodater sans rien envoyer.
   */
  async function remind(id: string) {
    try {
      await callSendReminder(id);
    } catch (err) {
      throw new Error(
        err instanceof WorkerCallError
          ? err.message
          : "Impossible de joindre le Worker (NEXT_PUBLIC_WORKER_URL configuré ?)."
      );
    }
    await refresh();
  }

  function portalUrl(slug?: string): string | null {
    return slug ? `${WORKER_URL}/portal/${slug}` : null;
  }

  return { clients, error, refresh, remind, portalUrl };
}
