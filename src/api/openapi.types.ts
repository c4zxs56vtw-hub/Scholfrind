/**
 * Types et DTOs générés depuis le contrat de référence OpenAPI 3.0.3 :
 * SCHOLARFIND_API_Contrat_1.1_compatible.yaml (version 1.1.0)
 *
 * IMPORTANT :
 * - Ce fichier représente exactement les schémas "wire" (JSON) du futur backend Java Spring Boot.
 * - Les composants React ne doivent pas dépendre directement de ces DTOs lorsque le format UI diffère :
 *   utiliser systématiquement les adaptateurs dans `src/api/adapters/`.
 */

export type ApiUserRole = 'STUDENT' | 'ORGANIZATION' | 'CURATOR' | 'ADMIN';

export type ApiAcademicLevel =
  | 'Baccalauréat'
  | 'BTS'
  | 'DUT'
  | 'HND'
  | 'Licence'
  | 'Master'
  | 'Doctorat'
  | 'Formation professionnelle'
  | 'Formation complémentaire';

export type ApiStudyDomain =
  | 'Informatique & Systèmes'
  | 'Génie Civil & Infrastructures'
  | 'Santé & Sciences Biomédicales'
  | 'Agronomie & Environnement'
  | 'Économie, Gestion & Finance'
  | 'Droit & Sciences Politiques'
  | 'Énergies Renouvelables & Mines'
  | 'Sciences de l’Éducation'
  | 'Tous domaines';

export type ApiFundingType =
  | 'Bourse complète (Frais + Vie + Transport)'
  | 'Exonération des frais de scolarité'
  | 'Allocation mensuelle de subsistance'
  | 'Cofinancement / Bourse partielle'
  | 'Bourse de recherche & mobilité';

export type ApiGradingScale = 'SUR_20' | 'GPA_4' | 'POURCENTAGE_100';

export type ApiLanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif';

/**
 * Distinction stricte des 4 types de statuts du contrat OpenAPI 1.1 :
 * 1. ApiPublicationStatus : Cycle éditorial (DRAFT -> PENDING_REVIEW -> PUBLISHED -> ARCHIVED)
 * 2. ApiCurationStatus : Statut de validation documentaire (VERIFIED, PENDING_REVIEW, REJECTED, ARCHIVED)
 * 3. ApiScholarshipStatus : Disponibilité calendaire héritée (OPEN, CLOSING_SOON, EXPIRED, DRAFT)
 * 4. ApiEligibilityGlobalVerdict : Verdict déterministe d'éligibilité (4 valeurs)
 */
export type ApiPublicationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type ApiCurationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED';

export type ApiScholarshipStatus = 'OPEN' | 'CLOSING_SOON' | 'EXPIRED' | 'DRAFT';

export type ApiScholarshipAcquisitionChannel =
  | 'ADMIN_MANUAL'
  | 'ORGANIZATION_SUBMISSION'
  | 'AUTOMATED_IMPORT';

export type ApiEligibilityGlobalVerdict =
  | 'POTENTIALLY_COMPATIBLE'
  | 'TO_COMPLETE'
  | 'TO_VERIFY'
  | 'INCOMPATIBLE';

export type ApiCriterionEvaluationStatus =
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'MISSING_INFO'
  | 'AMBIGUOUS_TO_VERIFY';

export type ApiPlanTierId =
  | 'STUDENT_FREE'
  | 'ORG_DISCOVERY'
  | 'ORG_PRO'
  | 'ORG_PREMIUM'
  | 'ORG_SINGLE_CAMPAIGN';

/**
 * Note d'audit : Sur le fil JSON OpenAPI 1.1, ApplicationStatus comporte 5 valeurs.
 * La valeur UI "Informations complémentaires demandées" est gérée par l'adaptateur.
 */
export type ApiApplicationStatus =
  | 'Candidature reçue'
  | 'En cours d’examen'
  | 'Présélectionnée'
  | 'Retenue'
  | 'Non retenue';

export type ApiOrganizationType =
  | 'Université'
  | 'Ministère'
  | 'Fondation'
  | 'Ambassade'
  | 'Coopération internationale'
  | 'Entreprise'
  | 'ONG';

