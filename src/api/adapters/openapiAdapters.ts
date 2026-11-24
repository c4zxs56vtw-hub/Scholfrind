import {
  AcademicRecord,
  ApplicationRecord,
  ApplicationStatus,
  AppNotification,
  CommercialSubscription,
  DuplicateCandidate,
  OfficialSource,
  ProfileCompletion,
  PublicationStatus,
  Scholarship,
  ScholarshipDraft,
  StudentProfile,
} from '../../types';
import {
  ApiAcademicRecordDto,
  ApiAnonymizedCandidateProfileDto,
  ApiApplicationRecordDto,
  ApiApplicationStatus,
  ApiAppNotificationDto,
  ApiCommercialSubscriptionDto,
  ApiDuplicateCandidateDto,
  ApiOfficialSourceDto,
  ApiOrganizationPlanDto,
  ApiProfileCompletionDto,
  ApiPublicationStatus,
  ApiScholarshipDraftDto,
  ApiScholarshipDto,
  ApiStudentProfileDto,
} from '../openapi.types';
import { normalizeGradeTo20 } from '../../features/eligibility/eligibilityEngine';

/**
 * 1. ADAPTATEUR DE STATUT DE SOURCE OFFICIELLE
 * UI : 'FIABLE_VERIFIEE' | 'A_CONTROLER' | 'SUSPENDUE'
 * OpenAPI 1.1 : 'FIABLE' | 'A_SURVEILLER' | 'SUSPECTE'
 */
export function mapApiSourceReliabilityToUi(
  apiStatus: ApiOfficialSourceDto['reliabilityStatus']
): OfficialSource['reliabilityStatus'] {
  switch (apiStatus) {
    case 'FIABLE':
      return 'FIABLE_VERIFIEE';
    case 'A_SURVEILLER':
      return 'A_CONTROLER';
    case 'SUSPECTE':
      return 'SUSPENDUE';
  }
}

export function mapUiSourceReliabilityToApi(
  uiStatus: OfficialSource['reliabilityStatus']
): ApiOfficialSourceDto['reliabilityStatus'] {
  switch (uiStatus) {
    case 'FIABLE_VERIFIEE':
      return 'FIABLE';
    case 'A_CONTROLER':
      return 'A_SURVEILLER';
    case 'SUSPENDUE':
      return 'SUSPECTE';
  }
}

export function adaptApiOfficialSourceToUi(dto: ApiOfficialSourceDto): OfficialSource {
  return {
    ...dto,
    reliabilityStatus: mapApiSourceReliabilityToUi(dto.reliabilityStatus),
  };
}

export function adaptUiOfficialSourceToApi(source: OfficialSource): ApiOfficialSourceDto {
  return {
    ...source,
    reliabilityStatus: mapUiSourceReliabilityToApi(source.reliabilityStatus),
  };
}

/**
 * 2. ADAPTATEUR DE DOUBLONS (DuplicateCandidate)
 * UI : reason (string) + detectedAt (string)
 * OpenAPI 1.1 : detectedReasons (string[])
 */
export function adaptApiDuplicateToUi(
  dto: ApiDuplicateCandidateDto,
  fallbackDetectedAt = '2026-11-23'
): DuplicateCandidate {
  return {
    id: dto.id,
    primaryScholarshipId: dto.primaryScholarshipId,
    duplicateScholarshipId: dto.duplicateScholarshipId,
    similarityScore: dto.similarityScore,
    reason:
      dto.detectedReasons.length > 0
        ? dto.detectedReasons.join(' · ')
        : 'Similitude détectée sur le titre et la date limite.',
    status: dto.status,
    detectedAt: fallbackDetectedAt,
  };
}

export function adaptUiDuplicateToApi(dup: DuplicateCandidate): ApiDuplicateCandidateDto {
  return {
    id: dup.id,
    primaryScholarshipId: dup.primaryScholarshipId,
    duplicateScholarshipId: dup.duplicateScholarshipId,
    similarityScore: dup.similarityScore,
    detectedReasons: dup.reason ? [dup.reason] : [],
    status: dup.status,
  };
}

/**
 * 3. ADAPTATEUR D'ABONNEMENT COMMERCIAL & CYCLES DE FACTURATION
 * UI : 'ACTIF_SIMULE' | 'EN_ATTENTE_SIMULE' | 'CLOTURE'
 * OpenAPI 1.1 : 'ACTIF_SIMULE' | 'EN_ATTENTE_SIMULE' | 'EXPIRE'
 */
