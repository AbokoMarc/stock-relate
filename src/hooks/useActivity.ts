"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ActivityLogEntry } from "@/lib/types";

export function useActivity(limit = 8) {
  const [entries, setEntries] = useState<ActivityLogEntry[] | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!error && data) {
      setEntries(
        (data as { id: string; actor: string; message: string; created_at: string }[]).map((r) => ({
          id: r.id,
          actor: r.actor,
          message: r.message,
          createdAt: r.created_at,
        }))
      );
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, refresh };
}