export interface ApiFieldViolation {
  field: string;
  reason: string;
}

export interface ApiErrorDto {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  code?: string;
  traceId?: string;
  validationErrors?: ApiFieldViolation[];
}

export interface ApiPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiUserAccountDto {
  id: string;
  fullName: string;
  email: string;
  role: ApiUserRole;
  active: boolean;
  createdAt: string;
  linkedEntityId: string;
}

export interface ApiRegisterStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nationality: string;
  residenceCountry: string;
  highestDiplomaObtained?: ApiAcademicLevel;
  currentStudyLevel?: ApiAcademicLevel;
  targetStudyLevel?: ApiAcademicLevel;
  studyDomain?: ApiStudyDomain;
}

export interface ApiRegisterOrganizationRequest {
  officialName: string;
  type: ApiOrganizationType;
  country: string;
  website?: string;
  contactEmail: string;
  contactPersonName: string;
  contactPersonRole?: string;
  registrationNumber: string;
  password: string;
}

export interface ApiLoginRequest {
  email: string;
  password: string;
}

export interface ApiAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUserAccountDto;
}

export interface ApiPasswordResetRequest {
  email: string;
}

export interface ApiPasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ApiLanguageSkillDto {
  language: 'Français' | 'Anglais' | 'Allemand' | 'Espagnol' | 'Mandarin';
  level: ApiLanguageLevel;
  certification?: string | null;
}

export interface ApiAcademicRecordDto {
  id: string;
  diplomaLevel: ApiAcademicLevel;
  diplomaName: string;
  institutionName: string;
  institutionCountry?: string;
  obtained: boolean;
  completionYear?: number;
  gradingScale?: ApiGradingScale;
  grade?: number | null;
  normalizedGradeOut20?: number | null;
  officialEquivalenceVerified?: boolean;
  notes?: string;
}

export interface ApiUpsertAcademicRecordRequest {
  diplomaLevel: ApiAcademicLevel;
  diplomaName: string;
  institutionName: string;
  institutionCountry?: string;
  obtained: boolean;
  completionYear?: number;
  gradingScale?: ApiGradingScale;
  grade?: number | null;
  notes?: string;
}

export interface ApiProfileCompletionDto {
  percentage: number;
  missingFields: string[];
  readyForEligibility: boolean;
  instructions?: string[];
}

export interface ApiStudentPreferencesDto {
  preferredDestinationCountries: string[];
  preferredFundingTypes: ApiFundingType[];
  preferredStudyDomains?: ApiStudyDomain[];
  alertNewScholarships?: boolean;
  alertDeadlines?: boolean;
}

export interface ApiUpdateStudentPreferencesRequest {
  preferredDestinationCountries?: string[];
  preferredFundingTypes?: ApiFundingType[];
  preferredStudyDomains?: ApiStudyDomain[];
  alertNewScholarships?: boolean;
  alertDeadlines?: boolean;
}

export interface ApiStudentProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthYear?: number;
  isMinor: boolean;
  guardianConsentVerified?: boolean | null;
  nationality: string;
  residenceCountry: string;
  city?: string;
  // Supporte les profils incomplets à l'inscription sans inventer de faux diplômes
  highestDiplomaObtained: ApiAcademicLevel | '' | null;
  highestDiplomaName?: string;
  currentStudyLevel: ApiAcademicLevel | '' | null;
  targetStudyLevel: ApiAcademicLevel | '' | null;
  studyDomain: ApiStudyDomain | '' | null;
  currentInstitution?: string;
  academicYear?: string;
  averageGrade?: number | null;
  gradingScale: ApiGradingScale;
  normalizedGradeOut20?: number | null;
  languages: ApiLanguageSkillDto[];
  preferredDestinationCountries: string[];
  preferredFundingTypes: ApiFundingType[];
  institutionalVisibilityEnabled: boolean;
  visibilityConsentDate?: string | null;
  visibilityConsentAt?: string | null;
  visibilityRevokedAt?: string | null;
  allowAcademicScoreSharing: boolean;
  savedScholarshipIds: string[];
  updatedAt: string;
  academicRecords?: ApiAcademicRecordDto[];
  profileCompletion?: ApiProfileCompletionDto;
}

