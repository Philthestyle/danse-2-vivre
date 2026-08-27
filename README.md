# Danse 2 Vivre

> Site & application de l'association **Danse 2 Vivre** — construit selon le brief
> `BRIEF-CHIQUI-DANSE-2-VIVRE.md`.

**Stack** : Next.js 15 (App Router, RSC) · TypeScript strict · Tailwind CSS · Supabase (Auth + PostgreSQL + Realtime + RLS) · AWS S3 (bucket existant `danse-2-vivre` eu-west-3).

- 📋 **Audit d'architecture** : [`docs/AUDIT.md`](docs/AUDIT.md)
- 🎨 **Design tokens** : `src/app/globals.css` + `tailwind.config.ts`
- 🗄️ **Schéma + RLS** : `supabase/migrations/`

---

## 1. Prérequis

- **Node.js ≥ 20** (LTS)
- **npm ≥ 10** (ou pnpm)
- Un projet **Supabase existant** (le seul autorisé — cf. brief §2 : `fkutafmumvzzeyeeakxt`)
- Un bucket **AWS S3 existant** (le seul autorisé : `danse-2-vivre` région `eu-west-3`)

## 2. Installation

```bash
git clone git@github.com:Philthestyle/danse-2-vivre.git
cd danse-2-vivre
npm install
cp .env.example .env.local
# → remplir .env.local avec les vraies valeurs (jamais commiter)
```

## 3. Variables d'environnement

Voir `.env.example`. **Aucun secret ne doit être committé.** Les clés `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` sont **strictement server-only** (sans préfixe `NEXT_PUBLIC_`).

## 4. Base de données Supabase

Les migrations sont dans `supabase/migrations/` :

- `0001_init_schema.sql` — tables (§14 du brief) + triggers de sécurité (role guard, new-user handler)
- `0002_rls_policies.sql` — Row Level Security (§15 du brief)

Appliquer (avec le CLI Supabase) :

```bash
# À la racine du projet (Supabase CLI liée au projet fkutafmumvzzeyeeakxt)
supabase link --project-ref fkutafmumvzzeyeeakxt
supabase db push
# seed dev (villes, FAQ)
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
# générer les types TS
npm run db:types
```

⚠️ **Ne jamais désactiver RLS pour contourner un problème de développement** (brief §22).

## 5. Auth Supabase

Configurer dans Supabase Dashboard :

- **Site URL** : URL de dev/preview/prod
- **Redirect URLs** :
  - `http://localhost:3000/api/auth/callback`
  - `http://localhost:3000/reinitialiser-mot-de-passe`
  - URL de production correspondante

L'inscription fonctionne sans paiement. Le trigger `on_auth_user_created` crée automatiquement le `profiles` associé (rôle `member` par défaut, non modifiable par l'utilisateur).

## 6. AWS S3

Le bucket `danse-2-vivre` (eu-west-3) est utilisé pour :

- photos des professeurs (`teacher/`)
- galerie (`gallery/`)
- images des actualités (`news/`)
- avatars (`avatar/`)

L'upload passe **exclusivement** par la route serveur `/api/s3/presign` qui :

1. vérifie la session Supabase ;
2. valide le rôle et la catégorie ;
3. valide MIME + taille via `S3_MAX_UPLOAD_BYTES` et `S3_ALLOWED_MIME` ;
4. génère une clé non prédictible ;
5. renvoie un POST pré-signé (5 min).

**Les credentials AWS ne quittent jamais le serveur.**

## 7. Lancement local

```bash
npm run dev
# → http://localhost:3000
```

## 8. Tests

```bash
npm test           # tests unitaires (à écrire, cf. brief §20)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## 9. Build de production

```bash
npm run build
npm start
```

## 10. Preview GitHub Pages

Un build **statique** est déployé sur GitHub Pages via `.github/workflows/gh-pages.yml`.

**⚠️ Limites documentées (cf. `docs/AUDIT.md §9`)** :

- GitHub Pages ne sert que du contenu **statique** (pas de Node runtime).
- Le build de preview exclut : API routes, middleware auth, `output: export` désactive les server actions.
- **Fonctionnent en preview** : accueil, actualités (liste + détail), professeurs (liste + profils), calendrier, FAQ.
- **N'apparaissent qu'en placeholder** : profil, adhésion, messagerie, admin, connexion réelle (formulaires visibles mais non fonctionnels sans backend).

**Alternative recommandée** pour prévisualiser l'app complète : Vercel Preview (compatible RSC + API routes gratuitement).

Pour rebuilder localement le static :

```bash
npm run build:static  # → ./out
npx serve out         # test local du bundle statique
```

## 11. Déploiement OVH (Phase production)

L'application complète se déploie sur un runtime Node (OVH VPS, Managed Node ou équivalent) :

```bash
npm ci --omit=dev
npm run build
NODE_ENV=production npm start
```

Configuration recommandée :

- Reverse proxy (nginx) devant `next start`
- HTTPS obligatoire (Let's Encrypt)
- Env vars injectées via le panneau OVH (jamais dans le repo)

Documentation OVH précise à finaliser une fois le type d'hébergement confirmé (cf. AUDIT §10.7).

## 12. Phase 2 — Stripe

**Non implémenté en Phase 1** (brief §4). Structure préparatoire présente :

- table `payments` (préparatoire, jamais alimentée en Phase 1)
- section « Mon adhésion » sans paiement réel
- CTA de paiement désactivé avec libellé non trompeur

À prévoir en Phase 2 : Checkout Session, webhook serveur, activation d'adhésion post-webhook.

---

## Structure

```
src/
  app/                    # App Router Next.js
    (public routes)/      # /, /actualites, /professeurs, /calendrier
    connexion, inscription, mot-de-passe-oublie, reinitialiser-mot-de-passe
    profil/, messagerie/  # protégé middleware auth
    admin/                # protégé middleware admin + double-check server + RLS
    api/                  # server-only : auth/callback, auth/signout, s3/presign
  components/
    layout/               # Header, Footer, Nav mobile
    theme/                # ThemeProvider + toggle light/dark
    features/             # TeacherCarousel, FaqAccordion
  lib/
    supabase/             # client browser / server / admin
    s3/                   # presign server-only
    validation/           # schemas zod (auth, ...)
    data/seed.ts          # données de démonstration (pas de codage en composants)
supabase/
  migrations/             # SQL versionnés
  seed.sql                # données dev sans PII
docs/
  AUDIT.md                # rapport d'architecture Jalon 0
scripts/
  build-static.sh         # build preview GitHub Pages
```

## Sécurité — rappels non négociables

Cf. brief §22. **Ne pas** :

- créer un nouveau repo, projet Supabase ou bucket S3 ;
- rendre le repo public ;
- committer des secrets ou clés ;
- exposer service_role ou credentials AWS côté navigateur ;
- désactiver RLS pour contourner un problème de dev ;
- se fier au frontend seul pour une autorisation ;
- inventer des prix, durées ou règles métier sans validation.

---

_Généré selon le brief consolidé du 27 août 2026._
