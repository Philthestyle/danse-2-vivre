-- Contenu FAQ Danse 2 Vivre — fourni par Allan (QA Pass 3, 2026-09-02).
-- Remplace les entrées existantes (seed générique + tests) par les 8 questions
-- officielles.

begin;

-- Purge existant (les seed initiaux + entrées de test).
delete from public.faq;

insert into public.faq (question, answer, order_index, is_active) values
  (
    'Où êtes-vous basés ?',
    'Notre siège social est situé à Lieusaint (5 Impasse du Moulin à Vent, 77127 Lieusaint), mais nous intervenons dans une dizaine de villes du 77 au 91 pour vous proposer nos services.',
    1,
    true
  ),
  (
    'À quel âge peut-on s''inscrire dans votre Association ?',
    'Dès 4 ans si le cours d''essai est favorable, sinon 5 ans, jusqu''à l''âge que vous désirez (les adultes sont acceptés).',
    2,
    true
  ),
  (
    'Quel est le prix pour s''inscrire ?',
    'Pour les nouveaux adhérents : l''adhésion à 1 cours par semaine est à 250 €, et le forfait village à 300 €.',
    3,
    true
  ),
  (
    'Que veut dire « forfait village » ?',
    'Le forfait village est la plus-value de notre Association : l''adhérent peut participer chaque semaine à 3 cours maximum, dans les villes qu''il désire au sein de l''Association.',
    4,
    true
  ),
  (
    'Acceptez-vous les chèques vacances ou autres moyens de paiement ?',
    'Nous acceptons uniquement les paiements en plusieurs fois (3 fois maximum) par virement, chèque ou espèces.',
    5,
    true
  ),
  (
    'Quel matériel pour prendre des cours ?',
    'Des chaussures propres d''intérieur, une tenue de sport et une bouteille d''eau.',
    6,
    true
  ),
  (
    'Proposez-vous des spectacles pour les adhérents ?',
    'Nous organisons 2 à 3 fois par an des battles où les enfants peuvent participer (avec des enfants de leur niveau). Nous proposons aussi des démonstrations ponctuelles au cours de l''année. Enfin, nous organisons les plus grosses compétitions de break dance en France et dans le Monde — l''occasion pour nos adhérents de venir admirer les meilleurs de notre discipline. (PS : nos adhérents sont toujours les premiers informés des battles organisés.)',
    7,
    true
  ),
  (
    'Proposez-vous des stages ?',
    'Nous proposons des stages très régulièrement dans l''année (sauf pendant les vacances de Noël), généralement animés par 2 à 3 professeurs de notre Association.',
    8,
    true
  );

commit;
