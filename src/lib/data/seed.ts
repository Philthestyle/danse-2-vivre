/**
 * Données de démonstration pour la preview statique / mode dev sans Supabase.
 *
 * En production, ces données sont remplacées par des requêtes vers Supabase.
 * Aucune donnée métier ne doit être codée en dur dans les composants — c'est
 * pourquoi ce module existe : un point unique clairement identifié comme
 * "seed dev / preview only" (cf. brief §3, §22).
 */

export interface SeedTeacher {
  slug: string;
  firstName: string;
  lastName: string;
  speciality: string;
  cities: string[];
  startedAt: string;
  bio: string;
  photoUrl?: string;
}

export interface SeedNews {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface SeedFaq {
  question: string;
  answer: string;
}

export interface SeedCourse {
  title: string;
  teacher: string;
  city: string;
  startsAt: string;
  endsAt: string;
  description?: string;
}

// Professeurs initiaux — brief §8.1
export const seedTeachers: SeedTeacher[] = [
  {
    slug: "paolo",
    firstName: "Paolo",
    lastName: "",
    speciality: "Salsa & Bachata",
    cities: ["Village central", "Nord"],
    startedAt: "2019-09-01",
    bio: "Passionné de danses latines, Paolo transmet la joie et l'énergie de la scène depuis 2019.",
  },
  {
    slug: "benjy",
    firstName: "Benjy",
    lastName: "",
    speciality: "Hip-Hop",
    cities: ["Sud", "Village central"],
    startedAt: "2020-01-15",
    bio: "Benjy amène le hip-hop dans les villages avec exigence, humour et bienveillance.",
  },
  {
    slug: "hugo",
    firstName: "Hugo",
    lastName: "",
    speciality: "Contemporain",
    cities: ["Est"],
    startedAt: "2018-10-05",
    bio: "Chorégraphe et danseur, Hugo explore la matière et l'émotion du geste contemporain.",
  },
  {
    slug: "sophie",
    firstName: "Sophie",
    lastName: "",
    speciality: "Classique & Modern Jazz",
    cities: ["Ouest", "Village central"],
    startedAt: "2017-09-01",
    bio: "Formée au conservatoire, Sophie enseigne la rigueur du classique et la liberté du modern jazz.",
  },
  {
    slug: "tisoda",
    firstName: "Tisoda",
    lastName: "",
    speciality: "Afro & Danses urbaines",
    cities: ["Sud", "Est"],
    startedAt: "2021-02-10",
    bio: "Tisoda fait vibrer les danses africaines et urbaines dans une même énergie.",
  },
];

export const seedNews: SeedNews[] = [
  {
    slug: "spectacle-annuel-2026",
    title: "Retour sur le spectacle annuel 2026",
    excerpt:
      "Une salle comble, cinq professeurs, plus de deux cents élèves : le spectacle 2026 restera dans les mémoires.",
    content:
      "Salle comble. Les projecteurs se sont allumés sur nos élèves après des mois de préparation. Merci à toute la communauté d'avoir répondu présent.",
    author: "L'équipe D2V",
    publishedAt: "2026-06-22T20:00:00Z",
    imageUrl: "/images/hero.png",
  },
  {
    slug: "nouvelle-saison-inscriptions-ouvertes",
    title: "Nouvelle saison : les inscriptions sont ouvertes",
    excerpt:
      "Rejoignez-nous dès maintenant pour la saison 2026-2027 : nouveaux forfaits, nouveaux villages, mêmes valeurs.",
    content:
      "Deux formules cette année : Classique (une ville) et Village (accès à toutes les villes). Les inscriptions se font en ligne — sans paiement anticipé.",
    author: "Direction Danse 2 Vivre",
    publishedAt: "2026-08-20T09:00:00Z",
    imageUrl: "/images/community.png",
  },
];

export const seedFaq: SeedFaq[] = [
  {
    question: "Le pass sport est-il accepté ?",
    answer:
      "Oui, le Pass'Sport est accepté pour les adhérents éligibles (jeunes 14-17 ans, étudiants boursiers, adultes en situation de handicap). Contactez-nous pour connaître les modalités précises.",
  },
  {
    question: "Où êtes-vous situés ?",
    answer:
      "Nous intervenons dans plusieurs villages (Nangis, Bois-le-Roi, Montpellier, et d'autres). Consultez la page Calendrier pour voir les cours par ville et vérifier les horaires près de chez vous.",
  },
  {
    question: "À partir de quel âge peut-on s'inscrire ?",
    answer:
      "Les cours sont ouverts dès 6 ans. Nous proposons des groupes adaptés aux enfants, aux ados et aux adultes.",
  },
  {
    question: "Quels sont les tarifs ?",
    answer:
      "Deux forfaits sont proposés : Classique (une ville) et Village (toutes nos villes). Le montant précis vous est communiqué à l'inscription en fonction de votre âge et du forfait choisi.",
  },
  {
    question: "Qu'est ce que le « Forfait Village » ?",
    answer:
      "Le Forfait Village vous donne accès à toutes les villes où nous intervenons, contrairement au Forfait Classique qui est limité à une seule ville.",
  },
  {
    question: "Quels sont les moyens de paiement disponibles ?",
    answer:
      "Nous acceptons les paiements par carte bancaire, virement, chèque et espèces. Le Pass'Sport est également accepté pour les bénéficiaires.",
  },
  {
    question: "Quel matériel faut-il prévoir ?",
    answer:
      "Une tenue confortable et des chaussures propres réservées à la salle. Une gourde d'eau est recommandée. Aucun autre matériel spécifique n'est requis.",
  },
  {
    question: "Vos adhérents participent-ils à des événements ?",
    answer:
      "Oui, nos adhérents participent régulièrement à notre spectacle annuel, à des battles, à des stages et à divers événements dans la région tout au long de l'année.",
  },
  {
    question: "Proposez-vous des stages ?",
    answer:
      "Oui, nous organisons des stages pendant les vacances scolaires et à l'occasion d'événements spéciaux. Consultez le Calendrier pour les prochaines dates.",
  },
  {
    question: "Comment rejoindre l'association ?",
    answer:
      "L'inscription se fait en ligne depuis la page « S'inscrire ». Aucun paiement n'est demandé pour créer votre compte.",
  },
  {
    question: "Puis-je changer de ville ou de forfait en cours d'année ?",
    answer:
      "Oui, contactez votre professeur ou l'administration via votre espace membre. Nous vous accompagnerons pour ajuster votre adhésion.",
  },
  {
    question: "Comment communiquer avec les autres membres ?",
    answer:
      "Chaque cours dispose d'un groupe de discussion. Vous pouvez également contacter directement votre professeur depuis la messagerie de votre espace membre.",
  },
];

export const seedCourses: SeedCourse[] = [
  {
    title: "Cours de Salsa débutant",
    teacher: "Paolo",
    city: "Village central",
    startsAt: "2026-09-05T19:00:00Z",
    endsAt: "2026-09-05T20:30:00Z",
  },
  {
    title: "Atelier Hip-Hop ados",
    teacher: "Benjy",
    city: "Sud",
    startsAt: "2026-09-06T14:00:00Z",
    endsAt: "2026-09-06T15:30:00Z",
  },
  {
    title: "Contemporain adultes",
    teacher: "Hugo",
    city: "Est",
    startsAt: "2026-09-07T18:30:00Z",
    endsAt: "2026-09-07T20:00:00Z",
  },
  {
    title: "Modern Jazz",
    teacher: "Sophie",
    city: "Ouest",
    startsAt: "2026-09-08T17:00:00Z",
    endsAt: "2026-09-08T18:30:00Z",
  },
];

export const seedGallery = [
  { title: "Spectacle 2026 — scène", imageUrl: "/images/hero.png" },
  { title: "La communauté Danse 2 Vivre", imageUrl: "/images/community.png" },
];