export interface ApiUpdateStudentProfileRequest {
  firstName: string;
  lastName: string;
  nationality: string;
  residenceCountry: string;
  city?: string;
  birthYear?: number;
  highestDiplomaObtained?: ApiAcademicLevel;
  highestDiplomaName?: string;
  currentStudyLevel?: ApiAcademicLevel;
  targetStudyLevel?: ApiAcademicLevel;
  studyDomain?: ApiStudyDomain;
  currentInstitution?: string;
  academicYear?: string;
  averageGrade?: number | null;
  gradingScale?: ApiGradingScale;
  languages?: ApiLanguageSkillDto[];
  preferredDestinationCountries?: string[];
  preferredFundingTypes?: ApiFundingType[];
}

export interface ApiPrivacyConsentUpdateRequest {
  institutionalVisibilityEnabled: boolean;
  allowAcademicScoreSharing?: boolean;
}

export interface ApiScholarshipCriteriaDto {
  eligibleNationalities: string[];
  requiredResidenceCountries: string[];
  requiredDiplomaObtained: ApiAcademicLevel[];
  allowedCurrentLevels?: ApiAcademicLevel[];
  targetStudyLevels: ApiAcademicLevel[];
  eligibleDomains: ApiStudyDomain[];
  minGradeOut20?: number | null;
  maxAge?: number | null;
  requiredLanguage?: 'Français' | 'Anglais' | 'Allemand' | null;
  minLanguageLevel?: ApiLanguageLevel;
  requiresLanguageCertification: boolean;
  specificConditions?: string[];
  preferentialCriteria?: string[];
}

export interface ApiModificationRecordDto {
  id: string;
  date: string;
  actorName: string;
  actorRole: ApiUserRole;
  summary: string;
}

export interface ApiScholarshipDto {
  id: string;
  code: string;
  title: string;
  organizationId: string;
  organizationName: string;
  organizationType: ApiOrganizationType;
  hostCountry: string;
  fundingType: ApiFundingType;
  financialSummary: string;
  deadline: string;
  startDate: string;
  durationMonths: number;
  slotsAvailable?: number | null;
  description: string;
  benefits: string[];
  requiredDocuments: string[];
  criteria: ApiScholarshipCriteriaDto;
  isDemoData?: boolean;
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  lastVerifiedAt?: string | null;
  verifiedByCurator?: string | null;
  curationStatus: ApiCurationStatus;
  status: ApiScholarshipStatus;
  modificationHistory: ApiModificationRecordDto[];
  duplicateSuspectOfId?: string | null;
  // Champs additifs v1.1
  publicationStatus?: ApiPublicationStatus;
  acquisitionChannel?: ApiScholarshipAcquisitionChannel;
  applicationUrl?: string | null;
  createdBy?: string;
  updatedAt?: string;
}

export interface ApiScholarshipPageDto {
  content: ApiScholarshipDto[];
  page: ApiPageInfo;
}

export interface ApiPublicScholarshipFilters {
  q?: string;
  targetLevel?: ApiAcademicLevel;
  requiredDiploma?: ApiAcademicLevel;
  domain?: ApiStudyDomain;
  hostCountry?: string;
  fundingType?: ApiFundingType;
  includeExpired?: boolean;
  onlyVerified?: boolean;
  sortBy?: 'DEADLINE_ASC' | 'MIN_GRADE_ASC' | 'RECENTLY_VERIFIED';
  page?: number;
  size?: number;
}

export interface ApiUpsertScholarshipRequest {
  title: string;
  hostCountry: string;
  fundingType: ApiFundingType;
  financialSummary: string;
  deadline: string;
  startDate: string;
  durationMonths: number;
  slotsAvailable?: number;
  description: string;
  benefits: string[];
  requiredDocuments: string[];
  criteria: ApiScholarshipCriteriaDto;
  sourceName: string;
  sourceUrl: string;
}

