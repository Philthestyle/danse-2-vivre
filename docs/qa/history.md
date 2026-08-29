# QA — Historique des passes

Journal chronologique des retours QA + fixes shippés. À mettre à jour à chaque
pass de test.

Outil de QA interactive : <https://danse-2-vivre-263.netlify.app/qa/>
(multi-testeurs, sauvegarde Supabase par pseudo, chaque testeur a sa session).

---

## Pass 1 — Allan · 2026-08-28

**Source** : 6 vocaux Allan (22:10 → 22:13) — archivés dans
[`2026-08-28-allan-retours.md`](./2026-08-28-allan-retours.md).

**Scope testé** : partie "en ligne" (connexion, profils, messagerie).

### Fixes shippés le 2026-08-29 (PR feat/ui-figma-pixel-perfect → develop)

| # | Zone | Priorité | Fichier(s) principaux | Statut |
|---|------|----------|-----------------------|--------|
| 1 | Header état loggé — liens Espace membre + Déconnexion | 🔴 P1 | `src/components/layout/Header.tsx`, `HeaderClient.tsx` | ✅ shipped |
| 2 | Bloc "Adhésion" masqué pour admin & prof | 🔴 P1 | `src/app/profil/page.tsx`, `src/app/profil/adhesion/page.tsx` | ✅ shipped |
| 3 | Bouton "Contacter" prof → `mailto:` direct | 🔴 P1 | `src/app/professeurs/[slug]/page.tsx`, `src/lib/teachers.ts` (ajout `getTeacherEmail`) | ✅ shipped |
| 4 | Messagerie prof — création convo/groupe | 🟠 P2 | — | ⏸ **spec en attente Allan** — ne rien coder |
| 5 | Mention paiement retirée de la page inscription | 🟢 P3 | `src/app/inscription/SignupForm.tsx` | ✅ shipped |

**Also**:
- Ancien `src/components/features/ContactTeacherButton.tsx` supprimé (plus utilisé).
- Migration `supabase/migrations/0004_qa_sessions.sql` : table de sessions QA
  multi-testeurs pour l'outil interne `/qa/`.
- Nouvelle route `src/app/api/qa/config/route.ts` : expose URL + anon key
  Supabase à l'outil QA statique.

### À jouer manuellement (QA après déploiement)

Ouvrir <https://danse-2-vivre-263.netlify.app/qa/>, choisir son pseudo, et
rejouer les flows :

- **Login / Logout flow** — vérifier "Espace membre" + "Déconnexion" visibles quand loggé
- **Profil Prof** et **Profil Admin** — vérifier absence du bloc Adhésion
- **Contacter un professeur** — vérifier ouverture `mailto:` avec l'email du prof
- **Register flow** — vérifier absence de la fieldset paiement

---

## Pass 2 — à venir (Allan · CRUD create/edit/delete)

En attente des retours Allan sur CRUD contenu (fin de soirée 2026-08-28 ou 2026-08-29).
