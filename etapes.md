# Plan de développement SCHOLARFIND

> Direction artistique validée : **Direction A — « Academic Editorial »** (Bleu encre `#213C5A`, Ivoire `#F8F6F1`, Bleu clair `#E7EFF5`, Cuivre discret `#B97853`, Texte principal `#253343`, Blanc `#FFFFFF`, typographies `DM Serif Display` + `DM Sans` + chiffres tabulaires `tabular-nums`, inspiration structurelle sobre type *EmployeeCare*).

---

## Étape 1 — Initialisation & Configuration Technique
- [x] Vérifier et configurer le projet React + TypeScript + Vite.
- [x] Installer `react-router-dom` pour le routage multi-espaces (Public, Étudiant, Organisme, Curateur, Administrateur).
- [x] Configurer les polices Google Fonts (`DM Serif Display`, `DM Sans`, `JetBrains Mono`) dans `index.html`.
- [x] Configurer les jetons de couleurs, la typographie et les utilitaires du Design System dans `src/index.css`.

## Étape 2 — Design System « Academic Editorial » (`src/components/ui/`)
- [x] Définir les variables et classes de la palette *Academic Editorial* (`#213C5A`, `#F8F6F1`, `#E7EFF5`, `#B97853`, `#253343`, `#FFFFFF`).
- [x] Créer les composants de base réutilisables et accessibles (WCAG 2.2 AA) :
  - [x] Boutons (`Button`) : primaire Bleu Encre, secondaire contour fin, cuivre éditorial, danger, fantôme.
  - [x] Champs de formulaires (`Input`, `Select`, `Textarea`, `Checkbox`) avec libellés explicites, aides contextuelles et états d'erreur.
  - [x] Cartes et panneaux (`Panel`, `PageHeader`) : surfaces plates à bordures fines `1px solid #DFDCD4`, sans ombres artificielles.
  - [x] Indicateurs sémantiques (`CriterionStatusText`, `EligibilityVerdictIndicator`) avec texte explicite + icône (jamais de couleur seule).
  - [x] Modales de confirmation et panneaux de détail (`Modal`) accessibles au clavier.
  - [x] Bandeau triptyque académique (`AcademicTriptych`) distinguant systématiquement : *1. Diplôme obtenu* · *2. Niveau actuel* · *3. Formation recherchée*.

## Étape 3 — Modèles de Données, Moteur d'Éligibilité & Couche Services Spring Boot
- [x] Créer les interfaces TypeScript complètes (`src/types/index.ts`) alignées sur le futur schéma PostgreSQL / Spring Boot :
  - [x] Utilisateurs, Rôles (`STUDENT`, `ORGANIZATION`, `CURATOR`, `ADMIN`).
  - [x] Profils académiques étudiants (incluant la distinction stricte Diplôme obtenu / Niveau actuel / Formation recherchée, la visibilité privée par défaut et le consentement Loi camerounaise n° 2024/017).
  - [x] Programmes de bourses, critères obligatoires et préférentiels, métadonnées de curation et fiabilité des sources.
  - [x] Résultats d'évaluation d'éligibilité (`POTENTIALLY_COMPATIBLE`, `INCOMPATIBLE`, `TO_COMPLETE`, `TO_VERIFY`).
  - [x] Organismes financeurs, campagnes, invitations, candidatures, évaluateurs, abonnements B2B2C et journaux d'audit.
- [x] Implémenter le moteur d'éligibilité déterministe et explicable (`src/features/eligibility/eligibilityEngine.ts`) :
  - [x] Évaluation critère par critère (Nationalité, Pays de résidence, Diplôme obtenu, Niveau visé, Domaine, Moyenne normalisée, Âge, Compétences linguistiques).
  - [x] Gestion des cas : profil compatible, critère obligatoire non satisfait, information manquante (*À compléter*), équivalence académique incertaine (*À vérifier*), bourse expirée, annonce non vérifiée.
- [x] Écrire et exécuter les tests unitaires du moteur d'éligibilité (`src/features/eligibility/eligibilityEngine.test.ts`).
- [x] Créer les données de démonstration réalistes et identifiées comme telles (`src/data/mockData.ts`) : parcours camerounais et internationaux (Bac, BTS, DUT, HND, Licence, Master, Doctorat, Formation professionnelle).
- [x] Créer la couche de services (`src/context/AppContext.tsx`) avec persistance `localStorage` et contrat d'interface prêt pour l'API REST Spring Boot.

