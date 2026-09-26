"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AgentSuggestion } from "@/lib/types";

interface SuggestionRow {
  id: string;
  kind: string;
  title: string;
  detail: string;
  product_id: string | null;
  created_at: string;
}

function rowToSuggestion(r: SuggestionRow): AgentSuggestion {
  return {
    id: r.id,
    kind: r.kind as AgentSuggestion["kind"],
    title: r.title,
    detail: r.detail,
    productId: r.product_id ?? undefined,
    createdAt: r.created_at,
  };
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[] | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("agent_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSuggestions((data as SuggestionRow[]).map(rowToSuggestion));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function dismiss(id: string) {
    const { error } = await supabase.from("agent_suggestions").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("activity_log").insert({ actor: "system", message: "Suggestion de l'agent ignorée." });
    await refresh();
  }

  async function accept(id: string, title: string) {
    const { error } = await supabase.from("agent_suggestions").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("activity_log").insert({ actor: "system", message: `Suggestion validée : ${title}` });
    await refresh();
  }

  return { suggestions, refresh, dismiss, accept };
}