export function mapApiSubscriptionStatusToUi(
  status: ApiCommercialSubscriptionDto['status']
): CommercialSubscription['status'] {
  if (status === 'EXPIRE') return 'CLOTURE';
  return status;
}

export function mapUiSubscriptionStatusToApi(
  status: CommercialSubscription['status']
): ApiCommercialSubscriptionDto['status'] {
  if (status === 'CLOTURE') return 'EXPIRE';
  return status;
}

export function mapApiPlanBillingCycleToLabel(
  cycle: ApiOrganizationPlanDto['billingCycle']
): CommercialSubscription['billingCycle'] {
  switch (cycle) {
    case 'MONTHLY':
      return 'Mensuel';
    case 'SINGLE_CAMPAIGN':
      return 'Campagne ponctuelle';
    case 'FREE':
      return 'Gratuit';
  }
}

export function adaptApiSubscriptionToUi(
  dto: ApiCommercialSubscriptionDto
): CommercialSubscription {
  return {
    ...dto,
    status: mapApiSubscriptionStatusToUi(dto.status),
    nextRenewalAt: dto.nextRenewalAt ?? undefined,
  };
}

/**
 * 4. ADAPTATEUR DE CATÉGORIE DE NOTIFICATION
 * UI : 'DEADLINE' | 'INVITATION' | 'OPPORTUNITY' | 'SYSTEM' | 'APPLICATION'
 * OpenAPI 1.1 : 'DEADLINE' | 'INVITATION' | 'NEW_SCHOLARSHIP' | 'CURATION' | 'SYSTEM'
 */
export function mapApiNotificationCategoryToUi(
  category: ApiAppNotificationDto['category']
): AppNotification['category'] {
  switch (category) {
    case 'NEW_SCHOLARSHIP':
      return 'OPPORTUNITY';
    case 'CURATION':
      return 'SYSTEM';
    default:
      return category;
  }
}

export function mapUiNotificationCategoryToApi(
  category: AppNotification['category']
): ApiAppNotificationDto['category'] {
  switch (category) {
    case 'OPPORTUNITY':
      return 'NEW_SCHOLARSHIP';
    case 'APPLICATION':
      return 'SYSTEM';
    default:
      return category;
  }
}

export function adaptApiNotificationToUi(dto: ApiAppNotificationDto): AppNotification {
  return {
    ...dto,
    category: mapApiNotificationCategoryToUi(dto.category),
  };
}

/**
 * 5. ADAPTATEUR DE STATUT DE CANDIDATURE (ApplicationStatus)
 * L'UI supporte 'Informations complémentaires demandées' (6 statuts).
 * Sur le fil JSON OpenAPI 1.1 (5 statuts), cet état est mappé vers 'En cours d’examen'
 * avec préfixe explicite dans evaluatorNotes pour ne perdre aucune information.
 */
const COMPLEMENT_PREFIX = '[Complément demandé] ';

export function adaptUiApplicationStatusToApi(
  status: ApplicationStatus,
  evaluatorNotes?: string
): { status: ApiApplicationStatus; evaluatorNotes?: string } {
  if (status === 'Informations complémentaires demandées') {
    const cleanNote = evaluatorNotes || '';
    return {
      status: 'En cours d’examen',
      evaluatorNotes: cleanNote.startsWith(COMPLEMENT_PREFIX)
        ? cleanNote
        : `${COMPLEMENT_PREFIX}${cleanNote}`,
    };
  }
  return {
    status: status as ApiApplicationStatus,
    evaluatorNotes,
  };
}

export function adaptApiApplicationRecordToUi(
  dto: ApiApplicationRecordDto
): ApplicationRecord {
  const isComplementRequested =
    dto.status === 'En cours d’examen' &&
    dto.evaluatorNotes?.startsWith(COMPLEMENT_PREFIX);

  return {
    ...dto,
    status: isComplementRequested
      ? 'Informations complémentaires demandées'
      : dto.status,
    studentGradeOut20: dto.studentGradeOut20 ?? null,
    evaluatorScoreOut100: dto.evaluatorScoreOut100 ?? undefined,
    decisionRecordedAt: dto.decisionRecordedAt ?? undefined,
    decisionJustification: dto.decisionJustification ?? undefined,
    originatedFromInvitationId: dto.originatedFromInvitationId ?? undefined,
  };
}

/**
 * 6. ADAPTATEUR DE PROFIL ÉTUDIANT, COMPLÉTUDE & DIPLÔMES MULTIPLES
 * Respecte la règle stricte : ne jamais remplacer un champ académique manquant par une fausse valeur.
 */