export interface ApiCreateScholarshipDraftRequest {
  title?: string;
  issuerOrganizationId?: string;
  issuerOrganizationName?: string;
  hostCountry?: string;
  fundingType?: ApiFundingType;
  financialSummary?: string;
  deadline?: string | null;
  startDate?: string | null;
  durationMonths?: number | null;
  description?: string;
  benefits?: string[];
  requiredDocuments?: string[];
  criteria?: ApiScholarshipCriteriaDto;
  sourceName?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  internalNotes?: string;
}

export type ApiUpdateScholarshipDraftRequest = Partial<ApiCreateScholarshipDraftRequest>;

export interface ApiScholarshipDraftDto {
  id: string;
  title?: string | null;
  publicationStatus: ApiPublicationStatus;
  acquisitionChannel: ApiScholarshipAcquisitionChannel;
  issuerOrganizationId?: string | null;
  issuerOrganizationName?: string | null;
  hostCountry?: string | null;
  fundingType?: ApiFundingType;
  financialSummary?: string | null;
  deadline?: string | null;
  startDate?: string | null;
  durationMonths?: number | null;
  description?: string | null;
  benefits?: string[];
  requiredDocuments?: string[];
  criteria?: ApiScholarshipCriteriaDto;
  sourceName?: string | null;
  sourceUrl?: string | null;
  applicationUrl?: string | null;
  missingPublicationFields?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  version: number;
}

export interface ApiScholarshipDraftPageDto {
  content: ApiScholarshipDraftDto[];
  page: ApiPageInfo;
}

export interface ApiPublishScholarshipRequest {
  expectedVersion?: number;
  editorialNote?: string;
  acknowledgeSourceVerified?: boolean;
}

export interface ApiAiExtractionRequest {
  sourceText?: string;
  sourceUrl?: string;
  sourceName?: string;
  language?: 'fr' | 'en' | 'de' | 'es';
  idempotencyKey?: string;
}

