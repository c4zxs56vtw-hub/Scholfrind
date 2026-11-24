# PROMPT GOOGLE AI STUDIO - SCHOLARFIND / ALIGNEMENT CONTRACT-FIRST

Tu es developpeur React/TypeScript senior et architecte d'integration API.

Je joins le fichier `SCHOLARFIND_API_Contrat_1.1_compatible.yaml`. Lis-le en entier :
**c'est la proposition de contrat du futur backend Java Spring Boot de SCHOLARFIND.**
Ce backend n'existe pas encore. Tu dois preparer mon frontend existant a ce contrat,
**SANS CASSER AUCUNE FONCTIONNALITE**.

## OBJECTIFS

- Conserver integralement le design actuel, les pages, les roles, les composants, les donnees
  de demonstration, la logique de navigation et toutes les interactions deja fonctionnelles.
- Respecter tous les modules du contrat : public, etudiant, administrateur, curateur,
  organisme; bourses, eligibilite, recommandations, favoris, invitations, campagnes,
  notifications et plans professionnels.
- Prevoir l'ajout MANUEL de bourses par l'administrateur, enregistrement en brouillon,
  soumission a la revue, publication, archivage et historique.
- Prevoir la saisie assistee par Gemini, les extractions et la collecte automatique **via le
  futur backend Spring AI**, jamais depuis le navigateur et sans cle API Google dans React.
- Respecter la confidentialite : visibilite academique volontaire et revocable ;
  recherche de candidats pseudonymisee ; partage des dossiers uniquement apres consentement.
- La verification d'eligibilite repose sur un moteur de regles Java, pas sur une decision
  libre de Gemini. Conserver EXACTEMENT les quatre verdicts originaux.

## PHASE 1 - AUDIT SEULEMENT, STOP OBLIGATOIRE

1. Lis le code actuel : routes, composants, stores, contextes, services, mocks,
   types, formulaire de profil et vues par role.
2. Dresse un tableau : ecran existant -> service actuel -> operationId OpenAPI ->
   correspondance correcte / manquante / a corriger.
3. Identifie les changements a realiser **sans supprimer d'ecran ni de comportement**.
4. Liste les risques de regression et ce qui ne peut pas etre verifie dans l'outil.
5. STOPPE-TOI et attends mon autorisation "AUDIT VALIDE" avant de modifier le code.

## PHASE 2 - ADAPTATION NON DESTRUCTIVE (apres validation)

- Genere des types TypeScript depuis OpenAPI dans un dossier isole.
- Cree une couche de services / adaptateurs entre les DTO API et les models UI.
- Ne fais PAS dependre directement toutes les pages des DTO generes.
- Configure un mode `mock` (DEFAUT) et un mode `real` separe, avec activation explicite.
- Tant que le backend n'existe pas, ne lance aucune requete sur le domaine de production
  mentionne dans le YAML, car il est illustratif.
- Conserve les donnees et services mock existants. Ne recree pas de faux etudiants ou de
  faux profils par-dessus les donnees actuelles.
- Conserve les routes et liens existants ; toute nouvelle route est additive.
- N'ecrase pas les composants ni les gestionnaires d'etat existants.
- Adapte les ecrans qui necessitent une nouvelle action, progressivement et sans refonte.
- Respecte les valeurs wire existantes des enums (y compris les chaines en francais),
  et cree seulement des libelles UI ou mappings explicites.
- Ne change pas le schema de `GET /scholarships` (tableau). Le nouveau
  `GET /scholarships/search` est une option paginee distincte.
- Distingue `status` historique et `publicationStatus` editorial.
- Ne demande pas toutes les informations academiques au moment de l'inscription ;
  l'etudiant doit pouvoir completer son profil ensuite. Signale toute contradiction
  historique du contrat sur les champs obligatoires sans inventer de valeurs.

## PHASE 3 - VERIFICATIONS

- Tester ou inspecter chaque vue : Accueil, Explorer, Pour moi, Activites, Profil,
  bourses/detail, administration, curateur, organisme, tarifs.
- Preserver la barre de navigation inferieure des etudiants sur mobile.
- Preserver la recherche retractable et animee sur smartphone uniquement.
- Verifier formulaires, filtres, favoris, recommandations, invitations, notifications,
  droits par role, consentements, brouillons, publication et erreurs.
- Tester largeurs 390 px, 768 px et 1440 px a zoom 100 % lorsque l'outil le permet.
- Presenter un rapport : fichiers modifies, fonctionnalites impactees, tests effectues,
  resultats, regressions resolues, points non testes.
- Ne jamais ecrire "tout est teste" sans execution reelle de tests.

## CONTRAINTES ABSOLUES

1. Ne reconstruis pas SCHOLARFIND a partir de zero.
2. Ne change pas l'identite graphique ni la navigation approuvee.
3. Ne supprime aucune page, composant, interaction ou donnee existante.
4. Ne stocke jamais des secrets Gemini dans le navigateur.
5. Ne considere pas que les endpoints OpenAPI sont deja implementees.
6. Ne force pas un utilisateur etudiant a souscrire un plan professionnel.
7. Ne fusionne pas les statuts de publication, de revue et d'eligibilite.
8. N'ajoute aucun faux succes a un appel API.
9. Ne change pas les roles, permissions ou consentements sans justification.
10. Commence UNIQUEMENT par la PHASE 1 et ATTENDS mon autorisation.

**Maintenant, analyse le projet frontend deja ouvert et le contrat joint. Produis
le rapport de correspondance et stoppe-toi.**
