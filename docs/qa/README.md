# QA — Documentation

## Outil interactif

<https://danse-2-vivre-263.netlify.app/qa/>

- Multi-testeurs (chaque pseudo = une session isolée sauvegardée en base
  Supabase, table `qa_sessions`).
- Fallback localStorage si la DB n'est pas joignable.
- Source : `public/qa/index.html` (fichier statique).
- Endpoint config : `src/app/api/qa/config/route.ts` (expose URL + anon key
  publique à l'outil).
- Migration DB : `supabase/migrations/0004_qa_sessions.sql`.

## Fichiers de ce dossier

- [`history.md`](./history.md) — journal chronologique des passes QA + fixes shippés.
- [`2026-08-28-allan-retours.md`](./2026-08-28-allan-retours.md) — retours bruts Allan (pass 1).

## Ajouter un nouveau pass

1. Créer `2026-XX-XX-<tester>-retours.md` avec les retours bruts.
2. Ajouter une section `## Pass N — <tester> · YYYY-MM-DD` dans `history.md`
   avec le tableau des fixes shippés (fichier / priorité / statut).
3. Mettre à jour les SEED de `public/qa/index.html` si nécessaire (nouveaux
   flows à tester).
