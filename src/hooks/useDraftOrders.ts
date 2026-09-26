"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface DraftOrderItem {
  productGuess: string;
  quantity: number;
}

export interface DraftOrderRow {
  id: string;
  client_phone: string;
  transcript: string;
  items: DraftOrderItem[];
  confidence: number;
  status: "pending" | "validated" | "dismissed";
  created_at: string;
}

/**
 * Brouillons de commande issus d'un vocal/texte WhatsApp (voir
 * stock-relate-worker, route /webhooks/whatsapp). C'est la moitie qui
 * manquait : le Worker cree ces brouillons, mais rien ne les affichait
 * nulle part avant cette page — ils s'accumulaient invisibles en base.
 */
export function useDraftOrders() {
  const [drafts, setDrafts] = useState<DraftOrderRow[] | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("draft_orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error && data) setDrafts(data as unknown as DraftOrderRow[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function dismiss(id: string) {
    const { error } = await supabase.from("draft_orders").update({ status: "dismissed" }).eq("id", id);
    if (error) throw new Error(error.message);
    await refresh();
  }

  /**
   * Valide un brouillon : cree un mouvement de sortie (atomique, via
   * create_movement) pour chaque ligne ou l'humain a bien associe un vrai
   * produit, puis marque le brouillon comme valide. Les lignes non
   * associees (produit non trouve/ambigu) sont simplement ignorees — pas
   * de creation "au petit bonheur" sur une devinette de l'IA.
   */
  async function validate(
    draftId: string,
    matchedLines: { productId: string; quantity: number }[],
    warehouse: "yaounde" | "douala"
  ) {
    for (const line of matchedLines) {
      const { error } = await supabase.rpc("create_movement", {
        p_type: "out",
        p_product_id: line.productId,
        p_quantity: line.quantity,
        p_warehouse: warehouse,
        p_to_warehouse: null,
        p_source: "whatsapp_voice",
        p_note: `Validé depuis un brouillon WhatsApp (${draftId})`,
      });
      if (error) throw new Error(`Échec sur une ligne : ${error.message}`);
    }
    const { error: updateError } = await supabase
      .from("draft_orders")
      .update({ status: "validated" })
      .eq("id", draftId);
    if (updateError) throw new Error(updateError.message);
    await refresh();
  }

  return { drafts, refresh, dismiss, validate };
}