## Étape 4 — Layouts & Navigation Multi-Espaces (`src/components/layout/`)
- [x] Créer le layout Public (`PublicLayout.tsx`) respectant le contrat Top Bar (Logo éditorial, navigation sobre, accès Connexion/Inscription et sélecteur rapide de démonstration).
- [x] Créer le layout Workspace interne (`WorkspaceLayout.tsx`) inspiré d'*EmployeeCare* :
  - [x] Barre latérale adaptée dynamiquement à chacun des 4 rôles (Étudiant, Organisme, Curateur, Administrateur).
  - [x] En-tête contextuel avec fil d'Ariane, état de confidentialité/accréditation, notifications et bascule rapide entre comptes de démonstration.
  - [x] Navigation responsive sur ordinateur, tablette et smartphone.

## Étape 5 — Pages Publiques & Authentification Simulée
- [x] Page **Accueil** (`/`) : proposition de valeur double (Étudiants & Organismes), aperçu du moteur d'éligibilité explicable, statistiques sobres et accès aux parcours.
- [x] Page **Catalogue public des bourses** (`/bourses`) : recherche par mots-clés, filtres multicritères, tri et mention explicite de données de démonstration.
- [x] Page **Détail d'une bourse** (`/bourses/:id`) : présentation complète des conditions, de la source vérifiée par le curateur et lancement direct du test d'éligibilité.
- [x] Page **Fonctionnement de SCHOLARFIND** (`/fonctionnement`) : explication transparente de la méthodologie en 4 objectifs (Centraliser, Vérifier, Recommander, Mettre en relation) et de la conformité Loi 2024/017.
- [x] Page **Présentation des organismes** (`/organismes`) : annuaire des institutions partenaires vérifiées et présentation de l'espace financeur.
- [x] Page **Tarification B2B2C** (`/tarification`) : gratuité totale et équité pour les étudiants, offres Organisme Découverte (Gratuit), Organisme Pro (50 000 FCFA/mois), Organisme Premium (150 000 FCFA/mois) et Campagne ponctuelle (75 000 FCFA).
- [x] Pages **Connexion** (`/connexion`) et **Inscription** (`/inscription`) : formulaires fonctionnels avec validation et connexion en 1 clic aux 4 profils de démonstration.

## Étape 6 — Espace Étudiant (`src/features/students/`)
- [x] **Tableau de bord étudiant** (`/etudiant/tableau-de-bord`) : synthèse triptyque du profil, alertes sur les informations manquantes, bourses recommandées, invitations reçues, favoris et échéances.
- [x] **Mon profil académique** (`/etudiant/profil`) : formulaire progressif structuré en 4 étapes (1. Identité & Résidence, 2. Parcours académique distinguant Diplôme obtenu / Niveau actuel / Formation recherchée + Moyenne et échelle, 3. Langues & Certifications, 4. Préférences de destination & financement).
- [x] **Rechercher des bourses** (`/etudiant/recherche`) : catalogue filtrable avec mise en favoris et aperçu rapide de compatibilité.
- [x] **Vérification d'éligibilité** (`/etudiant/eligibilite`) : rapport d'audit académique détaillé critère par critère avec statuts explicables (*Potentiellement compatible*, *À compléter*, *À vérifier*, *Incompatible*) et action rapide pour compléter une donnée manquante.
- [x] **Bourses recommandées** (`/etudiant/recommandations`) : suggestions personnalisées accompagnées de l'explication précise de chaque recommandation.
- [x] **Mes favoris** (`/etudiant/favoris`) : suivi des offres sauvegardées, notes personnelles et rappels d'échéances.
- [x] **Mes invitations** (`/etudiant/invitations`) : consultation des invitations envoyées par les organismes financeurs, acceptation avec consentement explicite de partage du dossier ou refus motivé.
- [x] **Mes notifications** (`/etudiant/notifications`) : centre d'alertes (échéances, invitations, mises à jour de bourses) avec marquage lu/non lu.
- [x] **Paramètres et confidentialité** (`/etudiant/confidentialite`) : contrôle du profil privé par défaut, activation/retrait volontaire de la visibilité institutionnelle, protection des mineurs, export et réinitialisation des données (Loi camerounaise n° 2024/017).