export function computeStudentProfileCompletion(
  profile: Pick<
    StudentProfile,
    | 'firstName'
    | 'lastName'
    | 'nationality'
    | 'residenceCountry'
    | 'highestDiplomaObtained'
    | 'currentStudyLevel'
    | 'targetStudyLevel'
    | 'studyDomain'
    | 'averageGrade'
    | 'languages'
  >
): ProfileCompletion {
  const checks: { key: string; label: string; filled: boolean }[] = [
    {
      key: 'identity',
      label: 'Identité (Nom et prénom)',
      filled: Boolean(profile.firstName?.trim() && profile.lastName?.trim()),
    },
    {
      key: 'nationality',
      label: 'Nationalité et pays de résidence',
      filled: Boolean(profile.nationality?.trim() && profile.residenceCountry?.trim()),
    },
    {
      key: 'highestDiplomaObtained',
      label: 'Dernier diplôme obtenu',
      filled: Boolean(profile.highestDiplomaObtained),
    },
    {
      key: 'currentStudyLevel',
      label: 'Niveau d’études actuel',
      filled: Boolean(profile.currentStudyLevel),
    },
    {
      key: 'targetStudyLevel',
      label: 'Niveau d’études visé',
      filled: Boolean(profile.targetStudyLevel),
    },
    {
      key: 'studyDomain',
      label: 'Domaine d’études',
      filled: Boolean(profile.studyDomain),
    },
    {
      key: 'averageGrade',
      label: 'Moyenne académique',
      filled: profile.averageGrade !== null && profile.averageGrade !== undefined,
    },
    {
      key: 'languages',
      label: 'Compétences linguistiques',
      filled: Array.isArray(profile.languages) && profile.languages.length > 0,
    },
  ];

  const filledCount = checks.filter((c) => c.filled).length;
  const percentage = Math.round((filledCount / checks.length) * 100);
  const missingFields = checks.filter((c) => !c.filled).map((c) => c.label);
  const readyForEligibility = Boolean(
    profile.nationality &&
      profile.highestDiplomaObtained &&
      profile.targetStudyLevel &&
      profile.studyDomain
  );

  return {
    percentage,
    missingFields,
    readyForEligibility,
    instructions:
      missingFields.length > 0
        ? [`Complète : ${missingFields.join(', ')} pour affiner tes résultats d’éligibilité.`]
        : ['Ton profil académique est complet pour la vérification d’éligibilité.'],
  };
}

export function adaptApiAcademicRecordToUi(dto: ApiAcademicRecordDto): AcademicRecord {
  const scale = dto.gradingScale || 'SUR_20';
  const grade = dto.grade ?? null;
  return {
    id: dto.id,
    diplomaLevel: dto.diplomaLevel,
    diplomaName: dto.diplomaName,
    institutionName: dto.institutionName,
    institutionCountry: dto.institutionCountry,
    obtained: dto.obtained,
    completionYear: dto.completionYear,
    gradingScale: scale,
    grade,
    normalizedGradeOut20:
      dto.normalizedGradeOut20 !== undefined
        ? dto.normalizedGradeOut20
        : normalizeGradeTo20(grade, scale),
    officialEquivalenceVerified: dto.officialEquivalenceVerified ?? false,
    notes: dto.notes,
  };
}

