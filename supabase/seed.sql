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

-- FAQ (ordre Figma slide 12 + questions historiques en bonus, à valider par Allan via /admin/faq)
insert into public.faq (question, answer, order_index) values
  ('Le pass sport est-il accepté ?',
   'Oui, le Pass''Sport est accepté pour les adhérents éligibles (jeunes 14-17 ans, étudiants boursiers, adultes en situation de handicap). Contactez-nous pour connaître les modalités précises.', 1),
  ('Où êtes-vous situés ?',
   'Nous intervenons dans plusieurs villages (Nangis, Bois-le-Roi, Montpellier, et d''autres). Consultez la page Calendrier pour voir les cours par ville et vérifier les horaires près de chez vous.', 2),
  ('À partir de quel âge peut-on s''inscrire ?',
   'Les cours sont ouverts dès 6 ans. Nous proposons des groupes adaptés aux enfants, aux ados et aux adultes.', 3),
  ('Quels sont les tarifs ?',
   'Deux forfaits sont proposés : Classique (une ville) et Village (toutes nos villes). Le montant précis vous est communiqué à l''inscription en fonction de votre âge et du forfait choisi.', 4),
  ('Qu''est ce que le « Forfait Village » ?',
   'Le Forfait Village vous donne accès à toutes les villes où nous intervenons, contrairement au Forfait Classique qui est limité à une seule ville.', 5),
  ('Quels sont les moyens de paiement disponibles ?',
   'Nous acceptons les paiements par carte bancaire, virement, chèque et espèces. Le Pass''Sport est également accepté pour les bénéficiaires.', 6),
  ('Quel matériel faut-il prévoir ?',
   'Une tenue confortable et des chaussures propres réservées à la salle. Une gourde d''eau est recommandée. Aucun autre matériel spécifique n''est requis.', 7),
  ('Vos adhérents participent-ils à des événements ?',
   'Oui, nos adhérents participent régulièrement à notre spectacle annuel, à des battles, à des stages et à divers événements dans la région tout au long de l''année.', 8),
  ('Proposez-vous des stages ?',
   'Oui, nous organisons des stages pendant les vacances scolaires et à l''occasion d''événements spéciaux. Consultez le Calendrier pour les prochaines dates.', 9),
  ('Comment rejoindre l''association ?',
   'L''inscription se fait en ligne depuis la page « S''inscrire ». Aucun paiement n''est demandé pour créer votre compte.', 10),
  ('Puis-je changer de ville ou de forfait en cours d''année ?',
   'Oui, contactez votre professeur ou l''administration via votre espace membre. Nous vous accompagnerons pour ajuster votre adhésion.', 11),
  ('Comment communiquer avec les autres membres ?',
   'Chaque cours dispose d''un groupe de discussion. Vous pouvez également contacter directement votre professeur depuis la messagerie de votre espace membre.', 12)
on conflict do nothing;

-- Note : la création des professeurs se fait via l'administration une fois qu'un
-- compte auth.users existe pour chacun (contrainte teachers.profile_id).
-- Voir docs/SEED-TEACHERS.md pour la procédure sécurisée.
