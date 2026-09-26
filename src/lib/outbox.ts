import { db } from "./db";
import { supabase } from "./supabase";

/**
 * File d'attente d'ecriture hors-ligne — pour les PRODUITS uniquement.
 *
 * Pourquoi pas pour les mouvements de stock : un mouvement rejoue plus tard
 * casserait la garantie d'atomicite qu'on vient de construire avec
 * create_movement() (deux mouvements "en attente" sur le meme produit,
 * rejoues dans le mauvais ordre ou en double, peuvent faire passer un stock
 * en negatif sans que personne ne s'en rende compte au moment de la vente).
 * Creer un produit est un risque bien plus faible : au pire, un doublon de
 * SKU visible et corrigeable a la main — jamais un stock qui ment.
 */

const ONE_MINUTE = 60_000;
let flushTimer: ReturnType<typeof setInterval> | null = null;

export async function enqueueProductCreate(payload: Record<string, unknown>) {
  await db.outbox.add({
    id: crypto.randomUUID(),
    kind: "product:create",
    payload,
    createdAt: new Date().toISOString(),
  });
}

export async function pendingOutboxCount(): Promise<number> {
  return db.outbox.count();
}

/** Tente de rejouer chaque entree en attente. Silencieux si toujours hors-ligne. */
export async function flushOutbox(): Promise<{ flushed: number; remaining: number }> {
  const entries = await db.outbox.toArray();
  let flushed = 0;

  for (const entry of entries) {
    if (entry.kind === "product:create") {
      const { error } = await supabase.from("products").insert(entry.payload as Record<string, unknown>);
      if (!error) {
        await db.outbox.delete(entry.id);
        flushed++;
      }
      // En cas d'erreur (toujours hors-ligne, ou SKU en double entre-temps),
      // on laisse l'entree dans la file — nouvelle tentative au prochain flush.
    }
  }

  const remaining = await db.outbox.count();
  return { flushed, remaining };
}

/** A appeler une fois au demarrage de l'app (voir AppShell) : retente au retour du reseau et toutes les minutes. */
export function startOutboxAutoFlush() {
  if (typeof window === "undefined" || flushTimer) return;
  window.addEventListener("online", () => void flushOutbox());
  flushTimer = setInterval(() => void flushOutbox(), ONE_MINUTE);
  void flushOutbox();
}
