"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rowToProduct, type SupabaseProductRow } from "@/lib/mappers";
import { db } from "@/lib/db";
import type { Product } from "@/lib/types";

/**
 * Pattern "Supabase d'abord, cache IndexedDB en secours" — identique dans
 * l'esprit a ce qu'on avait avec le backend Spring Boot, adapte a Supabase.
 * L'ecriture hors-ligne (creer un produit sans reseau) n'est toujours pas
 * mise en file d'attente ici — meme limite assumee qu'avant.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [source, setSource] = useState<"supabase" | "cache" | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, suppliers(name, avg_lead_time_days)")
      .order("name") as { data: SupabaseProductRow[] | null; error: { message: string } | null };

    if (error || !data) {
      const cached = await db.products.orderBy("name").toArray();
      setProducts(cached);
      setSource("cache");
      setWarning(
        error
          ? `Supabase indisponible (${error.message}) — affichage du dernier cache local.`
          : "Supabase injoignable — affichage du dernier cache local (hors-ligne ?)."
      );
      return;
    }

    const mapped = data.map(rowToProduct);
    setProducts(mapped);
    setSource("supabase");
    setWarning(null);
    await db.products.clear();
    if (mapped.length > 0) await db.products.bulkAdd(mapped);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, source, warning, refresh };
}
