"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Authentification reelle via Supabase Auth (email + mot de passe). Le
 * token de session est gere par supabase-js lui-meme (stocke en
 * localStorage sous le capot) — pas besoin de le manipuler a la main comme
 * avec l'ancien backend Spring Boot.
 */
export function useAuth() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthError(error.message);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new AuthError(error.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ready, authenticated, login, register, logout };
}

export class AuthError extends Error {}
