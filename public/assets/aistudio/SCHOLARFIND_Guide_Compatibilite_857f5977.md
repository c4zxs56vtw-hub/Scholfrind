# SCHOLARFIND - Guide de compatibilite frontend / API

## Objectif

Adapter le frontend React **existant** au contrat propose **sans refonte visuelle ni suppression
fonctionnelle**. Le nouveau YAML decrit un backend cible ; il ne faut pas supposer que les API
sont deja disponibles.

## Matrice de migration par espace

| Espace | Ecrans / fonctions existantes | Contrats de reference | Action frontend |
| --- | --- | --- | --- |
| Public | Accueil, catalogue, fiche bourse | GET `/scholarships`, GET `/scholarships/{scholarshipId}` | Garder les composants ; mapper donnees existantes. |
| Public | Recherche avancee | GET `/scholarships/search` | Pagination optionnelle ; fallback vers le catalogue existant. |
| Public | Tarifs | GET `/public/plans` | Montrer tarifs des organismes, mention gratuit pour etudiants. |
| Etudiant | Connexion, session | `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout` | Ne pas simuler de JWT reel ; conserver authentification mock en preview. |
| Etudiant | Tableau de bord | GET `/students/me/dashboard` | Endpoint facultatif ; fallback composition depuis ressources existantes. |
| Etudiant | Mon profil | GET/PUT `/students/me/profile` | Conserver consultation et edition. |
| Etudiant | Diplomes multiples | `/students/me/academic-records` | Ajouter uniquement si l'UI le necessite ; ne pas remplacer profil. |
| Etudiant | Preferences / completude | `/students/me/preferences`, `/students/me/profile/completion` | Meme source de donnees de profil, pas de duplication. |
| Etudiant | Visibilite | PATCH `/students/me/privacy` | Consentement explicite et revocable ; pas de badge envahissant. |
| Etudiant | Favoris | `/students/me/favorites` | Ne pas perdre les interactions actuelles. |
| Etudiant | Recommandations | GET `/students/me/recommendations` | Conserver classement et explications. |
| Etudiant | Eligibilite | GET `/eligibility/evaluate/{scholarshipId}`, POST `/eligibility/simulate` | Quatre verdicts originaux sans renommage. |
| Etudiant | Invitations, candidatures | `/students/me/invitations`, `/students/me/applications` | Conservation du consentement dossier. |
| Etudiant | Notifications | GET `/notifications`, PATCH `/notifications/{notificationId}/read` | Badge dynamique ou mode mock stable. |
| Admin | Ajout manuel bourse | POST `/admin/scholarships`, PATCH `/admin/scholarships/{scholarshipId}` | Formulaire de brouillon valide par le backend futur. |
| Admin | Publication | POST `/admin/scholarships/{scholarshipId}/submit-review`, `/publish`, `/archive` | Publication separee de creation ; aucun brouillon public. |
| Admin | Importer avec Gemini | POST `/admin/ai/scholarships/extract`, GET `/admin/ai/extractions/{extractionId}` | Pre-remplissage uniquement ; aucune cle Gemini cote navigateur. |
| Admin | Collectes | POST/GET `/admin/ingestion/jobs` | Afficher progression asynchrone ; aucune collecte simulee declaree reelle. |
| Curateur | File de validation | GET `/curation/scholarships`, PATCH `/curation/scholarships/{scholarshipId}` | Conserver revue humaine. |
| Curateur | Sources, doublons | `/curation/sources`, `/curation/duplicates` | Reutiliser liste actuelle. |
| Organisme | Profil institutionnel | GET/PUT `/organizations/me` | Verification cote serveur. |
| Organisme | Offres/campagnes | `/organizations/me/scholarships`, `/organizations/me/campaigns` | Programmes et campagnes distincts ; ne pas dupliquer UX sans besoin. |
| Organisme | Vivier candidats | `/organizations/me/talent-pool` | Ne jamais afficher identifiants internes ni documents sans consentement. |
| Organisme | Invitations et candidatures | `/organizations/me/invitations`, `/organizations/me/applications` | Acces controle par organisme et consentement. |
| Organisme | Abonnements | `/public/plans`, `/organizations/me/subscription/requests` | Aucun droit payant automatique cote frontend. |
| Admin | Gouvernance | `/admin/users`, `/admin/organizations`, `/admin/audit-logs` | Garder les permissions RBAC et les audits. |

