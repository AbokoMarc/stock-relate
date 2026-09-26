"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";

/** Recompte la file d'attente hors-ligne a intervalle regulier (pas de live query Dexie sur un count agrege simple). */
export function useOutboxCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const check = () => db.outbox.count().then((c) => active && setCount(c));
    check();
    const id = setInterval(check, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return count;
}
