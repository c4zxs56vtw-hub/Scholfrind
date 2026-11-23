/**
 * Modèles de données SCHOLARFIND
 * Conçus pour être directement alignés avec les DTOs de la future API REST Java Spring Boot + PostgreSQL.
 */

export type UserRole = 'STUDENT' | 'ORGANIZATION' | 'CURATOR' | 'ADMIN';

export type AcademicLevel =
  | 'Baccalauréat'
  | 'BTS'
  | 'DUT'
  | 'HND'
  | 'Licence'
  | 'Master'
  | 'Doctorat'
  | 'Formation professionnelle'
  | 'Formation complémentaire';

export type StudyDomain =
  | 'Informatique & Systèmes'
  | 'Génie Civil & Infrastructures'
  | 'Santé & Sciences Biomédicales'
  | 'Agronomie & Environnement'
  | 'Économie, Gestion & Finance'
  | 'Droit & Sciences Politiques'
  | 'Énergies Renouvelables & Mines'
  | 'Sciences de l’Éducation'
  | 'Tous domaines';

export type FundingType =
  | 'Bourse complète (Frais + Vie + Transport)'
  | 'Exonération des frais de scolarité'
  | 'Allocation mensuelle de subsistance'
  | 'Cofinancement / Bourse partielle'
  | 'Bourse de recherche & mobilité';

export type GradingScale = 'SUR_20' | 'GPA_4' | 'POURCENTAGE_100';

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif';

export interface LanguageSkill {
  language: 'Français' | 'Anglais' | 'Allemand' | 'Espagnol' | 'Mandarin';
  level: LanguageLevel;
  certification?: string; // ex: IELTS 6.5, TOEFL 95, TCF C1, Goethe B2
}

/**
 * Profil Étudiant
 * Distingue strictement :
 * 1. highestDiplomaObtained (Le diplôme déjà obtenu)
 * 2. currentStudyLevel (Le niveau d'études actuel)
 * 3. targetStudyLevel (Le niveau ou la formation recherchée)
 */
export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthYear?: number;
  isMinor: boolean;
  guardianConsentVerified?: boolean;
  nationality: string;
  residenceCountry: string;
  city: string;

  // Les 3 informations académiques qui ne doivent JAMAIS être confondues :
  highestDiplomaObtained: AcademicLevel | '';
  highestDiplomaName: string;
  currentStudyLevel: AcademicLevel | '';
  targetStudyLevel: AcademicLevel | '';

  studyDomain: StudyDomain | '';
  currentInstitution: string;
  academicYear: string;
  averageGrade: number | null;
  gradingScale: GradingScale;
  normalizedGradeOut20: number | null; // Calculé pour comparaison uniforme

  languages: LanguageSkill[];
  preferredDestinationCountries: string[];
  preferredFundingTypes: FundingType[];

  // Confidentialité (Loi camerounaise n° 2024/017 du 23 décembre 2024)
  institutionalVisibilityEnabled: boolean; // Privé (false) par défaut
  visibilityConsentDate?: string;
  allowAcademicScoreSharing: boolean;
  savedScholarshipIds: string[];
  updatedAt: string;
}

export type CurationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED';

export type ScholarshipStatus = 'OPEN' | 'CLOSING_SOON' | 'EXPIRED' | 'DRAFT';

export interface ScholarshipCriteria {
  eligibleNationalities: string[]; // ['Toutes'] ou liste ex: ['Cameroun', 'Sénégal', 'Côte d’Ivoire']
  requiredResidenceCountries: string[]; // ['Tous'] ou ['Cameroun']
  requiredDiplomaObtained: AcademicLevel[]; // Diplômes déjà obtenus acceptés
  allowedCurrentLevels?: AcademicLevel[]; // Niveaux actuels acceptés
  targetStudyLevels: AcademicLevel[]; // Niveaux financés par la bourse
  eligibleDomains: StudyDomain[];
  minGradeOut20: number | null;
  maxAge: number | null;
  requiredLanguage?: 'Français' | 'Anglais' | 'Allemand';
  minLanguageLevel?: LanguageLevel;
  requiresLanguageCertification: boolean;
  specificConditions: string[];
  preferentialCriteria: string[];
}

export interface ModificationRecord {
  id: string;
  date: string;
  actorName: string;
  actorRole: UserRole;
  summary: string;
}

export interface Scholarship {
  id: string;
  code: string;
  title: string;
  organizationId: string;
  organizationName: string;
  organizationType: 'Université' | 'Ministère' | 'Fondation' | 'Ambassade' | 'Coopération internationale' | 'Entreprise' | 'ONG';
  hostCountry: string;
  fundingType: FundingType;
  financialSummary: string;
  deadline: string; // YYYY-MM-DD
  startDate: string;
  durationMonths: number;
  slotsAvailable?: number;
  description: string;
  benefits: string[];
  requiredDocuments: string[];
  criteria: ScholarshipCriteria;