## Invariants de compatibilite

1. Tous les chemins v1.0 existants sont maintenus ; `operationId` preserves.
2. Les enumerations d'origine sont maintenues sur le fil JSON ; seuls des alias d'affichage
   ou des wrappers TypeScript peuvent etre ajoutes.
3. `GET /scholarships` renvoie toujours un tableau ; le nouveau `GET /scholarships/search`
   renvoie `{content, page}`. Ne pas echanger ces deux shapes silencieusement.
4. `status` (ancienne disponibilite) coexiste avec `publicationStatus` (cycle editorial).
5. Ne pas reinitialiser les donnees de demonstration, favoris, profils, roles et stores locaux.
6. Ne pas refaire l'interface : garder couleurs, menu mobile inferieur, recherche mobile animee,
   cartes de bourse, champs du profil et comportements des boutons.
7. Ne jamais appeler Gemini depuis le navigateur : UI -> backend Spring AI -> Gemini.
8. Les en-tetes et liens de production du YAML sont des **cibles**, pas des serveurs disponibles.
9. Pour tout module non implemente, garder son service mock existant et declarer clairement
   le statut mock dans le rapport ; ne pas faire de faux succes silencieux.
10. Retenir le schema historique du profil uniquement comme forme de compatibilite a court terme.
    Avant le backend, arreter la decision sur les champs academiques manquants a l'inscription.

## Plan de mise en conformite frontend (avec validations humaines)

**PASS 0 - AUDIT (sans modification)** : lire les routes, stores, composants, services,
types, mocks, formulaires et permissions. Produire une matrice ecran->API existante/cible.
Attendre la validation de l'equipe.

**PASS 1 - CLIENT ISOLE (sans brancher aux ecrans)** : generer les types depuis le YAML ;
creer un `ApiClient` et des adaptateurs de donnees ; garder `mock` par defaut ; tester le
mapping des statuts et la gestion d'erreurs. Validation humaine.

**PASS 2 - ADAPTATION PROGRESSIVE** : ecran par ecran, mettre a jour les appels a la couche
service, sans remplacer les composants fonctionnels. Avec backend absent, verifier dans le
mode mock. Validation humaine sur mobile et desktop.

**PASS 3 - BASCULE CONTROLEE** : seulement quand Spring Boot repond aux contrats et que
les tests API Postman passent : activer la configuration API reel sur l'environnement de
test, verifier parcours de bout en bout, conserver rollback rapide vers mock.

## Criteres de recette

- La recherche publique etudiante fonctionne et conserve les filtres.
- Le tableau de bord et le catalogue restent distincts.
- La barre de navigation mobile est toujours accessible sur les pages secondaires.
- La recherche mobile se retracte et se deploie sans perte du texte.
- Un etudiant consulte et modifie son profil et ses preferences.
- La visibilite academique est controlee par consentement.
- Le resultat d'eligibilite explique chaque critere et garde les quatre codes d'origine.
- L'admin cree un brouillon; ne le rend public qu'apres validation.
- L'import IA propose des champs; l'admin doit verifier avant publication.
- Un organisme n'accede qu'aux candidats consentants et a ses propres candidatures.
- Les tarifs professionnels ne sont pas imposes dans l'espace etudiant.
- Aucun bouton, filtre, formulaire, lien ou parcours precedemment fonctionnel n'a disparu.
- Toutes les verifications effectuees sont listees ; les tests non executes restent signales.