export interface ApiAiExtractionEvidence {
  field: string;
  sourceUrl: string;
  excerpt: string;
  confidenceLabel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ApiAiExtractedScholarshipDraft {
  title?: string | null;
  issuerOrganizationName?: string | null;
  hostCountry?: string | null;
  targetStudyLevels?: ApiAcademicLevel[];
  fundingType?: ApiFundingType;
  deadline?: string | null;
  criteria?: ApiScholarshipCriteriaDto;
  financialSummary?: string | null;
  description?: string | null;
  sourceUrl?: string | null;
}

export type ApiAiExtractionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ApiAiExtractionResultDto {
  extractionId: string;
  status: ApiAiExtractionStatus;
  draft?: ApiAiExtractedScholarshipDraft;
  evidence?: ApiAiExtractionEvidence[];
  missingFields?: string[];
  warnings?: string[];
  model?: string;
  promptVersion?: string;
  createdAt: string;
  completedAt?: string | null;
  requiresHumanReview: true;
}

export interface ApiIngestionJobRequest {
  sourceIds?: string[];
  query?: string;
  maxAnnouncements?: number;
  dryRun?: boolean;
}

export type ApiIngestionJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIALLY_COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ApiIngestionJobDto {
  jobId: string;
  status: ApiIngestionJobStatus;
  requestedBy?: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  scannedCount?: number;
  importedDraftCount: number;
  duplicateCount?: number;
  failedCount: number;
  warnings?: string[];
  dryRun?: boolean;
}

export interface ApiIngestionJobPageDto {
  content: ApiIngestionJobDto[];
  page: ApiPageInfo;
}

export interface ApiCriterionEvaluationItemDto {
  id: string;
  label: string;
  isMandatory: boolean;
  expectedValue: string;
  studentValue: string;
  status: ApiCriterionEvaluationStatus;
  explanation: string;
  missingFieldKey?: string | null;
}

export interface ApiEligibilityReportDto {
  scholarshipId: string;
  studentId: string;
  evaluatedAt: string;
  verdict: ApiEligibilityGlobalVerdict;
  verdictLabel: 'Potentiellement compatible' | 'À compléter' | 'À vérifier' | 'Incompatible';
  summaryExplanation: string;
  legalDisclaimer: string;
  satisfiedCount: number;
  totalMandatoryCount: number;
  items: ApiCriterionEvaluationItemDto[];
  warnings: string[];
}

export interface ApiEvaluatedScholarshipItemDto {
  scholarship: ApiScholarshipDto;
  report: ApiEligibilityReportDto;
}

export interface ApiRecommendationItemDto {
  scholarship: ApiScholarshipDto;
  report: ApiEligibilityReportDto;
  reasons: string[];
  preferenceScore: number;
}

export interface ApiRecommendationsResponseDto {
  appliedCriteriaSummary: {
    highestDiplomaObtained?: ApiAcademicLevel;
    targetStudyLevel?: ApiAcademicLevel;
    studyDomain?: ApiStudyDomain;
    preferredDestinationCountries?: string[];
  };
  strongMatches: ApiRecommendationItemDto[];
  toCompleteOrVerify: ApiRecommendationItemDto[];
}

export interface ApiStudentDashboardResponseDto {
  displayName: string;
  recommendations: ApiRecommendationItemDto[];
  favoriteCount: number;
  unreadInvitationCount: number;
  unreadNotificationCount: number;
  upcomingDeadlines?: ApiScholarshipDto[];
  profileCompletion: ApiProfileCompletionDto;
}

export interface ApiAnonymizedCandidateProfileDto {
  /**
   * LEGACY property name: value MUST be a public opaque candidate token,
   * never an internal user/student DB id.
   */
  studentId: string;
  candidatePublicId?: string;
  anonymizedCode: string;
  highestDiplomaObtained: ApiAcademicLevel;
  currentStudyLevel: ApiAcademicLevel;
  targetStudyLevel: ApiAcademicLevel;
  studyDomain: ApiStudyDomain;
  nationality: string;
  residenceCountry: string;
  normalizedGradeOut20?: number | null;
  languages: ApiLanguageSkillDto[];
}

export interface ApiInvitationDto {
  id: string;
  organizationId: string;
  organizationName: string;
  scholarshipId: string;
  scholarshipTitle: string;
  studentId: string;
  studentAnonymizedCode: string;
  studentDisplayName?: string;
  message: string;
  sentAt: string;
  respondedAt?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  studentResponseNote?: string | null;
  consentToShareDossier: boolean;
}

export interface ApiSendInvitationRequest {
  studentId: string;
  scholarshipId: string;
  message: string;
}

export interface ApiRespondInvitationRequest {
  accept: boolean;
  note?: string;
}

export interface ApiApplicationRecordDto {
  id: string;
  referenceCode: string;
  scholarshipId: string;
  scholarshipTitle: string;
  organizationId: string;
  organizationName: string;
  studentId: string;
  studentName: string;
  studentHighestDiploma: ApiAcademicLevel;
  studentCurrentLevel: ApiAcademicLevel;
  studentTargetLevel: ApiAcademicLevel;
  studentDomain: ApiStudyDomain;
  studentGradeOut20?: number | null;
  studentNationality: string;
  submittedAt: string;
  updatedAt: string;
  status: ApiApplicationStatus;
  evaluatorNotes: string;
  evaluatorScoreOut100?: number | null;
  decisionRecordedAt?: string | null;
  decisionJustification?: string | null;
  originatedFromInvitationId?: string | null;
}

export interface ApiSubmitApplicationRequest {
  scholarshipId: string;
  motivationNote?: string;
}

export interface ApiEvaluateApplicationRequest {
  status: ApiApplicationStatus;
  evaluatorNotes?: string;
  evaluatorScoreOut100?: number;
  decisionJustification?: string;
}

export interface ApiEvaluatorMemberDto {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE';
  active: boolean;
}

export interface ApiAddEvaluatorRequest {
  name: string;
  email: string;
  roleTitle: string;
  permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE';
}

export interface ApiOrganizationProfileDto {
  id: string;
  userId: string;
  officialName: string;
  type: ApiOrganizationType;
  country: string;
  address?: string;
  website?: string;
  contactEmail: string;
  contactPersonName: string;
  contactPersonRole?: string;
  description?: string;
  registrationNumber: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  verifiedAt?: string | null;
  activePlan: ApiPlanTierId;
  evaluators: ApiEvaluatorMemberDto[];
}

export interface ApiUpdateOrganizationProfileRequest {
  officialName?: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  description?: string;
}

export type ApiOrganizationCampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'CLOSED'
  | 'ARCHIVED';

export interface ApiOrganizationCampaignDto {
  id: string;
  scholarshipId: string;
  organizationId: string;
  title: string;
  status: ApiOrganizationCampaignStatus;
  applicationDeadline?: string | null;
  slotsAvailable?: number;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface ApiUpsertOrganizationCampaignRequest {
  scholarshipId: string;
  title: string;
  applicationDeadline?: string | null;
  slotsAvailable?: number;
  notes?: string;
}

export interface ApiCommercialSubscriptionDto {
  id: string;
  organizationId: string;
  organizationName: string;
  planId: ApiPlanTierId;
  planName: string;
  amountFcfa: number;
  billingCycle: 'Mensuel' | 'Campagne ponctuelle' | 'Gratuit';
  status: 'ACTIF_SIMULE' | 'EN_ATTENTE_SIMULE' | 'EXPIRE';
  startedAt: string;
  nextRenewalAt?: string | null;
}

export interface ApiOrganizationPlanDto {
  id: ApiPlanTierId;
  displayName: string;
  priceFcfa: number;
  billingCycle: 'MONTHLY' | 'SINGLE_CAMPAIGN' | 'FREE';
  features: string[];
  studentFree: boolean;
  illustrativePricing?: boolean;
}

export interface ApiOrganizationPlanCatalogDto {
  plans: ApiOrganizationPlanDto[];
  studentEssentialFeaturesAreFree: true;
  disclaimer?: string;
}

export interface ApiSubscriptionRequestDto {
  id: string;
  organizationId: string;
  requestedPlan: ApiPlanTierId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  decidedAt?: string | null;
  activationConfirmed?: boolean;
  requestNote?: string;
}

export interface ApiRequestSubscriptionChange {
  planId: ApiPlanTierId;
  requestNote?: string;
}

export interface ApiDecideSubscriptionRequest {
  approve: boolean;
  reason?: string;
  paymentConfirmed?: boolean;
}

export interface ApiCurateScholarshipRequest {
  curationStatus: ApiCurationStatus;
  summaryNote?: string;
  updatedFields?: ApiUpsertScholarshipRequest;
}

export interface ApiOfficialSourceDto {
  id: string;
  name: string;
  institutionType: string;
  country: string;
  officialUrl: string;
  reliabilityStatus: 'FIABLE' | 'A_SURVEILLER' | 'SUSPECTE';
  lastCheckedAt: string;
  activeAnnouncementsCount: number;
  notes: string;
}

export interface ApiCreateOfficialSourceRequest {
  name: string;
  country: string;
  officialUrl: string;
  institutionType?: string;
  notes?: string;
}

export interface ApiDuplicateCandidateDto {
  id: string;
  primaryScholarshipId: string;
  duplicateScholarshipId: string;
  similarityScore: number;
  detectedReasons: string[];
  status: 'PENDING' | 'MERGED_ARCHIVED' | 'DISMISSED';
}

export interface ApiAppNotificationDto {
  id: string;
  userId: string;
  role: ApiUserRole;
  category: 'DEADLINE' | 'INVITATION' | 'NEW_SCHOLARSHIP' | 'CURATION' | 'SYSTEM';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo: string;
}

export interface ApiAuditLogEntryDto {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: ApiUserRole;
  actionType:
    | 'CURATION_DECISION'
    | 'ORG_VERIFICATION'
    | 'PRIVACY_CONSENT'
    | 'CAMPAIGN_PUBLISHED'
    | 'AWARD_DECISION'
    | 'ACCOUNT_STATUS';
  targetLabel: string;
  details: string;
}

export interface ApiAdminOverviewResponseDto {
  totalUsers: number;
  totalPublishedScholarships: number;
  pendingReviewScholarships: number;
  pendingOrganizationVerifications: number;
  activeIngestionJobs?: number;
  totalOrganizations?: number;
}
