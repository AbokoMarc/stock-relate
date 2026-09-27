# Stock Relate — Frontend (Next.js + Supabase + Worker Cloudflare)

Ce dépôt est un des trois qui composent Stock Relate :

| Dépôt | Rôle |
|---|---|
| **stock-relate** (celui-ci) | Frontend Next.js — PWA responsive |
| `stock-relate-supabase` | Schéma PostgreSQL, RLS, fonction atomique de mouvement de stock |
| `stock-relate-worker` | Worker Cloudflare — agents IA (Groq/Gemini), webhooks WhatsApp/MoMo, cron nocturne |

## Historique de l'architecture (pour ne pas se perdre)

1. V1 : tout en local (IndexedDB), aucun backend — pour valider l'UI vite.
2. V2 : ajout d'un backend Spring Boot + PostgreSQL (sur votre demande, pour réutiliser vos
   patterns VOGT/TransCam) — **abandonné ensuite**.
3. **V3 (actuel)** : Cloudflare Workers + Supabase, conformément à votre document "V8 — le
   parasite ultime". C'est la version que vous devez pousser et tester.

Le code Spring Boot n'est plus maintenu à partir d'ici — ne repartez pas dessus par erreur.

## Ce qui est réellement branché (pas une démo)

Toutes les pages sont branchées sur Supabase, **et le Worker est maintenant réellement
appelé depuis l'interface** (ça ne l'était pas dans la version précédente — les boutons
caméra/facture étaient décoratifs) :

- Authentification, Inventaire, Mouvements (RPC atomique), Clients, Fournisseurs,
  Fintech/Escrow, Dashboard.
- **Brouillons WhatsApp** (`/drafts`, nouvelle page) : affiche les commandes vocales/textes
  transcrites par le Worker (`draft_orders`), avec association manuelle de chaque ligne
  devinée à un vrai produit avant de créer les mouvements de sortie correspondants. C'était
  le trou signalé précédemment — le Worker déposait des brouillons que personne ne voyait.
- **Import de facture (Vision AI)**, sur la page Mouvements : prend une photo, appelle
  `POST /agents/vision` sur le Worker pour de vrai, affiche les lignes extraites pour
  validation humaine avant de créer les entrées de stock.
- **Scan de code-barres**, sur l'Inventaire : utilise l'API navigateur `BarcodeDetector`.
  Fonctionne sur Chrome/Edge (desktop et Android) ; sur Safari/iOS et Firefox, qui ne la
  supportent pas encore, un message clair invite à saisir le SKU à la main plutôt qu'un
  bouton qui ne fait rien silencieusement.

## File d'attente hors-ligne (produits uniquement)

Créer un produit sans réseau ne échoue plus : l'écriture est mise en file (`src/lib/outbox.ts`,
table `outbox` d'IndexedDB) et rejouée automatiquement au retour du réseau ou toutes les
minutes. Un badge dans la barre du haut indique le nombre d'écritures en attente.

**Les mouvements de stock n'ont volontairement PAS cette file d'attente** : un mouvement
rejoué plus tard casserait la garantie d'atomicité de `create_movement` (deux mouvements en
attente sur le même produit, rejoués dans le mauvais ordre, peuvent faire passer un stock en
négatif sans que personne ne s'en aperçoive). Un mouvement hors-ligne échoue proprement avec
un message clair plutôt que de risquer un stock qui ment.

## Rôles réellement appliqués (RLS), pas juste affichés

Exécutez `stock-relate-supabase/002_rbac.sql` (après `schema.sql`) pour activer les rôles
OWNER/ADMIN/MAGASINIER au niveau de la base — voir le tableau des permissions dans le README
Supabase. Avant cette migration, "authentifié = accès à tout" était vrai pour de vrai, pas
juste cosmétique comme l'ancien texte de ce README le disait.

## Démarrage

