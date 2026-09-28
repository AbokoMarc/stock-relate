"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar, PackageCheck, MapPin, MessageCircle } from "lucide-react";
import { useAuth, AuthError } from "@/hooks/useAuth";
import LoginIllustration from "@/components/auth/LoginIllustration";

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
    <div className="grid min-h-screen lg:grid-cols-2 bg-white">
      {/* Panneau gauche : illustration de fond + argumentaire (masqué sur mobile) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-white">
        <LoginIllustration />
        <div className="relative z-10 flex items-center gap-2">
          <Radar className="h-7 w-7" strokeWidth={2.5} />
          <span className="font-display text-xl tracking-tight">Stock Relate</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-3xl leading-tight">
            Le stock, les commandes et l&apos;argent — au même endroit.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Yaoundé et Douala, un seul stock partagé en temps réel.
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" /> Commandes WhatsApp transcrites, à valider en un clic.
            </li>
            <li className="flex items-start gap-3">
              <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" /> Chaque mouvement de stock tracé, sans jamais de stock négatif.
            </li>
          </ul>
        </div>
      </div>

      {/* Panneau droit : formulaire */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <Radar className="h-6 w-6 text-sidebar" strokeWidth={2.5} />
              <span className="font-display text-lg">Stock Relate</span>
            </div>
            <span className="ml-auto text-[11px] text-paper/40">v0.1 · Connexion sécurisée</span>
          </div>

          <h1 className="font-display text-2xl text-paper">
            {mode === "login" ? "Connexion à Stock Relate" : "Créer votre compte"}
          </h1>
          <p className="mt-1 text-sm text-paper/50">
            {mode === "login"
              ? "Entrez vos identifiants pour accéder à votre espace."
              : "Le premier compte créé devient propriétaire (OWNER) de l'espace."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-paper/60">Email</span>
              <input
                type="email"
                required
                placeholder="vous@entreprise.cm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-base-700 bg-base-900 px-4 py-2.5 text-sm placeholder:text-paper/30 focus:border-clay-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-paper/60">Mot de passe</span>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-base-700 bg-base-900 px-4 py-2.5 text-sm placeholder:text-paper/30 focus:border-clay-500 focus:outline-none"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-alert-500/10 border border-alert-500/30 px-3 py-2 text-xs text-alert-500">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-forest-600/10 border border-forest-600/30 px-3 py-2 text-xs text-forest-600">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-clay-500 py-2.5 text-sm font-medium text-white hover:bg-clay-600 disabled:opacity-40"
            >
              {busy ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-paper/50">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => setMode("register")} className="font-medium text-clay-700 hover:underline">
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-clay-700 hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </div>

          <p className="mt-10 text-center text-[11px] text-paper/30">
            Besoin d&apos;aide ? Contactez l&apos;administrateur de votre espace.
          </p>
        </div>
      </div>
    </div>
  );
}
