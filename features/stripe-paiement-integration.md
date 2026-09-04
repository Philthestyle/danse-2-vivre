# Feature: Stripe Paiement Integration
> Created: 2026-09-03 | Status: Phase 1 — Inspiration | Owner: @Daimyo (Faustin)
> Branch: `feat/stripe-paiement-integration`

## Context

Le site Danse 2 Vivre permet aujourd'hui aux adhérents de créer une adhésion via `/profil/adhesion` et reçoivent une **facture PDF pro-forma** (`/api/invoice/download`, commit `b9e7f92`). Mais **aucun paiement en ligne** n'est branché — le règlement se fait hors site. On veut intégrer Stripe pour encaisser les cotisations, tracker les paiements, et pouvoir donner à Allan une vue admin sur le CA en temps réel.

Schéma DB déjà en place :
- `public.memberships (id, profile_id, pack, city_id, status, starts_on, expires_on)`
- `public.payments (id, membership_id, amount_cents, currency, status, stripe_reference)` — table préparatoire, jamais écrite

Env vars réservées dans `.env.example` (commentées) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Inspiration

### Brainstorm Results

Angles couverts : @Shogun (marché/concurrents), @Sensei (archi), @Hanami (UX), @Kintsugi (soul asso).

| # | Idea | Source | Feasibility | Impact | Fit | Verdict |
|---|------|--------|:---:|:---:|:---:|:---:|
| 1 | **Stripe Checkout (session hosted)** — redirect vers page Stripe, webhook confirme, retour `/inscription/merci` | @Sensei | High | High | Strong | **BUILD** |
| 2 | Stripe Elements custom in-page (form embarqué) | @Sensei | Med | Med | Weak | DROP (over-engineered pour une asso) |
| 3 | **Choix pack tarifaire au moment du paiement** (adulte / enfant / couple / famille) — pricing table | @Hanami | High | High | Strong | **BUILD** |
| 4 | **Paiement en 3× sans frais** via Stripe (Klarna/Alma-like) — accessibilité financière | @Kintsugi | Med | High | Strong | **BUILD** (aide familles) |
| 5 | **Facture PDF finale après paiement** (numéro Stripe + timbre "PAYÉ") — remplace la pro-forma | @Sensei | High | High | Strong | **BUILD** |
| 6 | Abonnement récurrent annuel auto-renouvellement | @Shogun | Med | Med | Weak | DEFER (asso 1901 souvent renouvelle manuellement) |
| 7 | **Mode test/live togglable via env var** — QA sans risque en prod | @Sensei | High | High | Strong | **BUILD** (obligatoire) |
| 8 | **Email de confirmation adhérent + admin** post-paiement (via Supabase Auth ou Resend) | @Hanami | Med | High | Strong | **BUILD** |
| 9 | Bouton "faire un don libre" à côté de l'adhésion | @Kintsugi | High | Med | Med | DEFER (peut être v2) |
| 10 | **Vue admin `/admin/paiements`** — liste transactions, total CA, export CSV | @Shogun | High | High | Strong | **BUILD** |
| 11 | Reçu fiscal annuel (asso 1901 → défiscalisation 66%) | @Kintsugi | Med | High | Strong | DEFER (grosse feature à part) |
| 12 | Webhook Stripe → auto-update `memberships.status` + `payments` | @Sensei | High | High | Strong | **BUILD** (backbone technique) |

### Selected Ideas (à valider par @Daimyo)

Pré-sélection cohérente pour un v1 shippable rapidement :

1. **Stripe Checkout hosted** (#1) — backbone paiement
2. **Pricing table pack** (#3) — UX choix pack
3. **Facture PDF finale post-paiement** (#5) — ferme la boucle du #2 précédent
4. **Mode test/live togglable** (#7) — sécurité QA
5. **Email confirmation adhérent + admin** (#8) — trust + notification Allan
6. **Vue admin `/admin/paiements`** (#10) — Allan doit voir son CA
7. **Webhook Stripe** (#12) — technique, obligatoire

**Deferred (v2)** : 3× sans frais (#4), don libre (#9), reçu fiscal (#11), abonnement récurrent (#6).

## Synthesis
_pending Phase 2_

## Business Rules
_pending Phase 3_

## Test Plan
_pending Phase 4_

## Architecture
_pending Phase 5_

## Execution Plan
_pending Phase 5b_

## Implementation Log
_pending Phase 6_

## Review History
| Date | Phase | Reviewer | Decision | Notes |
|------|-------|----------|----------|-------|
| 2026-09-03 | 1 | @Daimyo | pending | 12 ideas brainstormed, 7 pré-sélectionnés, 5 differés |
