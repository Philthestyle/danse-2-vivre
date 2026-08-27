# Rapport d'audit — Danse 2 Vivre (Jalon 0)

> Généré le 2026-08-27 · conformément au §0 du brief.

## 1. État du dépôt existant

Le workspace `WEB-allan-titin-danse-2-vivre` ne contient que :

- `.gitignore` (basique, à enrichir pour Next.js)
- `.mcp.json` (Shikki MCP)
- `CLAUDE.md`, `README.md` (scaffolding Shikki)
- `Medias/` avec `Photo1.png` (hero — spectacle sur scène, 1920×1243) et `Photo2.png` (communauté — groupe, 652×640)

**Aucun code applicatif préexistant** dans ce workspace. Le dépôt distant `Philthestyle/danse-2-vivre` (privé) n'a **pas été cloné ici** ; ce chantier est démarré from scratch et devra être poussé sur ce dépôt privé existant (jamais sur un dépôt alternatif — cf. §22).

## 2. Inventaire Figma

⚠️ **Non accessible sans authentification** depuis cette session (Figma requiert un token). Références documentées dans le brief §7 :

- Accueil → « Slide 16:9 1 »
- Inscription → « Slides 16:9 3 et 4 »
- Professeurs → « Slide 16:9 11 »
- Actualités, admin, messagerie → à extrapoler

**Décision** : appliquer le design system inféré (voir `src/app/globals.css` + `tailwind.config.ts`) et itérer dès qu'un accès Figma est disponible. Aucune identité visuelle nouvelle inventée.

## 3. Arborescence des routes cibles

```
/                             → Accueil (5 sections : hero, qui-sommes-nous, professeurs, galerie, FAQ)
/actualites                   → Liste magazine
/actualites/[slug]            → Détail (published only)
/professeurs                  → Liste
/professeurs/[slug]           → Profil public
/calendrier                   → Vue mois/semaine/jour
/connexion
/inscription                  → Sans paiement (Phase 1)
/mot-de-passe-oublie
/reinitialiser-mot-de-passe
/profil                       → 🔒 auth
/profil/adhesion              → 🔒 auth · Phase 1 sans paiement
/messagerie                   → 🔒 auth · Realtime
/messagerie/[conversationId]  → 🔒 auth
/enseignant                   → 🔒 role=teacher · dashboard cours/groupes
/admin                        → 🔒 role=admin · sections professeurs, villes, cours, calendrier, galerie, actualités, FAQ, adhérents, groupes, adhésions
/api/s3/presign               → API route sécurisée (server-only credentials)
/api/auth/callback            → Supabase callback
sitemap.xml · robots.txt
```

## 4. Architecture composants & accès données

```
src/
  app/                        → App Router (RSC par défaut)
    (public)/                 → group route pages publiques
    (auth)/                   → connexion, inscription, mot-de-passe
    (private)/                → profil, messagerie, enseignant → middleware auth
    admin/                    → protégé role=admin
    api/                      → routes API server-only
  components/
    ui/                       → primitives (Button, Input, Card, Modal, Toast, Accordion, Carousel)
    layout/                   → Header, Footer, Nav, ThemeToggle, UserMenu
    features/                 → composants métier (TeacherCard, NewsCard, CalendarView, ChatWindow)
  lib/
    supabase/                 → client browser + server + admin (service-role côté server-only)
    s3/                       → helpers presign (server-only)
    auth/                     → guards, session helpers
    validation/               → zod schemas partagés client/server
    types/                    → database.types.ts généré depuis Supabase
  styles/                     → tokens.css (custom props), globals.css
supabase/
  migrations/                 → SQL versionnés, ordonnés, rejouables
  seed.sql                    → données dev sans PII réelle
```

Règles :
- **RSC par défaut**, `"use client"` uniquement pour interactivité (formulaires, carrousel, chat).
- Accès données : côté serveur via `createServerClient` (RLS honorée). Aucune requête sensible côté client sans RLS.
- Validation double : `zod` en client (UX) + revalidation server actions (sécurité).
- Types générés depuis Supabase (`supabase gen types typescript`).

## 5. Schéma Supabase proposé

Tables (§14) — toutes en `public`, avec `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at` (sauf mention).

| Table | Colonnes clés | Notes |
|---|---|---|
| `profiles` | `id uuid pk → auth.users.id`, `first_name`, `last_name`, `role enum(member,teacher,admin)`, `pack enum(classique,village)`, `city_id fk` | `role` non modifiable par user (trigger) |
| `cities` | `id`, `name unique`, `is_active bool` | seed initial |
| `teachers` | `id`, `profile_id fk → profiles`, `slug unique`, `speciality`, `photo_key`, `bio`, `started_at date` | photo via S3 key |
| `teacher_cities` | `teacher_id`, `city_id` | pk composite |
| `courses` | `id`, `teacher_id fk`, `city_id fk`, `title`, `description`, `starts_at`, `ends_at`, `recurrence jsonb` | |
| `course_groups` | `id`, `course_id fk`, `name`, `mode enum(normal,announcement_only)` | |
| `group_members` | `group_id`, `profile_id`, `joined_at` | pk composite |
| `conversations` | `id`, `kind enum(group,private)`, `group_id fk nullable`, `member_a fk nullable`, `member_b fk nullable` | contrainte : private ↔ jamais 2 members (cf. §13) |
| `conversation_members` | `conversation_id`, `profile_id` | pk composite |
| `messages` | `id`, `conversation_id fk`, `author_id fk`, `body`, `created_at` | Realtime enabled |
| `memberships` | `id`, `profile_id fk`, `pack`, `city_id fk nullable`, `status enum(pending,active,expired,cancelled)`, `starts_on`, `expires_on` | pas de prix Phase 1 |
| `payments` | structure préparatoire uniquement (id, membership_id, amount_cents nullable, status, stripe_ref nullable) | jamais alimentée Phase 1 |
| `news` | `id`, `slug unique`, `title`, `excerpt`, `content`, `image_key`, `author_id fk`, `status enum(draft,published)`, `published_at` | |
| `gallery` | `id`, `title`, `description`, `media_key`, `order_index`, `taken_at`, `is_active` | S3 key |
| `faq` | `id`, `question`, `answer`, `order_index`, `is_active` | |