## Étape 7 — Espace Organisme Financeur (`src/features/organizations/`)
- [x] **Tableau de bord organisme** (`/organisme/tableau-de-bord`) : programmes actifs, candidatures reçues, invitations envoyées, dossiers en cours d'examen et décisions.
- [x] **Profil institutionnel** (`/organisme/profil`) : informations officielles, coordonnées et statut de vérification requis avant l'accès à la base de candidats volontaires.
- [x] **Mes programmes** (`/organisme/programmes`) : liste des campagnes de bourses actives, brouillons ou clôturées avec modification de statut.
- [x] **Créer / Modifier une campagne** (`/organisme/creer-campagne`) : formulaire complet permettant de définir les critères obligatoires/préférentiels, niveaux éligibles, moyenne minimale, couverture financière et date limite.
- [x] **Rechercher des candidats** (`/organisme/recherche-candidats`) : moteur de recherche filtrant exclusivement les étudiants ayant activé leur visibilité institutionnelle, avec anonymisation des coordonnées privées jusqu'à acceptation.
- [x] **Invitations envoyées** (`/organisme/invitations`) : historique et statut des invitations transmises aux profils présélectionnés.
- [x] **Candidatures** (`/organisme/candidatures`) : gestion du pipeline complet (*Candidature reçue*, *En cours d'examen*, *Informations complémentaires demandées*, *Présélectionnée*, *Retenue*, *Non retenue*).
- [x] **Évaluation des dossiers & Évaluateurs** (`/organisme/evaluations`) : grille d'évaluation multicritères, notes du comité et gestion des collaborateurs évaluateurs et de leurs permissions.
- [x] **Décisions d'attribution** (`/organisme/decisions`) : enregistrement formel des attributions et liste d'attente.
- [x] **Statistiques** (`/organisme/statistiques`) : indicateurs sobres et utiles sur l'attractivité des campagnes, la répartition par niveau d'études et le taux de réponse aux invitations.
- [x] **Abonnement et facturation** (`/organisme/abonnement`) : gestion simulée de la formule active (Découverte, Pro, Premium, Campagne ponctuelle) et historique des souscriptions de démonstration.

## Étape 8 — Espace Curateur (`src/features/curation/`)
- [x] **Tableau de bord curateur** (`/curateur/tableau-de-bord`) : compteurs d'annonces en attente, vérifiées, rejetées, sources à contrôler et doublons détectés.
- [x] **Annonces à vérifier** (`/curateur/annonces`) : interface d'inspection permettant de contrôler la source, corriger les critères d'une bourse, approuver/publier, rejeter ou archiver une annonce périmée.
- [x] **Sources officielles** (`/curateur/sources`) : registre des sources (ambassades, ministères, universités, fondations), indice de fiabilité et dates de dernière vérification.
- [x] **Gestion des doublons** (`/curateur/doublons`) : comparaison côte-à-côte des annonces similaires détectées avec fusion ou rejet du doublon.
- [x] **Historique des validations** (`/curateur/historique`) : traçabilité complète des modifications et décisions de curation.

## Étape 9 — Espace Administrateur (`src/features/administration/`)
- [x] **Tableau de bord administrateur** (`/admin/tableau-de-bord`) : vue globale de supervision, activité des 4 espaces et alertes système.
- [x] **Utilisateurs** (`/admin/utilisateurs`) : recherche, filtrage par rôle, activation/suspension de compte et gestion des rôles.
- [x] **Organismes** (`/admin/organismes`) : examen des demandes d'accréditation, vérification institutionnelle, approbation, rejet ou suspension.
- [x] **Programmes** (`/admin/programmes`) : supervision globale du catalogue, traitement des signalements et contrôle des publications.
- [x] **Sources** (`/admin/sources`) : supervision globale des flux et autorités émettrices.
- [x] **Abonnements & Gestion commerciale** (`/admin/abonnements`) : suivi des formules B2B, souscriptions simulées et campagnes ponctuelles.
- [x] **Journaux d'audit** (`/admin/audit`) : registre horodaté des actions sensibles (changements de visibilité, validations d'organismes, décisions d'attribution).
- [x] **Paramètres plateforme** (`/admin/parametres`) : configuration des règles globales, conformité Loi 2024/017 et maintenance des données de démonstration.

## Étape 10 — Tests, Vérification Visuelle & Documentation Finale
- [x] Exécuter les tests unitaires du moteur d'éligibilité et vérifier la compilation TypeScript (`compile_applet` + `lint_applet`).
- [x] Vérifier le rendu réel et les parcours utilisateurs dans le navigateur (Desktop 1440x900 et Mobile 390x844).
- [x] Mettre à jour `etapes.md` avec toutes les tâches réellement terminées.
- [x] Rédiger le fichier `README.md` complet (présentation, architecture, comptes de démonstration, limites de la simulation et guide d'intégration Spring Boot / PostgreSQL).