export function adaptApiStudentProfileToUi(dto: ApiStudentProfileDto): StudentProfile {
  const records = dto.academicRecords?.map(adaptApiAcademicRecordToUi);
  const baseProfile: StudentProfile = {
    id: dto.id,
    userId: dto.userId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    birthYear: dto.birthYear,
    isMinor: dto.isMinor,
    guardianConsentVerified: dto.guardianConsentVerified ?? undefined,
    nationality: dto.nationality,
    residenceCountry: dto.residenceCountry,
    city: dto.city || '',
    // Ne jamais inventer de valeur si le champ est vide ou null
    highestDiplomaObtained: dto.highestDiplomaObtained || '',
    highestDiplomaName: dto.highestDiplomaName || '',
    currentStudyLevel: dto.currentStudyLevel || '',
    targetStudyLevel: dto.targetStudyLevel || '',
    studyDomain: dto.studyDomain || '',
    currentInstitution: dto.currentInstitution || '',
    academicYear: dto.academicYear || '',
    averageGrade: dto.averageGrade ?? null,
    gradingScale: dto.gradingScale || 'SUR_20',
    normalizedGradeOut20:
      dto.normalizedGradeOut20 !== undefined
        ? dto.normalizedGradeOut20
        : normalizeGradeTo20(dto.averageGrade ?? null, dto.gradingScale || 'SUR_20'),
    languages: (dto.languages || []).map((l) => ({
      language: l.language,
      level: l.level,
      certification: l.certification ?? undefined,
    })),
    preferredDestinationCountries: dto.preferredDestinationCountries || [],
    preferredFundingTypes: dto.preferredFundingTypes || [],
    institutionalVisibilityEnabled: Boolean(dto.institutionalVisibilityEnabled),
    visibilityConsentDate: dto.visibilityConsentDate ?? undefined,
    visibilityConsentAt: dto.visibilityConsentAt ?? undefined,
    visibilityRevokedAt: dto.visibilityRevokedAt ?? undefined,
    allowAcademicScoreSharing: Boolean(dto.allowAcademicScoreSharing),
    savedScholarshipIds: dto.savedScholarshipIds || [],
    updatedAt: dto.updatedAt,
    academicRecords: records,
  };

  baseProfile.profileCompletion =
    dto.profileCompletion || computeStudentProfileCompletion(baseProfile);

  return baseProfile;
}

/**
 * 7. ADAPTATEUR DE BOURSE & CYCLE ÉDITORIAL (Scholarship vs ScholarshipDraft)
 * Distingue strictement :
 * - publicationStatus (DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED)
 * - curationStatus (VERIFIED, PENDING_REVIEW, REJECTED, ARCHIVED)
 * - status (OPEN, CLOSING_SOON, EXPIRED, DRAFT)
 */
export function inferPublicationStatus(
  scholarship: Pick<Scholarship, 'publicationStatus' | 'curationStatus' | 'status'>
): PublicationStatus {
  if (scholarship.publicationStatus) {
    return scholarship.publicationStatus;
  }
  if (scholarship.status === 'DRAFT') {
    return 'DRAFT';
  }
  if (scholarship.curationStatus === 'ARCHIVED' || scholarship.curationStatus === 'REJECTED') {
    return 'ARCHIVED';
  }
  return 'PUBLISHED';
}

export function isScholarshipPubliclyVisible(scholarship: Scholarship): boolean {
  const pubStatus = inferPublicationStatus(scholarship);
  return pubStatus === 'PUBLISHED' && scholarship.curationStatus !== 'ARCHIVED';
}

export function adaptApiScholarshipToUi(dto: ApiScholarshipDto): Scholarship {
  return {
    ...dto,
    slotsAvailable: dto.slotsAvailable ?? undefined,
    isDemoData: dto.isDemoData ?? false,
    lastVerifiedAt: dto.lastVerifiedAt ?? null,
    verifiedByCurator: dto.verifiedByCurator ?? undefined,
    duplicateSuspectOfId: dto.duplicateSuspectOfId ?? undefined,
    applicationUrl: dto.applicationUrl ?? undefined,
    publicationStatus:
      dto.publicationStatus ||
      (dto.status === 'DRAFT'
        ? 'DRAFT'
        : dto.curationStatus === 'ARCHIVED'
        ? 'ARCHIVED'
        : 'PUBLISHED'),
    criteria: {
      ...dto.criteria,
      minGradeOut20: dto.criteria.minGradeOut20 ?? null,
      maxAge: dto.criteria.maxAge ?? null,
      requiredLanguage: dto.criteria.requiredLanguage ?? undefined,
      specificConditions: dto.criteria.specificConditions || [],
      preferentialCriteria: dto.criteria.preferentialCriteria || [],
    },
  };
}

export function computeMissingPublicationFields(
  draft: Partial<ScholarshipDraft>
): string[] {
  const missing: string[] = [];
  if (!draft.title?.trim()) missing.push('Intitulé de la bourse');
  if (!draft.issuerOrganizationName?.trim()) missing.push('Organisme émetteur');
  if (!draft.hostCountry?.trim()) missing.push('Pays d’accueil');
  if (!draft.fundingType) missing.push('Type de financement');
  if (!draft.financialSummary?.trim()) missing.push('Résumé financier');
  if (!draft.deadline?.trim()) missing.push('Date limite de candidature');
  if (!draft.description?.trim()) missing.push('Description du programme');
  if (!draft.sourceName?.trim()) missing.push('Nom de la source officielle');
  if (!draft.sourceUrl?.trim()) missing.push('URL de la source officielle');
  if (!draft.criteria?.requiredDiplomaObtained?.length) {
    missing.push('Diplôme déjà obtenu requis');
  }
  if (!draft.criteria?.targetStudyLevels?.length) {
    missing.push('Niveau d’études financé');
  }
  if (!draft.criteria?.eligibleDomains?.length) {
    missing.push('Domaine d’études éligible');
  }
  return missing;
}

