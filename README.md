# SCHOLARFIND — Plateforme Intelligente de Bourses d'Études (B2B2C)

> **Conception et implémentation d'un système automatisé de recherche, de recommandation et de vérification explicable d'éligibilité aux bourses d'études.**

---

## 1. Présentation du Projet

**SCHOLARFIND** est une plateforme web bidirectionnelle (**B2B2C**) conçue pour résoudre deux problématiques complémentaires :
1. **Pour les étudiants (du Baccalauréat au Doctorat, incluant les BTS, DUT, HND, Licences et formations professionnelles) :** centraliser les opportunités de bourses vérifiées, évaluer automatiquement leur éligibilité avec un rapport explicable critère par critère, recevoir des recommandations justifiées et répondre aux invitations d'organismes financeurs tout en gardant leur profil privé par défaut.
2. **Pour les organismes financeurs (universités, fondations, ministères, ambassades, organismes de coopération, entreprises) :** publier des campagnes structurées, rechercher des candidats ayant volontairement activé leur visibilité institutionnelle, envoyer des invitations, piloter les évaluations en comité et enregistrer les décisions d'attribution.

---

## 2. Direction Artistique & Design System

L'application implémente la **Direction A — « Academic Editorial »**, inspirée par la sobriété fonctionnelle et la rigueur d'*EmployeeCare* :
- **Palette chromatique :** Bleu Encre (`#213C5A`), Ivoire Archival (`#F8F6F1`), Bleu Clair (`#E7EFF5`), Cuivre Discret (`#B97853`), Texte Principal (`#253343`), Blanc Pur (`#FFFFFF`), filets architecturaux `1px solid #DFDCD4`.
- **Typographie :** `DM Serif Display` pour les titres éditoriaux et intitulés de programmes, associée à `DM Sans` pour l'interface, les formulaires et les tableaux, avec alignement numérique tabulaire (`tabular-nums` / `JetBrains Mono`).
- **Triptyque Académique Strict :** L'interface sépare systématiquement **1. Le diplôme déjà obtenu**, **2. Le niveau d'études actuel** et **3. Le niveau ou la formation recherchée**.

---

## 3. Technologies Utilisées

- **Frontend :** React 19, TypeScript, Tailwind CSS v4, React Router DOM, Lucide Icons.
- **Tests unitaires :** Node.js built-in test runner (`node:test`, `node:assert/strict`) exécuté via `tsx`.
- **Cible Backend (Architecture préparée) :** Java 21 + Spring Boot 3 + PostgreSQL (API REST).

---

## 4. Installation et Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Exécuter les tests unitaires du moteur d'éligibilité
npx --yes tsx --test src/features/eligibility/eligibilityEngine.test.ts

# 3. Lancer le serveur de développement (port 3000)
npm run dev

# 4. Vérifier le typage et compiler pour la production
npm run lint
npm run build
```

---

## 5. Comptes de Démonstration Disponibles

Un bandeau supérieur et un sélecteur en bas de la barre latérale permettent de basculer instantanément entre les **4 espaces utilisateurs** et de tester plusieurs profils :

| Espace / Rôle | Nom du Profil Démo | E-mail | Particularité à tester |
| :--- | :--- | :--- | :--- |
| **1. Étudiant** | **Amina Ndongo** | `amina.ndongo@etudiant-demo.cm` | Diplôme obtenu : Licence · Actuel : Master · Visé : Master. Permet de tester le statut **« Potentiellement compatible »** (Bourse France) et **« À compléter »** (Bourse Suisse où le certificat IELTS est manquant, avec bouton d'ajout rapide). Profil **Privé par défaut**. |
| **1. Étudiant** | **Cédric Tchoumi** | `cedric.tchoumi@etudiant-demo.cm` | Diplôme obtenu : BTS · Actuel : Licence · Visé : Licence. Visibilité institutionnelle **Activée volontairement**. |
| **1. Étudiant** | **Grâce Ebwane** | `grace.ebwane@etudiant-demo.cm` | Diplôme obtenu : HND (GPA 3.6/4.0) · Visé : Licence. Permet de tester le statut **« À vérifier »** (équivalence académique HND vers Licence sur la Bourse Canadienne). |
| **1. Étudiant** | **Samuel Kouam** | `samuel.kouam@etudiant-demo.cm` | Bachelier Série C **mineur** (garanties supplémentaires de protection des données). |
| **2. Organisme** | **Dr. Hélène Mvondo** | `bourses@fondation-excellence-afrique.demo.org` | Fondation Excellence Afrique (Organisme **Vérifié**, Formule **Organisme Pro**). |
| **3. Curateur** | **Jean-Paul Mbarga** | `jp.mbarga@curation.scholarfind.demo` | Contrôle des annonces en attente (`DEMO-PENDING-2027-06`), sources et doublons. |
| **4. Administrateur** | **Clarisse Njoya** | `direction@admin.scholarfind.demo` | Supervision des utilisateurs, accréditation des organismes, abonnements B2B2C et journaux d'audit. |

---

## 6. Limites de la Simulation Frontend & Conformité (Loi n° 2024/017)

- **Données fictives de démonstration :** Toutes les bourses présentes dans l'application sont explicitement étiquetées comme des *données fictives de démonstration* et ne constituent pas des appels officiels ouverts.
- **Persistance locale :** Les modifications (profil, favoris, visibilité, création de campagnes, invitations, décisions, curation) sont sauvegardées dans `localStorage` afin de persister au rafraîchissement et de se répercuter entre les 4 espaces.
- **Sécurité et Loi camerounaise n° 2024/017 du 23 décembre 2024 :** Le frontend applique les principes de *Privacy by Design* (profil privé par défaut, consentement explicite révocable, anonymisation dans la recherche organisme). En production, l'authentification sécurisée (JWT/OAuth2), le contrôle d'accès RBAC et le chiffrement des données reposeront sur le backend **Java Spring Boot**.

---

## 7. Guide d'Intégration Future avec Java Spring Boot & PostgreSQL

L'architecture frontend (`src/types/index.ts`, `src/features/eligibility/eligibilityEngine.ts`, `src/context/AppContext.tsx`) a été conçue pour faciliter le remplacement des services simulés par des appels HTTP REST :

1. **Correspondance des DTOs (`src/types/index.ts`) :** Chaque interface TypeScript (`StudentProfile`, `Scholarship`, `EligibilityReport`, `OrganizationProfile`, `Invitation`, `ApplicationRecord`, `AuditLogEntry`) correspond directement aux entités JPA / DTOs Spring Boot.
2. **Points de terminaison REST cibles :**
   - `POST /api/v1/auth/login` & `POST /api/v1/auth/register`
   - `GET / PUT /api/v1/students/me/profile` & `PATCH /api/v1/students/me/privacy`
   - `GET /api/v1/scholarships` & `POST /api/v1/scholarships/{id}/evaluate-eligibility`
   - `GET /api/v1/organizations/candidates/search` (filtré côté serveur sur `institutional_visibility_enabled = true`)
   - `POST /api/v1/invitations` & `PATCH /api/v1/invitations/{id}/respond`
   - `PATCH /api/v1/curation/scholarships/{id}` & `GET /api/v1/admin/audit-logs`
