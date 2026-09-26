"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar } from "lucide-react";
import { useAuth, AuthError } from "@/hooks/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/dashboard");
      } else {
        await register(email, password);
        // Si la confirmation email est activee sur votre projet Supabase,
        // il n'y a pas encore de session a ce stade — on previent l'utilisateur
        // au lieu de rediriger vers un dashboard qui le renverrait ici.
        setInfo("Compte créé. Vérifiez votre boîte mail si la confirmation est activée, sinon connectez-vous directement.");
        setMode("login");
      }
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Impossible de joindre Supabase. Vérifiez NEXT_PUBLIC_SUPABASE_URL / ANON_KEY."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Radar className="h-6 w-6 text-clay-500" />
          <span className="font-display text-lg">Stock Relate</span>
        </div>

        <div className="mb-4 flex rounded-md border border-base-700 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded py-1.5 ${mode === "login" ? "bg-clay-500 text-base-950 font-medium" : "text-paper/60"}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded py-1.5 ${mode === "register" ? "bg-clay-500 text-base-950 font-medium" : "text-paper/60"}`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-paper/50">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-800 px-3 py-2 text-sm focus:border-clay-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-paper/50">Mot de passe</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-800 px-3 py-2 text-sm focus:border-clay-500 focus:outline-none"
            />
          </label>

          {error && (
            <p className="rounded-md bg-alert-500/10 border border-alert-500/30 px-3 py-2 text-xs text-alert-500">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-md bg-forest-600/10 border border-forest-600/30 px-3 py-2 text-xs text-forest-400">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-clay-500 py-2.5 text-sm font-medium text-base-950 hover:bg-clay-400 disabled:opacity-40"
          >
            {busy ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-paper/30">
          Connecté à {process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(NEXT_PUBLIC_SUPABASE_URL non définie)"}
        </p>
      </div>
    </div>
  );
}
