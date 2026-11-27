import { ApiOrganizationType } from '../../api/openapi.types';
import { UserRole } from '../../types';

/**
 * Niveau de robustesse d'un mot de passe pour l'inscription et la réinitialisation
 */
export type PasswordStrengthLevel = 'EMPTY' | 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';

export interface PasswordStrengthReport {
  score: 0 | 1 | 2 | 3 | 4;
  level: PasswordStrengthLevel;
  label: string;
  hasMinLength: boolean;
  hasUpperAndLower: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isAcceptable: boolean;
}

/**
 * Évalue de manière déterministe la robustesse d'un mot de passe.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthReport {
  if (!password) {
    return {
      score: 0,
      level: 'EMPTY',
      label: 'Aucun mot de passe saisi',
      hasMinLength: false,
      hasUpperAndLower: false,
      hasNumber: false,
      hasSpecialChar: false,
      isAcceptable: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const checks = [hasMinLength, hasUpperAndLower, hasNumber, hasSpecialChar];
  const rawScore = checks.filter(Boolean).length as 0 | 1 | 2 | 3 | 4;

  if (!hasMinLength || rawScore <= 1) {
    return {
      score: 1,
      level: 'WEAK',
      label: 'Faible (8 caractères minimum requis)',
      hasMinLength,
      hasUpperAndLower,
      hasNumber,
      hasSpecialChar,
      isAcceptable: false,
    };
  }

  if (rawScore === 2) {
    return {
      score: 2,
      level: 'FAIR',
      label: 'Moyen (ajoutez chiffres, majuscules ou symboles)',
      hasMinLength,
      hasUpperAndLower,
      hasNumber,
      hasSpecialChar,
      isAcceptable: true,
    };
  }

  if (rawScore === 3) {
    return {
      score: 3,
      level: 'GOOD',
      label: 'Robuste',
      hasMinLength,
      hasUpperAndLower,
      hasNumber,
      hasSpecialChar,
      isAcceptable: true,
    };
  }

  return {
    score: 4,
    level: 'STRONG',
    label: 'Très robuste',
    hasMinLength,
    hasUpperAndLower,
    hasNumber,
    hasSpecialChar,
    isAcceptable: true,
  };
}

/**
 * Statuts du cycle de vie d'une demande de création de compte organisme partenaire
 */
export type PartnerRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type PartnerOrganizationUiType =
  | 'Entreprise'
  | 'Université'
  | 'Fondation'
  | 'ONG'
  | 'Institution publique'
  | 'Autre';

/**
 * Adaptateur bidirectionnel entre le type d'organisme du formulaire UI
 * et l'énumération OpenAPI 1.1 `OrganizationType`.
 */
export function adaptPartnerUiTypeToOpenApi(
  uiType: PartnerOrganizationUiType
): ApiOrganizationType {
  switch (uiType) {
    case 'Université':
      return 'Université';
    case 'Fondation':
      return 'Fondation';
    case 'ONG':
      return 'ONG';
    case 'Entreprise':
      return 'Entreprise';
    case 'Institution publique':
      return 'Ministère';
    case 'Autre':
      return 'Coopération internationale';
  }
}

/**
 * Adaptateur entre le statut détaillé de demande partenaire et le `verificationStatus` OpenAPI 1.1
 * (`VERIFIED` | `PENDING` | `SUSPENDED` | `REJECTED`).
 */
export function adaptPartnerStatusToOpenApiVerification(
  status: PartnerRequestStatus
): 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED' {
  switch (status) {
    case 'APPROVED':
      return 'VERIFIED';
    case 'REJECTED':
      return 'REJECTED';
    case 'DRAFT':
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'MORE_INFO_REQUIRED':
      return 'PENDING';
  }
}

/**
 * Libellé français lisible pour chaque statut de demande organisme
 */
export function getPartnerRequestStatusLabel(status: PartnerRequestStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Brouillon';
    case 'SUBMITTED':
      return 'Soumise';
    case 'UNDER_REVIEW':
      return 'En cours de vérification';
    case 'MORE_INFO_REQUIRED':
      return 'Informations complémentaires requises';
    case 'APPROVED':
      return 'Approuvée';
    case 'REJECTED':
      return 'Refusée';
  }
}

/**
 * Indique si une nouvelle soumission est bloquée (empêche les soumissions multiples
 * lorsqu'une demande est déjà soumise, en cours de vérification ou approuvée).
 */
export function isPartnerSubmissionLocked(status?: PartnerRequestStatus): boolean {
  if (!status) return false;
  return (
    status === 'SUBMITTED' ||
    status === 'UNDER_REVIEW' ||
    status === 'APPROVED'
  );
}

/**
 * Garantit que toute inscription publique crée exclusivement un compte STUDENT.
 * Ne permet jamais l'auto-attribution de ORGANIZATION, CURATOR ou ADMIN.
 */
export function enforcePublicRegistrationRole(): UserRole {
  return 'STUDENT';
}

/**
 * Détermine la route d'accueil par défaut selon le rôle principal retourné par le backend.
 */
export function resolveDefaultWorkspacePathForRole(role: UserRole): string {
  switch (role) {
    case 'STUDENT':
      return '/etudiant/tableau-de-bord';
    case 'ORGANIZATION':
      return '/organisme/tableau-de-bord';
    case 'CURATOR':
      return '/curateur/tableau-de-bord';
    case 'ADMIN':
      return '/admin/tableau-de-bord';
  }
}
