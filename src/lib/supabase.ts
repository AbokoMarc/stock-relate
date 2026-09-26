import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase cote navigateur — utilise la cle "anon", protegee par les
 * policies RLS (voir stock-relate-supabase/schema.sql). C'est la source de
 * verite pour toutes les pages une fois branchees (produits, mouvements,
 * clients, fournisseurs, escrow, activite, suggestions).
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

/** URL du Worker Cloudflare — utilisee pour les appels qui doivent passer par un secret (Groq/Gemini). */
export const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

export class SupabaseCallError extends Error {}

/** Petit helper pour transformer une erreur Supabase en message lisible. */
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new SupabaseCallError(result.error.message);
  return result.data as T;
}
