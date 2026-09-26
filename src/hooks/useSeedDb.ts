"use client";

import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/db";

/** Ensemence la base locale au premier chargement (voir lib/db.ts). */
export function useSeedDb() {
  useEffect(() => {
    seedIfEmpty().catch((err) => console.error("[db] échec de l'ensemencement local", err));
  }, []);
}
