# Retours Allan — Danse2Vivre

**Source** : 6 messages vocaux du 2026-08-28 (22:10 → 22:13)
**Fichiers** : `~/Downloads/Danse2vivre-audio-files/AUDIO-2026-08-28-22-1*.m4a`
**Contexte** : premier pass QA de la partie "en ligne" du site (connexion, profils, messagerie). Allan poursuit les tests demain (création / suppression / edit).

---

## 1. Navigation / Header — après connexion  🔴 P1

**Symptôme** : une fois connecté, l'utilisateur arrive bien sur son espace membre, mais s'il en sort il n'a **aucun moyen d'y revenir** depuis le header. Le bouton "Connexion" reste affiché comme s'il n'était pas loggé.

**À faire** :
- Quand l'utilisateur est authentifié, remplacer / compléter le bouton "Connexion" par :
  - un lien **"Espace membre"** (retour au dashboard)
  - un bouton **"Déconnexion"**
- Les deux liens doivent coexister dans le header en état loggé.

---

## 2. Bloc "Adhésion" affiché à tort  🔴 P1

**Symptôme** : le bloc / section "Adhésion" apparaît sur les profils **admin** et **professeur**, alors qu'il ne devrait être visible que pour les **membres**.

**À faire** :
- Conditionner l'affichage du bloc adhésion au rôle `member` uniquement.
- Masquer pour `admin` et `professor`.

---

## 3. Bouton "Contacter" sur la fiche professeur  🔴 P1

**Symptôme** : cliquer sur "Contacter" depuis la page d'un prof déclenche une erreur — le comportement actuel tente de créer une conversation interne.

**Décision produit d'Allan** : ce bouton ne doit **pas** ouvrir la messagerie interne. Il doit simplement **envoyer un mail** au professeur (on a déjà son email).

**À faire** :
- Remplacer l'action "créer conversation" par un `mailto:` (ou un formulaire de contact qui envoie un email) vers l'adresse du prof.
- Comportement identique **que l'utilisateur soit connecté ou non**.

---

## 4. Messagerie côté professeur  🟠 P2 — à repenser

**Symptôme** : en tant que prof, impossible de créer une conversation ou un groupe. Le flux "en fonction de ma ville / etc." n'est pas clair.

**Statut** : Allan reconnaît que son idée initiale n'est **pas si simple à implémenter**. Il se met dessus et enverra une nouvelle proposition **en fin de soirée ou demain**.

**À faire de notre côté** : **ne rien coder pour l'instant**, attendre la nouvelle spec d'Allan sur la messagerie prof (création conversation / groupe, critères ville, etc.).

**Note** : côté profil user (membre), l'absence de création de conversation/groupe est **normale et voulue** — ne pas modifier.

---

## 5. Message paiement sur la page d'inscription  🟢 P3 (nice-to-have)

**Symptôme** : un message concernant le paiement s'affiche en bas de la page d'inscription.

**Décision** : le paiement doit vivre dans le **profil**, pas à l'inscription — même si le Figma actuel le place à l'inscription. C'est un point de **phase 2**, non bloquant.

**À faire** :
- Retirer / masquer la mention paiement sur la page d'inscription.
- Prévoir l'emplacement paiement **dans le profil membre** pour la phase 2.

---

## 6. Ce qui fonctionne ✅

- Connexion avec identifiants → redirection espace membre : **OK**
- Profil user (membre) sans bloc création conversation/groupe : **comportement voulu, OK**

---

## Récap actions triées

| # | Zone | Priorité | Action |
|---|------|----------|--------|
| 1 | Header (état loggé) | 🔴 P1 | Ajouter liens "Espace membre" + "Déconnexion" |
| 2 | Profils admin & prof | 🔴 P1 | Masquer le bloc adhésion |
| 3 | Fiche prof — bouton Contacter | 🔴 P1 | Remplacer conversation interne par mail direct |
| 4 | Messagerie prof (création convo/groupe) | 🟠 P2 | **Attendre nouvelle spec Allan** |
| 5 | Inscription — mention paiement | 🟢 P3 | Retirer, déplacer paiement dans profil (phase 2) |

---

## Suite

Allan continue son QA — **création / suppression / edit** de la partie en ligne. Retours suivants attendus **fin de soirée ou demain**.