  // Métadonnées de curation et fiabilité
  isDemoData: boolean;
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  lastVerifiedAt: string | null;
  verifiedByCurator?: string;
  curationStatus: CurationStatus;
  status: ScholarshipStatus;
  modificationHistory: ModificationRecord[];
  duplicateSuspectOfId?: string;
}

export type EligibilityGlobalVerdict =
  | 'POTENTIALLY_COMPATIBLE' // Potentiellement compatible
  | 'TO_COMPLETE'            // À compléter
  | 'TO_VERIFY'              // À vérifier
  | 'INCOMPATIBLE';          // Incompatible

export type CriterionEvaluationStatus =
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'MISSING_INFO'
  | 'AMBIGUOUS_TO_VERIFY';

export interface CriterionEvaluationItem {
  id: string;
  label: string;
  isMandatory: boolean;
  expectedValue: string;
  studentValue: string;
  status: CriterionEvaluationStatus;
  explanation: string;
  missingFieldKey?: string;
}

export interface EligibilityReport {
  scholarshipId: string;
  studentId: string;
  evaluatedAt: string;
  verdict: EligibilityGlobalVerdict;
  verdictLabel: 'Potentiellement compatible' | 'À compléter' | 'À vérifier' | 'Incompatible';
  summaryExplanation: string;
  legalDisclaimer: string;
  satisfiedCount: number;
  totalMandatoryCount: number;
  items: CriterionEvaluationItem[];
  warnings: string[];
}

export type PlanTierId = 'STUDENT_FREE' | 'ORG_DISCOVERY' | 'ORG_PRO' | 'ORG_PREMIUM' | 'ORG_SINGLE_CAMPAIGN';

export interface OrganizationProfile {
  id: string;
  userId: string;
  officialName: string;
  type: 'Université' | 'Ministère' | 'Fondation' | 'Ambassade' | 'Coopération internationale' | 'Entreprise' | 'ONG';
  country: string;
  address: string;
  website: string;
  contactEmail: string;
  contactPersonName: string;
  contactPersonRole: string;
  description: string;
  registrationNumber: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  verifiedAt?: string;
  activePlan: PlanTierId;
  evaluators: EvaluatorMember[];
}

export interface EvaluatorMember {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE';
  active: boolean;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  scholarshipId: string;
  scholarshipTitle: string;
  studentId: string;
  studentAnonymizedCode: string;
  studentDisplayName: string; // Affiché seulement si l'étudiant a accepté ou selon ses règles
  message: string;
  sentAt: string;
  respondedAt?: string;
  status: InvitationStatus;
  studentResponseNote?: string;
  consentToShareDossier: boolean;
}

export type ApplicationStatus =
  | 'Candidature reçue'
  | 'En cours d’examen'
  | 'Informations complémentaires demandées'
  | 'Présélectionnée'
  | 'Retenue'
  | 'Non retenue';

export interface ApplicationRecord {
  id: string;
  referenceCode: string;
  scholarshipId: string;
  scholarshipTitle: string;
  organizationId: string;
  organizationName: string;
  studentId: string;
  studentName: string;
  studentHighestDiploma: AcademicLevel | '';
  studentCurrentLevel: AcademicLevel | '';
  studentTargetLevel: AcademicLevel | '';
  studentDomain: StudyDomain | '';
  studentGradeOut20: number | null;
  studentNationality: string;
  submittedAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  evaluatorScoreOut100?: number;
  evaluatorNotes: string;
  assignedEvaluatorName?: string;
  decisionRecordedAt?: string;
  decisionJustification?: string;
  originatedFromInvitationId?: string;
}

export interface OfficialSource {
  id: string;
  name: string;
  institutionType: string;
  country: string;
  officialUrl: string;
  reliabilityStatus: 'FIABLE_VERIFIEE' | 'A_CONTROLER' | 'SUSPENDUE';
  lastCheckedAt: string;
  activeAnnouncementsCount: number;
  notes: string;
}

export interface DuplicateCandidate {
  id: string;
  primaryScholarshipId: string;
  duplicateScholarshipId: string;
  similarityScore: number;
  reason: string;
  status: 'PENDING' | 'MERGED_ARCHIVED' | 'DISMISSED';
  detectedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole;
  category: 'DEADLINE' | 'INVITATION' | 'OPPORTUNITY' | 'SYSTEM' | 'APPLICATION';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastLoginAt: string;
  linkedEntityId: string; // studentProfile.id ou organizationProfile.id
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: 'PRIVACY_CONSENT' | 'CURATION_DECISION' | 'ORG_VERIFICATION' | 'CAMPAIGN_PUBLISHED' | 'AWARD_DECISION' | 'ACCOUNT_STATUS';
  targetLabel: string;
  details: string;
}

export interface CommercialSubscription {
  id: string;
  organizationId: string;
  organizationName: string;
  planId: PlanTierId;
  planName: string;
  amountFcfa: number;
  billingCycle: 'Mensuel' | 'Campagne ponctuelle' | 'Gratuit';
  status: 'ACTIF_SIMULE' | 'EN_ATTENTE_SIMULE' | 'CLOTURE';
  startedAt: string;
  nextRenewalAt?: string;
}
