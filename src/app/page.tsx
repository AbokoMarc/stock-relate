"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirection cote client vers /dashboard. En export statique (Cloudflare
 * Pages sert des fichiers, pas un serveur Next.js), redirect() de
 * next/navigation ne peut pas s'executer a la demande — cette page
 * s'affiche un instant (vide) puis redirige immediatement via le
 * navigateur, ce qui fonctionne partout, y compris en hebergement statique.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