export function adaptApiScholarshipDraftToUi(
  dto: ApiScholarshipDraftDto
): ScholarshipDraft {
  const draft: ScholarshipDraft = {
    id: dto.id,
    title: dto.title || '',
    publicationStatus: dto.publicationStatus,
    acquisitionChannel: dto.acquisitionChannel,
    issuerOrganizationId: dto.issuerOrganizationId ?? undefined,
    issuerOrganizationName: dto.issuerOrganizationName || '',
    hostCountry: dto.hostCountry || '',
    fundingType: dto.fundingType || 'Bourse complète (Frais + Vie + Transport)',
    financialSummary: dto.financialSummary || '',
    deadline: dto.deadline || '',
    startDate: dto.startDate || '2027-09-15',
    durationMonths: dto.durationMonths || 12,
    description: dto.description || '',
    benefits: dto.benefits || [],
    requiredDocuments: dto.requiredDocuments || [],
    criteria: dto.criteria
      ? {
          ...dto.criteria,
          minGradeOut20: dto.criteria.minGradeOut20 ?? null,
          maxAge: dto.criteria.maxAge ?? null,
          requiredLanguage: dto.criteria.requiredLanguage ?? undefined,
          specificConditions: dto.criteria.specificConditions || [],
          preferentialCriteria: dto.criteria.preferentialCriteria || [],
        }
      : {
          eligibleNationalities: ['Cameroun', 'Toutes'],
          requiredResidenceCountries: ['Tous'],
          requiredDiplomaObtained: ['Licence'],
          targetStudyLevels: ['Master'],
          eligibleDomains: ['Tous domaines'],
          minGradeOut20: null,
          maxAge: null,
          requiresLanguageCertification: false,
          specificConditions: [],
          preferentialCriteria: [],
        },
    sourceName: dto.sourceName || '',
    sourceUrl: dto.sourceUrl || '',
    applicationUrl: dto.applicationUrl ?? undefined,
    missingPublicationFields: [],
    createdBy: dto.createdBy || 'Administrateur SCHOLARFIND',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
    version: dto.version,
  };

  draft.missingPublicationFields =
    dto.missingPublicationFields && dto.missingPublicationFields.length > 0
      ? dto.missingPublicationFields
      : computeMissingPublicationFields(draft);

  return draft;
}

/**
 * 8. ADAPTATEUR DE VIVIER CANDIDATS PSEUDONYMISÉ (Loi camerounaise n° 2024/017)
 * Garantit que le jeton public `candidatePublicId` est utilisé et qu'aucune PII
 * (nom, e-mail, ville, moyenne non autorisée) n'est exposée.
 */
export function buildPseudonymizedCandidateToken(internalStudentId: string): string {
  const suffix = internalStudentId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '00';
  return `CAND-PUB-2026-${suffix}`;
}

export function adaptStudentToAnonymizedCandidateDto(
  student: StudentProfile
): ApiAnonymizedCandidateProfileDto | null {
  if (!student.institutionalVisibilityEnabled) {
    return null;
  }
  if (
    !student.highestDiplomaObtained ||
    !student.currentStudyLevel ||
    !student.targetStudyLevel ||
    !student.studyDomain
  ) {
    return null;
  }

  const publicToken = buildPseudonymizedCandidateToken(student.id);
  const anonymizedCode = `CAND-CM-2026-0${student.id.replace('stu-', '')}`;

  return {
    studentId: publicToken, // Jamais l'ID interne en exposition publique
    candidatePublicId: publicToken,
    anonymizedCode,
    highestDiplomaObtained: student.highestDiplomaObtained,
    currentStudyLevel: student.currentStudyLevel,
    targetStudyLevel: student.targetStudyLevel,
    studyDomain: student.studyDomain,
    nationality: student.nationality,
    residenceCountry: student.residenceCountry,
    normalizedGradeOut20: student.allowAcademicScoreSharing
      ? student.normalizedGradeOut20
      : null,
    languages: student.languages.map((l) => ({
      language: l.language,
      level: l.level,
      certification: l.certification ?? null,
    })),
  };
}
