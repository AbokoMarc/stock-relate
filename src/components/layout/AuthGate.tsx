"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Garde d'authentification minimale : redirige vers /onboarding si aucune
 * session Supabase n'est active. Pas une securite cote serveur (RLS s'en
 * charge deja au niveau de la base) — juste une protection UX cote client.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const authenticated = Boolean(data.session);
      if (!authenticated && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }
      setChecked(true);
    });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (pathname === "/onboarding") return <>{children}</>;
  if (!checked) return null;
  return <>{children}</>;
}
