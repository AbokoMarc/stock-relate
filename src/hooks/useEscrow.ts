"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { EscrowStatus } from "@/lib/types";

export interface EscrowRow {
  id: string;
  client_id: string;
  order_ref: string;
  amount: number;
  operator: "mtn" | "orange";
  status: EscrowStatus;
  created_at: string;
  updated_at: string;
  clients: { name: string } | null;
}

export function useEscrow() {
  const [transactions, setTransactions] = useState<EscrowRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("escrow_transactions")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setTransactions(data as unknown as EscrowRow[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function release(id: string) {
    const { error } = await supabase
      .from("escrow_transactions")
      .update({ status: "released" })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await refresh();
  }

  return { transactions, error, refresh, release };
}
