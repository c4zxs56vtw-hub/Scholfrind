# SCHOLARFIND - Contrat API v1.1.0 (proposition compatible frontend)

**Base :** contrat OpenAPI de l'utilisateur (`ai_studio_code.txt`), apres correction de la
syntaxe YAML sur le champ `summary` du profil. Aucun backend n'a ete implemente ici.

## Documents

- `SCHOLARFIND_API_Contrat_1.1_compatible.yaml` : contrat OpenAPI complet pour la cible backend.
- `SCHOLARFIND_Prompt_Google_AI_Studio.md` : instructions d'adaptation du frontend React.
- `SCHOLARFIND_Guide_Compatibilite.md` : ordre de migration, matrice par espace et garde-fous.
- `SCHOLARFIND_API_Controle.json` : compte rendu des verifications structurelles.

## Mode d'emploi

1. Ouvrir le projet frontend **existant** dans Google AI Studio.
2. Joindre le fichier `.yaml` complet et transmettre le prompt `.md`.
3. Demander d'abord le rapport d'audit sans appliquer de changements.
4. Approuver la cartographie, puis demander une adaptation progressive non destructive.
5. Conserver `mock` comme mode par defaut tant que le backend Spring Boot n'existe pas.
6. Comparer toutes les routes et interactions frontend avant et apres modification.

## Verifications effectuees

- YAML charge sans erreur avec deux parseurs independants.
- Conservation des 44 operations historiques et de leurs `operationId`.
- Conservation des champs, ensembles `required` et enumerations des 48 schemas historiques.
- Verification de toutes les references internes `$ref` et des IDs d'operation uniques.
- Verification de la presence des parametres de chemin des nouvelles operations.

**Non fait :** lint Redocly / validation formelle via OpenAPI Generator, compilation Java,
verification des usages React, et tests Postman. Il faut les executer dans votre environnement.
La garantie de non-regression sur le frontend exige l'acces au code et des tests reels.

## Notes de conception

- Les anciennes valeurs enum ne sont pas renommees pour ne pas casser les donnees de demonstration.
- `GET /scholarships` conserve la reponse tableau ; `GET /scholarships/search` ajoute la pagination.
- Les bourses administrateur commencent comme brouillons et ne sont pas visibles publiquement.
- Gemini n'est appele que depuis le backend ; les extractions exigent la revue humaine.
- La visibilite institutionnelle des etudiants reste volontaire et revocable.
- `studentId` dans le vivier est un ancien nom de champ : sa valeur doit etre un jeton public opaque,
  jamais la cle primaire interne. Le client nouveau doit preferer `candidatePublicId`.
- Les prix organisationnels sont indicatifs et aucun plan payant ne s'active sans confirmation serveur.
- Pour un profil etudiant reellement incomplet, revoir la rigidite des champs `required` du schema
  historique `StudentProfile` avant de figer l'implementation backend. La forme est maintenue ici
  intentionnellement pour conserver la compatibilite du frontend actuel.
