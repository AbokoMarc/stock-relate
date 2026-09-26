"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface MovementRow {
  id: string;
  type: "in" | "out" | "transfer";
  quantity: number;
  from_warehouse: "yaounde" | "douala" | null;
  to_warehouse: "yaounde" | "douala" | null;
  source: string;
  note: string | null;
  created_at: string;
  product_id: string;
  products: { name: string } | null;
}

/**
 * Contrairement a l'inventaire, ceci n'a PAS de repli IndexedDB : un
 * mouvement de stock doit passer par la fonction Postgres `create_movement`
 * pour rester atomique (voir stock-relate-supabase/schema.sql). L'ecrire en
 * local puis "rejouer" plus tard casserait justement la garantie qu'on est
 * en train de construire — mieux vaut echouer clairement hors-ligne que
 * fusionner silencieusement deux ventes concurrentes.
 */
export function useMovements() {
  const [movements, setMovements] = useState<MovementRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("movements")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setMovements(data as unknown as MovementRow[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createMovement(params: {
    type: "in" | "out" | "transfer";
    productId: string;
    quantity: number;
    warehouse: "yaounde" | "douala";
    toWarehouse?: "yaounde" | "douala";
    note?: string;
  }) {
    const { error } = await supabase.rpc("create_movement", {
      p_type: params.type,
      p_product_id: params.productId,
      p_quantity: params.quantity,
      p_warehouse: params.warehouse,
      p_to_warehouse: params.toWarehouse ?? null,
      p_source: "manual",
      p_note: params.note ?? null,
    });
    if (error) throw new Error(error.message);
    await refresh();
  }

  return { movements, error, refresh, createMovement };
}
