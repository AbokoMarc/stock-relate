"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Échec silencieux : l'app reste utilisable sans le cache app-shell,
        // seule la persistance IndexedDB (déjà active) continue de fonctionner.
      });
    }
  }, []);
  return null;
}