```bash
npm install
cp .env.local.example .env.local
# Renseignez NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (voir
# stock-relate-supabase/README.md) et NEXT_PUBLIC_WORKER_URL (voir stock-relate-worker/README.md)
npm run dev
```

Ouvrez http://localhost:3000, créez un compte via `/onboarding` (devient OWNER
automatiquement), vous arrivez sur le dashboard. Testez le mode hors-ligne sur l'Inventaire
(coupez le wifi après un premier chargement réussi) : la liste reste affichée depuis le
cache, et créer un produit le met en file au lieu d'échouer.

## Pour tester en prod

1. Déployez `stock-relate-supabase/schema.sql` PUIS `002_rbac.sql` sur votre projet Supabase.
2. Déployez `stock-relate-worker` sur Cloudflare (`wrangler deploy`) avec ses secrets — y
   compris les nouveaux (Kafka/Upstash) s'il vous intéressent, voir son README.
3. Configurez les Database Webhooks Supabase (Database > Webhooks) vers les routes
   `/hooks/db/movement` et `/hooks/db/escrow-status` du Worker, si vous voulez que Kafka
   reçoive vraiment les événements.
4. Le Worker gère déjà le CORS (`origin: "*"` sur `/agents/*`) — resserrez-le à votre seul
   domaine de prod une fois en ligne si vous préférez.
4. Déployez ce frontend sur Cloudflare Pages (ou Vercel/Netlify), avec les 3 variables
   d'environnement `NEXT_PUBLIC_*` ci-dessus renseignées dans les paramètres du projet.

## Thème visuel et pages, alignés sur votre maquette Uizard

Le thème est passé au clair (fond blanc, sidebar orange pleine) pour coller à vos captures
d'origine — voir `tailwind.config.ts`. Deux pages ont été ajoutées pour couvrir des sections
que la maquette avait et que le premier jet n'avait pas :
- **Entrepôts** (`/warehouses`) : cartes par site (Yaoundé/Douala) avec valeur de stock,
  unités, produits critiques — équivalent de la grille "Warehouses" de la maquette, mais sur
  vos deux vrais sites plutôt que des noms d'exemple (Manchester, Chicago…).
- **Statistiques** (`/statistics`) : graphiques réels (recharts) — mouvements des 14 derniers
  jours, valeur du stock par catégorie — calculés depuis vos données Supabase, pas des
  chiffres d'exemple.

Le Dashboard a aussi un mini-graphique d'activité sur 7 jours, comme le "Sales" de la
maquette.

## Structure du projet

- `src/app/*/page.tsx` — les 11 pages (Dashboard, Inventaire, Mouvements, Entrepôts,
  Statistiques, Fournisseurs, Clients, Fintech, Brouillons WhatsApp, Réglages, Onboarding) —
  toutes branchées.
- `src/lib/worker.ts` — client pour appeler le Worker Cloudflare (transcription, vision, TTS),
  authentifié avec le token de session Supabase.
- `src/lib/supabase.ts` — client Supabase (clé publique `anon`, protégée par RLS).
- `src/lib/outbox.ts` — file d'attente d'écriture hors-ligne (produits uniquement).
- `src/lib/db.ts` + `mock-data.ts` — cache de secours IndexedDB pour l'Inventaire hors-ligne.
- `src/hooks/use*.ts` — un hook par domaine (`useAuth`, `useProducts`, `useMovements`,
  `useClients`, `useSuppliers`, `useEscrow`, `useSuggestions`, `useActivity`), tous suivant
  le même pattern Supabase.

## Limites connues, assumées

- Seule la création de produit a une file d'attente hors-ligne — pas les mouvements (par
  choix, voir plus haut), ni les autres domaines (clients, fournisseurs, escrow) pour
  l'instant.
- Le "compte séquestre" MoMo reste, comme signalé depuis le début, un flux de paiement direct
  au compte marchand tant qu'aucun partenariat PSP licencié n'est en place — aucun
  changement d'architecture ne lève cette limite légale, et ça ne changera pas sur demande.
