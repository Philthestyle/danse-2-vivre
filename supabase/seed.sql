-- =============================================================================
-- Danse 2 Vivre — seed dev
-- Aucune donnée personnelle réelle. Pas de secrets.
-- Les professeurs initiaux (Paolo, Benjy, Hugo, Sophie, Tisoda) sont créés ici
-- côté données, JAMAIS dans les composants (brief §22).
-- =============================================================================

-- Villes
insert into public.cities (name, is_active) values
  ('Village central', true),
  ('Nord', true),
  ('Sud', true),
  ('Est', true),
  ('Ouest', true)
on conflict (name) do nothing;

-- FAQ
insert into public.faq (question, answer, order_index) values
  ('Comment rejoindre l''association ?',
   'L''inscription se fait en ligne depuis la page « Rejoindre ». Aucun paiement n''est demandé pour créer votre compte.', 1),
  ('Quelle est la différence entre les forfaits Classique et Village ?',
   'Le forfait Classique donne accès à une ville de votre choix. Le forfait Village donne accès à toutes les villes.', 2),
  ('Puis-je changer de ville ou de forfait en cours d''année ?',
   'Oui, contactez votre professeur ou l''administration via votre espace membre.', 3),
  ('Comment communiquer avec les autres membres ?',
   'Chaque cours dispose d''un groupe de discussion. Vous pouvez également contacter directement votre professeur.', 4);

-- Note : la création des professeurs se fait via l'administration une fois qu'un
-- compte auth.users existe pour chacun (contrainte teachers.profile_id).
-- Voir docs/SEED-TEACHERS.md pour la procédure sécurisée.