Index : slugs, FK, `messages(conversation_id, created_at desc)`, `news(status, published_at desc)`.

## 6. Matrice rôles & permissions

Reprend §10 du brief. Appliquée à 3 niveaux : **UI**, **server actions / API**, **RLS**. Masquer un bouton ne protège rien.

## 7. Stratégie RLS

Principes :

- `select` public sur `cities(is_active=true)`, `teachers`, `courses`, `news(status='published')`, `gallery(is_active=true)`, `faq(is_active=true)`.
- `profiles` : select/update sur `id = auth.uid()` uniquement.
- `courses`, `course_groups` : update/delete réservés à `teacher_id = auth.uid()` OU `role = admin`.
- `conversations.private` : insert autorisé UNIQUEMENT si `(member_a.role, member_b.role)` ∈ {(member,teacher), (teacher,member)}. Contrainte CHECK + policy.
- `messages` insert : membre du `conversation_members` **ET** (`conversation.mode ≠ announcement_only` OU `profile.role ∈ {teacher,admin}`).
- `role` promotion : trigger `before update on profiles` refusant tout changement de `role` par un utilisateur non-admin.
- Un `security definer` sur les cas complexes (jamais pour bypass RLS).

Tests (§15) : scénarios positifs **et** négatifs pour anonyme, member, teacher, admin — écrits en SQL dans `supabase/tests/`.

## 8. Stratégie AWS S3 (bucket `danse-2-vivre` eu-west-3)

- Credentials AWS **exclusivement server-only** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` sans préfixe `NEXT_PUBLIC_`).
- Upload via API route `/api/s3/presign` :
  1. vérifie session Supabase
  2. vérifie rôle autorisé (admin ou teacher pour ses propres médias)
  3. valide MIME + taille depuis body (limites configurables via env)
  4. génère key non prédictible : `<category>/<uuid>-<basename>`
  5. renvoie URL POST pré-signée (durée courte, 5 min)
- Métadonnées (`key`, `mime`, `size`, `uploaded_by`) stockées en base après confirmation upload (route `/api/s3/confirm`).
- Delete : soft-delete en base + tombstone S3 lifecycle (à documenter).
- Fichiers publics servis via CDN CloudFront ou URL signée courte durée selon sensibilité.

## 9. Compatibilité GitHub Pages

**Verdict : incompatible pour l'app complète.**

Raisons :
- Next.js App Router avec RSC + Server Actions + API routes nécessite un runtime Node — GitHub Pages n'héberge que du statique.
- `next export` (`output: 'export'`) casse : API routes, middleware auth, Supabase server-client, S3 presign, Realtime auth cookies.

**Alternatives documentées** :
- Preview via **Vercel Preview** (gratuit, s'intègre à GitHub, aucune dégradation d'architecture).
- Ou preview d'une **landing statique** (page d'accueil seule sans données dynamiques) déployée sur GitHub Pages via `output: 'export'` sur un sous-projet — mais ne reflète pas l'app.
- Production finale : **OVH** (VPS ou managed Node) — cf. §2 du brief.

Le brief autorise explicitement « documenter précisément la limitation » : c'est fait ici et dans le README.

## 10. Risques, inconnues, décisions métier à confirmer

Points bloquants pour la mise en production (à faire confirmer — §23) :

1. **Police Caramel and Vanilla** : fichier + licence à fournir. Fallback temporaire : `next/font/google` (Great Vibes) documenté dans `globals.css`.
2. **Tarifs** Classique et Village → aucun prix affiché tant que non fourni.
3. **Durée d'adhésion** + règles renouvellement/expiration.
4. **Politique de suppression** (soft/hard delete) pour comptes, messages, actualités.
5. **Limites S3 finales** (taille max, MIME whitelist) — valeurs proposées : 10 Mo photos / 50 Mo vidéos, `image/jpeg|png|webp`, `video/mp4`.
6. **Redirect URLs Supabase Auth** (dev + preview + prod).
7. **OVH** : type d'hébergement précis (VPS Node vs managed) → impacte le build.

Aucun de ces points ne bloque le socle de Phase 1.

---

## Décision d'implémentation

Le brief autorise (§0) d'avancer de façon autonome sur les décisions techniques mineures. Passage direct au **Jalon 1 — Socle applicatif**.
