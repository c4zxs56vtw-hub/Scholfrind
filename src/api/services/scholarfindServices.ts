import { getApiRuntimeConfig } from '../apiConfig';
import { executeHttpRequest } from '../httpClient';
import {
  adaptApiAcademicRecordToUi,
  adaptApiApplicationRecordToUi,
  adaptApiDuplicateToUi,
  adaptApiNotificationToUi,
  adaptApiOfficialSourceToUi,
  adaptApiScholarshipDraftToUi,
  adaptApiScholarshipToUi,
  adaptApiStudentProfileToUi,
  adaptApiSubscriptionToUi,
  adaptUiApplicationStatusToApi,
  adaptUiOfficialSourceToApi,
  computeMissingPublicationFields,
  computeStudentProfileCompletion,
  isScholarshipPubliclyVisible,
  mapUiSourceReliabilityToApi,
} from '../adapters/openapiAdapters';
import {
  ApiAcademicRecordDto,
  ApiAdminOverviewResponseDto,
  ApiAiExtractionRequest,
  ApiAiExtractionResultDto,
  ApiAnonymizedCandidateProfileDto,
  ApiApplicationRecordDto,
  ApiAppNotificationDto,
  ApiAuditLogEntryDto,
  ApiCommercialSubscriptionDto,
  ApiCreateOfficialSourceRequest,
  ApiCreateScholarshipDraftRequest,
  ApiCurateScholarshipRequest,
  ApiDecideSubscriptionRequest,
  ApiDuplicateCandidateDto,
  ApiEligibilityReportDto,
  ApiEvaluateApplicationRequest,
  ApiIngestionJobDto,
  ApiIngestionJobPageDto,
  ApiIngestionJobRequest,
  ApiInvitationDto,
  ApiOfficialSourceDto,
  ApiOrganizationCampaignDto,
  ApiOrganizationPlanCatalogDto,
  ApiOrganizationProfileDto,
  ApiProfileCompletionDto,
  ApiPublicScholarshipFilters,
  ApiPublishScholarshipRequest,
  ApiRecommendationsResponseDto,
  ApiRequestSubscriptionChange,
  ApiRespondInvitationRequest,
  ApiScholarshipDraftDto,
  ApiScholarshipDraftPageDto,
  ApiScholarshipDto,
  ApiScholarshipPageDto,
  ApiSendInvitationRequest,
  ApiStudentDashboardResponseDto,
  ApiStudentPreferencesDto,
  ApiStudentProfileDto,
  ApiSubmitApplicationRequest,
  ApiSubscriptionRequestDto,
  ApiUpdateOrganizationProfileRequest,
  ApiUpdateScholarshipDraftRequest,
  ApiUpdateStudentPreferencesRequest,
  ApiUpdateStudentProfileRequest,
  ApiUpsertAcademicRecordRequest,
  ApiUpsertOrganizationCampaignRequest,
  ApiUpsertScholarshipRequest,
  ApiUserAccountDto,
  ApiUserRole,
} from '../openapi.types';
import {
  AcademicRecord,
  AiExtractionResult,
  ApplicationRecord,
  ApplicationStatus,
  AppNotification,
  CommercialSubscription,
  DuplicateCandidate,
  EligibilityReport,
  IngestionJob,
  OfficialSource,
  OrganizationCampaign,
  ProfileCompletion,
  Scholarship,
  ScholarshipDraft,
  StudentProfile,
  SubscriptionRequest,
} from '../../types';
import { evaluateScholarshipEligibility } from '../../features/eligibility/eligibilityEngine';

/**
 * Couche de services métier SCHOLARFIND alignée sur les 92 opérations
 * du contrat OpenAPI 1.1 (`SCHOLARFIND_API_Contrat_1.1_compatible.yaml`).
 *
 * COMPORTEMENT :
 * - En mode 'mock' (défaut) : opère de manière synchrone/asynchrone sur les données
 *   de démonstration sans émettre de requête HTTP.
 * - En mode 'real' : invoque `executeHttpRequest()` sur les chemins exacts du contrat
 *   et applique les adaptateurs de données.
 */

// ============================================================================
// 1. CATALOGUE PUBLIC & RECHERCHE (/scholarships, /scholarships/search, /public/plans)
// ============================================================================
export const scholarshipApiService = {
  /**
   * operationId: searchScholarships
   * GET /scholarships -> retourne TOUJOURS un tableau Scholarship[] (compatibilité v1.0)
   */
  async searchScholarships(
    filters: ApiPublicScholarshipFilters,
    mockScholarships: Scholarship[]
  ): Promise<Scholarship[]> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dtos = await executeHttpRequest<ApiScholarshipDto[]>({
        method: 'GET',
        path: '/scholarships',
        query: {
          q: filters.q,
          targetLevel: filters.targetLevel,
          requiredDiploma: filters.requiredDiploma,
          domain: filters.domain,
          hostCountry: filters.hostCountry,
          fundingType: filters.fundingType,
          includeExpired: filters.includeExpired,
          onlyVerified: filters.onlyVerified,
          sortBy: filters.sortBy,
        },
      });
      return dtos.map(adaptApiScholarshipToUi);
    }

    return mockScholarships.filter((s) => {
      if (!isScholarshipPubliclyVisible(s)) return false;
      if (!filters.includeExpired && s.status === 'EXPIRED') return false;
      if (filters.onlyVerified && s.curationStatus !== 'VERIFIED') return false;
      if (
        filters.q &&
        !`${s.title} ${s.organizationName} ${s.hostCountry} ${s.description}`
          .toLowerCase()
          .includes(filters.q.toLowerCase())
      ) {
        return false;
      }
      if (filters.hostCountry && s.hostCountry !== filters.hostCountry) return false;
      if (
        filters.targetLevel &&
        !s.criteria.targetStudyLevels.includes(filters.targetLevel)
      ) {
        return false;
      }
      if (
        filters.requiredDiploma &&
        !s.criteria.requiredDiplomaObtained.includes(filters.requiredDiploma)
      ) {
        return false;
      }
      if (
        filters.domain &&
        !s.criteria.eligibleDomains.includes(filters.domain) &&
        !s.criteria.eligibleDomains.includes('Tous domaines')
      ) {
        return false;
      }
      if (filters.fundingType && s.fundingType !== filters.fundingType) return false;
      return true;
    });
  },

  /**
   * operationId: searchScholarshipsPage
   * GET /scholarships/search -> retourne { content: Scholarship[], page: PageInfo } (additif v1.1)
   */
  async searchScholarshipsPage(
    filters: ApiPublicScholarshipFilters,
    mockScholarships: Scholarship[]
  ): Promise<{ content: Scholarship[]; page: ApiScholarshipPageDto['page'] }> {
    const config = getApiRuntimeConfig();
    const page = filters.page ?? 0;
    const size = filters.size ?? 20;

    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiScholarshipPageDto>({
        method: 'GET',
        path: '/scholarships/search',
        query: {
          ...filters,
          page,
          size,
        },
      });
      return {
        content: dto.content.map(adaptApiScholarshipToUi),
        page: dto.page,
      };
    }

    const allFiltered = await this.searchScholarships(filters, mockScholarships);
    const start = page * size;
    const slice = allFiltered.slice(start, start + size);
    return {
      content: slice,
      page: {
        page,
        size,
        totalElements: allFiltered.length,
        totalPages: Math.max(1, Math.ceil(allFiltered.length / size)),
      },
    };
  },

  /**
   * operationId: getScholarshipById
   * GET /scholarships/{scholarshipId}
   */
  async getScholarshipById(
    scholarshipId: string,
    mockScholarships: Scholarship[]
  ): Promise<Scholarship | undefined> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiScholarshipDto>({
        method: 'GET',
        path: `/scholarships/${scholarshipId}`,
      });
      return adaptApiScholarshipToUi(dto);
    }
    return mockScholarships.find((s) => s.id === scholarshipId);
  },

  /**
   * operationId: getPublicOrganizationPlans
   * GET /public/plans
   */
  async getPublicOrganizationPlans(): Promise<ApiOrganizationPlanCatalogDto> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      return executeHttpRequest<ApiOrganizationPlanCatalogDto>({
        method: 'GET',
        path: '/public/plans',
      });
    }
    return {
      studentEssentialFeaturesAreFree: true,
      disclaimer:
        'L’accès étudiant est 100 % gratuit. Ces formules concernent exclusivement les organismes financeurs (tarifs indicatifs de démonstration).',
      plans: [
        {
          id: 'ORG_DISCOVERY',
          displayName: 'Organisme Découverte',
          priceFcfa: 0,
          billingCycle: 'FREE',
          features: [
            'Création du profil institutionnel',
            'Dépôt de demande de vérification',
            'Soumission d’une annonce à la curation',
          ],
          studentFree: true,
          illustrativePricing: true,
        },
        {
          id: 'ORG_SINGLE_CAMPAIGN',
          displayName: 'Campagne ponctuelle',
          priceFcfa: 75000,
          billingCycle: 'SINGLE_CAMPAIGN',
          features: [
            '1 campagne complète gérée',
            'Paramétrage des critères d’éligibilité',
            'Réception et tri des candidatures',
            'Enregistrement des décisions',
          ],
          studentFree: true,
          illustrativePricing: true,
        },
        {
          id: 'ORG_PRO',
          displayName: 'Organisme Pro',
          priceFcfa: 50000,
          billingCycle: 'MONTHLY',
          features: [
            'Gestion de plusieurs campagnes',
            'Recherche de candidats volontaires pseudonymisés',
            'Envoi d’invitations ciblées',
            'Statistiques de suivi',
          ],
          studentFree: true,
          illustrativePricing: true,
        },
        {
          id: 'ORG_PREMIUM',
          displayName: 'Organisme Premium',
          priceFcfa: 150000,
          billingCycle: 'MONTHLY',
          features: [
            'Gestion avancée multi-campagnes',
            'Collaboration entre évaluateurs',
            'Permissions granulaires du jury',
            'Rapports détaillés & audit',
          ],
          studentFree: true,
          illustrativePricing: true,
        },
      ],
    };
  },
};

// ============================================================================
// 2. ESPACE ÉTUDIANT & MOTEUR D'ÉLIGIBILITÉ (/students/me/*, /eligibility/*)
// ============================================================================
export const studentApiService = {
  /**
   * operationId: getMyStudentProfile
   * GET /students/me/profile
   */
  async getMyStudentProfile(mockStudent: StudentProfile): Promise<StudentProfile> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiStudentProfileDto>({
        method: 'GET',
        path: '/students/me/profile',
      });
      return adaptApiStudentProfileToUi(dto);
    }
    return {
      ...mockStudent,
      profileCompletion: computeStudentProfileCompletion(mockStudent),
    };
  },

  /**
   * operationId: getMyProfileCompletion
   * GET /students/me/profile/completion
   */
  async getMyProfileCompletion(mockStudent: StudentProfile): Promise<ProfileCompletion> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      return executeHttpRequest<ApiProfileCompletionDto>({
        method: 'GET',
        path: '/students/me/profile/completion',
      });
    }
    return computeStudentProfileCompletion(mockStudent);
  },

  /**
   * operationId: getMyAcademicRecords / createMyAcademicRecord / updateMyAcademicRecord / removeMyAcademicRecord
   * /students/me/academic-records
   */
  async getMyAcademicRecords(mockStudent: StudentProfile): Promise<AcademicRecord[]> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dtos = await executeHttpRequest<ApiAcademicRecordDto[]>({
        method: 'GET',
        path: '/students/me/academic-records',
      });
      return dtos.map(adaptApiAcademicRecordToUi);
    }
    return mockStudent.academicRecords || [];
  },

  async createMyAcademicRecord(
    req: ApiUpsertAcademicRecordRequest
  ): Promise<AcademicRecord> {
    const dto = await executeHttpRequest<ApiAcademicRecordDto>({
      method: 'POST',
      path: '/students/me/academic-records',
      body: req,
    });
    return adaptApiAcademicRecordToUi(dto);
  },

  async updateMyAcademicRecord(
    recordId: string,
    req: ApiUpsertAcademicRecordRequest
  ): Promise<AcademicRecord> {
    const dto = await executeHttpRequest<ApiAcademicRecordDto>({
      method: 'PATCH',
      path: `/students/me/academic-records/${recordId}`,
      body: req,
    });
    return adaptApiAcademicRecordToUi(dto);
  },

  async removeMyAcademicRecord(recordId: string): Promise<void> {
    await executeHttpRequest<void>({
      method: 'DELETE',
      path: `/students/me/academic-records/${recordId}`,
    });
  },

  /**
   * operationId: getMyStudentPreferences / updateMyStudentPreferences
   * GET / PUT /students/me/preferences
   */
  async getMyStudentPreferences(
    mockStudent: StudentProfile
  ): Promise<ApiStudentPreferencesDto> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      return executeHttpRequest<ApiStudentPreferencesDto>({
        method: 'GET',
        path: '/students/me/preferences',
      });
    }
    return {
      preferredDestinationCountries: mockStudent.preferredDestinationCountries,
      preferredFundingTypes: mockStudent.preferredFundingTypes,
      preferredStudyDomains: mockStudent.studyDomain ? [mockStudent.studyDomain] : [],
      alertNewScholarships: true,
      alertDeadlines: true,
    };
  },

  async updateMyStudentPreferences(
    req: ApiUpdateStudentPreferencesRequest
  ): Promise<ApiStudentPreferencesDto> {
    return executeHttpRequest<ApiStudentPreferencesDto>({
      method: 'PUT',
      path: '/students/me/preferences',
      body: req,
    });
  },

  /**
   * operationId: evaluateEligibilityForCurrentStudent
   * GET /eligibility/evaluate/{scholarshipId}
   *
   * RÈGLE MÉTIER : Le frontend n'invente jamais de verdict ; en mode 'mock', il délègue
   * au moteur déterministe `evaluateScholarshipEligibility()` qui applique exactement
   * les 9 règles métier et les 4 verdicts du contrat.
   */
  async evaluateEligibilityForCurrentStudent(
    scholarship: Scholarship,
    student: StudentProfile
  ): Promise<EligibilityReport> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiEligibilityReportDto>({
        method: 'GET',
        path: `/eligibility/evaluate/${scholarship.id}`,
      });
      return {
        ...dto,
        items: dto.items.map((i) => ({
          ...i,
          missingFieldKey: i.missingFieldKey ?? undefined,
        })),
      };
    }
    return evaluateScholarshipEligibility(student, scholarship, '2026-11-23');
  },

  /**
   * operationId: simulateEligibility
   * POST /eligibility/simulate
   */
  async simulateEligibility(
    scholarship: Scholarship,
    hypotheticalStudent: StudentProfile
  ): Promise<EligibilityReport> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const payload: {
        scholarshipId: string;
        studentProfile: ApiUpdateStudentProfileRequest;
      } = {
        scholarshipId: scholarship.id,
        studentProfile: {
          firstName: hypotheticalStudent.firstName,
          lastName: hypotheticalStudent.lastName,
          nationality: hypotheticalStudent.nationality,
          residenceCountry: hypotheticalStudent.residenceCountry,
          city: hypotheticalStudent.city,
          birthYear: hypotheticalStudent.birthYear,
          highestDiplomaObtained: hypotheticalStudent.highestDiplomaObtained || undefined,
          highestDiplomaName: hypotheticalStudent.highestDiplomaName,
          currentStudyLevel: hypotheticalStudent.currentStudyLevel || undefined,
          targetStudyLevel: hypotheticalStudent.targetStudyLevel || undefined,
          studyDomain: hypotheticalStudent.studyDomain || undefined,
          currentInstitution: hypotheticalStudent.currentInstitution,
          academicYear: hypotheticalStudent.academicYear,
          averageGrade: hypotheticalStudent.averageGrade,
          gradingScale: hypotheticalStudent.gradingScale,
          languages: hypotheticalStudent.languages,
          preferredDestinationCountries:
            hypotheticalStudent.preferredDestinationCountries,
          preferredFundingTypes: hypotheticalStudent.preferredFundingTypes,
        },
      };
      const dto = await executeHttpRequest<ApiEligibilityReportDto>({
        method: 'POST',
        path: '/eligibility/simulate',
        body: payload,
      });
      return {
        ...dto,
        items: dto.items.map((i) => ({
          ...i,
          missingFieldKey: i.missingFieldKey ?? undefined,
        })),
      };
    }
    return evaluateScholarshipEligibility(
      hypotheticalStudent,
      scholarship,
      '2026-11-23'
    );
  },

  /**
   * operationId: getMyStudentDashboard
   * GET /students/me/dashboard
   */
  async getMyStudentDashboard(): Promise<ApiStudentDashboardResponseDto> {
    return executeHttpRequest<ApiStudentDashboardResponseDto>({
      method: 'GET',
      path: '/students/me/dashboard',
    });
  },

  /**
   * operationId: getMyRecommendations
   * GET /students/me/recommendations
   */
  async getMyRecommendations(): Promise<ApiRecommendationsResponseDto> {
    return executeHttpRequest<ApiRecommendationsResponseDto>({
      method: 'GET',
      path: '/students/me/recommendations',
    });
  },

  /**
   * operationId: respondToInvitation
   * POST /students/me/invitations/{invitationId}/respond
   */
  async respondToInvitation(
    invitationId: string,
    req: ApiRespondInvitationRequest
  ): Promise<ApiInvitationDto> {
    return executeHttpRequest<ApiInvitationDto>({
      method: 'POST',
      path: `/students/me/invitations/${invitationId}/respond`,
      body: req,
    });
  },

  /**
   * operationId: submitApplication / getMyApplications / getMyApplicationById
   */
  async submitApplication(
    req: ApiSubmitApplicationRequest
  ): Promise<ApplicationRecord> {
    const dto = await executeHttpRequest<ApiApplicationRecordDto>({
      method: 'POST',
      path: '/students/me/applications',
      body: req,
    });
    return adaptApiApplicationRecordToUi(dto);
  },
};

// ============================================================================
// 3. ESPACE ORGANISME (/organizations/me/*)
// ============================================================================
export const organizationApiService = {
  async getMyOrganizationProfile(): Promise<ApiOrganizationProfileDto> {
    return executeHttpRequest<ApiOrganizationProfileDto>({
      method: 'GET',
      path: '/organizations/me',
    });
  },

  async updateMyOrganizationProfile(
    req: ApiUpdateOrganizationProfileRequest
  ): Promise<ApiOrganizationProfileDto> {
    return executeHttpRequest<ApiOrganizationProfileDto>({
      method: 'PUT',
      path: '/organizations/me',
      body: req,
    });
  },

  async createOrganizationScholarship(
    req: ApiUpsertScholarshipRequest
  ): Promise<Scholarship> {
    const dto = await executeHttpRequest<ApiScholarshipDto>({
      method: 'POST',
      path: '/organizations/me/scholarships',
      body: req,
    });
    return adaptApiScholarshipToUi(dto);
  },

  async submitOrganizationScholarshipForCuration(
    scholarshipId: string
  ): Promise<ScholarshipDraft> {
    const dto = await executeHttpRequest<ApiScholarshipDraftDto>({
      method: 'POST',
      path: `/organizations/me/scholarships/${scholarshipId}/submit`,
    });
    return adaptApiScholarshipDraftToUi(dto);
  },

  async searchAnonymizedTalentPool(query?: {
    scholarshipId?: string;
    targetLevel?: string;
    domain?: string;
    minGradeOut20?: number;
  }): Promise<ApiAnonymizedCandidateProfileDto[]> {
    return executeHttpRequest<ApiAnonymizedCandidateProfileDto[]>({
      method: 'GET',
      path: '/organizations/me/talent-pool',
      query,
    });
  },

  async getPseudonymizedCandidateProfile(
    candidatePublicId: string
  ): Promise<ApiAnonymizedCandidateProfileDto> {
    return executeHttpRequest<ApiAnonymizedCandidateProfileDto>({
      method: 'GET',
      path: `/organizations/me/talent-pool/${candidatePublicId}`,
    });
  },

  async sendInvitationToStudent(
    req: ApiSendInvitationRequest
  ): Promise<ApiInvitationDto> {
    return executeHttpRequest<ApiInvitationDto>({
      method: 'POST',
      path: '/organizations/me/invitations',
      body: req,
    });
  },

  async evaluateApplication(
    applicationId: string,
    status: ApplicationStatus,
    evaluatorNotes?: string,
    evaluatorScoreOut100?: number,
    decisionJustification?: string
  ): Promise<ApplicationRecord> {
    const adapted = adaptUiApplicationStatusToApi(status, evaluatorNotes);
    const body: ApiEvaluateApplicationRequest = {
      status: adapted.status,
      evaluatorNotes: adapted.evaluatorNotes,
      evaluatorScoreOut100,
      decisionJustification,
    };
    const dto = await executeHttpRequest<ApiApplicationRecordDto>({
      method: 'PATCH',
      path: `/organizations/me/applications/${applicationId}/evaluate`,
      body,
    });
    return adaptApiApplicationRecordToUi(dto);
  },

  async getMyOrganizationCampaigns(): Promise<OrganizationCampaign[]> {
    const dtos = await executeHttpRequest<ApiOrganizationCampaignDto[]>({
      method: 'GET',
      path: '/organizations/me/campaigns',
    });
    return dtos.map((d) => ({
      ...d,
      applicationDeadline: d.applicationDeadline ?? undefined,
    }));
  },

  async createOrganizationCampaign(
    req: ApiUpsertOrganizationCampaignRequest
  ): Promise<OrganizationCampaign> {
    const dto = await executeHttpRequest<ApiOrganizationCampaignDto>({
      method: 'POST',
      path: '/organizations/me/campaigns',
      body: req,
    });
    return {
      ...dto,
      applicationDeadline: dto.applicationDeadline ?? undefined,
    };
  },

  async activateOrganizationCampaign(
    campaignId: string
  ): Promise<OrganizationCampaign> {
    const dto = await executeHttpRequest<ApiOrganizationCampaignDto>({
      method: 'POST',
      path: `/organizations/me/campaigns/${campaignId}/activate`,
    });
    return {
      ...dto,
      applicationDeadline: dto.applicationDeadline ?? undefined,
    };
  },

  async requestOrganizationPlanChange(
    req: ApiRequestSubscriptionChange
  ): Promise<SubscriptionRequest> {
    const dto = await executeHttpRequest<ApiSubscriptionRequestDto>({
      method: 'POST',
      path: '/organizations/me/subscription/requests',
      body: req,
    });
    return {
      ...dto,
      decidedAt: dto.decidedAt ?? undefined,
      activationConfirmed: Boolean(dto.activationConfirmed),
    };
  },

  async listOrganizationSubscriptionRequests(): Promise<SubscriptionRequest[]> {
    const dtos = await executeHttpRequest<ApiSubscriptionRequestDto[]>({
      method: 'GET',
      path: '/organizations/me/subscription/requests',
    });
    return dtos.map((d) => ({
      ...d,
      decidedAt: d.decidedAt ?? undefined,
      activationConfirmed: Boolean(d.activationConfirmed),
    }));
  },

  async getOrganizationSubscription(): Promise<CommercialSubscription> {
    const dto = await executeHttpRequest<ApiCommercialSubscriptionDto>({
      method: 'GET',
      path: '/organizations/me/subscription',
    });
    return adaptApiSubscriptionToUi(dto);
  },
};

// ============================================================================
// 4. ESPACE CURATEUR (/curation/*)
// ============================================================================
export const curationApiService = {
  async getCurationQueue(query?: {
    page?: number;
    size?: number;
    publicationStatus?: string;
  }): Promise<{ content: ScholarshipDraft[]; page: ApiScholarshipDraftPageDto['page'] }> {
    const dto = await executeHttpRequest<ApiScholarshipDraftPageDto>({
      method: 'GET',
      path: '/curation/scholarships',
      query,
    });
    return {
      content: dto.content.map(adaptApiScholarshipDraftToUi),
      page: dto.page,
    };
  },

  async curateScholarship(
    scholarshipId: string,
    req: ApiCurateScholarshipRequest
  ): Promise<Scholarship> {
    const dto = await executeHttpRequest<ApiScholarshipDto>({
      method: 'PATCH',
      path: `/curation/scholarships/${scholarshipId}`,
      body: req,
    });
    return adaptApiScholarshipToUi(dto);
  },

  async getOfficialSources(): Promise<OfficialSource[]> {
    const dtos = await executeHttpRequest<ApiOfficialSourceDto[]>({
      method: 'GET',
      path: '/curation/sources',
    });
    return dtos.map(adaptApiOfficialSourceToUi);
  },

  async createOfficialSource(
    req: ApiCreateOfficialSourceRequest
  ): Promise<OfficialSource> {
    const dto = await executeHttpRequest<ApiOfficialSourceDto>({
      method: 'POST',
      path: '/curation/sources',
      body: req,
    });
    return adaptApiOfficialSourceToUi(dto);
  },

  async updateSourceReliability(
    sourceId: string,
    uiStatus: OfficialSource['reliabilityStatus'],
    notes?: string
  ): Promise<OfficialSource> {
    const dto = await executeHttpRequest<ApiOfficialSourceDto>({
      method: 'PATCH',
      path: `/curation/sources/${sourceId}`,
      body: {
        reliabilityStatus: mapUiSourceReliabilityToApi(uiStatus),
        notes,
      },
    });
    return adaptApiOfficialSourceToUi(dto);
  },

  async getDuplicateCandidates(): Promise<DuplicateCandidate[]> {
    const dtos = await executeHttpRequest<ApiDuplicateCandidateDto[]>({
      method: 'GET',
      path: '/curation/duplicates',
    });
    return dtos.map((d) => adaptApiDuplicateToUi(d));
  },

  async resolveDuplicateCandidate(
    duplicateId: string,
    action: 'MERGED_ARCHIVED' | 'DISMISSED'
  ): Promise<DuplicateCandidate> {
    const dto = await executeHttpRequest<ApiDuplicateCandidateDto>({
      method: 'POST',
      path: `/curation/duplicates/${duplicateId}/resolve`,
      body: { action },
    });
    return adaptApiDuplicateToUi(dto);
  },
};

// ============================================================================
// 5. ESPACE ADMINISTRATEUR : BROUILLONS, EXTRACTION IA GEMINI & COLLECTE (/admin/*)
// ============================================================================
export const adminApiService = {
  async getAdminOverview(): Promise<ApiAdminOverviewResponseDto> {
    return executeHttpRequest<ApiAdminOverviewResponseDto>({
      method: 'GET',
      path: '/admin/overview',
    });
  },

  async listAdminScholarships(query?: {
    page?: number;
    size?: number;
    publicationStatus?: string;
    q?: string;
  }): Promise<{ content: ScholarshipDraft[]; page: ApiScholarshipDraftPageDto['page'] }> {
    const dto = await executeHttpRequest<ApiScholarshipDraftPageDto>({
      method: 'GET',
      path: '/admin/scholarships',
      query,
    });
    return {
      content: dto.content.map(adaptApiScholarshipDraftToUi),
      page: dto.page,
    };
  },

  async createAdminScholarshipDraft(
    req: ApiCreateScholarshipDraftRequest
  ): Promise<ScholarshipDraft> {
    const dto = await executeHttpRequest<ApiScholarshipDraftDto>({
      method: 'POST',
      path: '/admin/scholarships',
      body: req,
    });
    return adaptApiScholarshipDraftToUi(dto);
  },

  async updateAdminScholarshipDraft(
    scholarshipId: string,
    req: ApiUpdateScholarshipDraftRequest
  ): Promise<ScholarshipDraft> {
    const dto = await executeHttpRequest<ApiScholarshipDraftDto>({
      method: 'PATCH',
      path: `/admin/scholarships/${scholarshipId}`,
      body: req,
    });
    return adaptApiScholarshipDraftToUi(dto);
  },

  async submitAdminScholarshipForReview(
    scholarshipId: string
  ): Promise<ScholarshipDraft> {
    const dto = await executeHttpRequest<ApiScholarshipDraftDto>({
      method: 'POST',
      path: `/admin/scholarships/${scholarshipId}/submit-review`,
    });
    return adaptApiScholarshipDraftToUi(dto);
  },

  async publishAdminScholarship(
    scholarshipId: string,
    req?: ApiPublishScholarshipRequest
  ): Promise<Scholarship> {
    const dto = await executeHttpRequest<ApiScholarshipDto>({
      method: 'POST',
      path: `/admin/scholarships/${scholarshipId}/publish`,
      body: req,
    });
    return adaptApiScholarshipToUi(dto);
  },

  async archiveAdminScholarship(scholarshipId: string): Promise<ScholarshipDraft> {
    const dto = await executeHttpRequest<ApiScholarshipDraftDto>({
      method: 'POST',
      path: `/admin/scholarships/${scholarshipId}/archive`,
    });
    return adaptApiScholarshipDraftToUi(dto);
  },

  /**
   * operationId: extractScholarshipWithGemini
   * POST /admin/ai/scholarships/extract
   *
   * SÉCURITÉ CRITIQUE :
   * - Aucune clé Gemini n'est présente dans le frontend.
   * - En mode 'real', appelle exclusivement l'endpoint backend Spring AI `/admin/ai/scholarships/extract`.
   * - En mode 'mock', retourne une simulation de démonstration clairement étiquetée comme telle,
   *   avec ses preuves (`evidence`) et `requiresHumanReview: true`, sans jamais publier automatiquement.
   */
  async extractScholarshipWithGemini(
    req: ApiAiExtractionRequest
  ): Promise<AiExtractionResult> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiAiExtractionResultDto>({
        method: 'POST',
        path: '/admin/ai/scholarships/extract',
        body: req,
      });
      return {
        extractionId: dto.extractionId,
        status: dto.status,
        draft: {
          title: dto.draft?.title ?? undefined,
          issuerOrganizationName: dto.draft?.issuerOrganizationName ?? undefined,
          hostCountry: dto.draft?.hostCountry ?? undefined,
          targetStudyLevels: dto.draft?.targetStudyLevels,
          fundingType: dto.draft?.fundingType,
          deadline: dto.draft?.deadline ?? undefined,
          criteria: dto.draft?.criteria
            ? {
                ...dto.draft.criteria,
                minGradeOut20: dto.draft.criteria.minGradeOut20 ?? null,
                maxAge: dto.draft.criteria.maxAge ?? null,
                requiredLanguage: dto.draft.criteria.requiredLanguage ?? undefined,
                specificConditions: dto.draft.criteria.specificConditions || [],
                preferentialCriteria: dto.draft.criteria.preferentialCriteria || [],
              }
            : undefined,
          financialSummary: dto.draft?.financialSummary ?? undefined,
          description: dto.draft?.description ?? undefined,
          sourceUrl: dto.draft?.sourceUrl ?? undefined,
        },
        evidence: (dto.evidence || []).map((e) => ({
          ...e,
          confidenceLabel: e.confidenceLabel || 'MEDIUM',
        })),
        missingFields: dto.missingFields || [],
        warnings: dto.warnings || [],
        model: dto.model || 'spring-ai-gemini',
        promptVersion: dto.promptVersion || 'v1.1',
        createdAt: dto.createdAt,
        completedAt: dto.completedAt ?? undefined,
        requiresHumanReview: true,
        isMockSimulation: false,
      };
    }

    // Mode Mock explicite : analyse déterministe locale du texte ou de l'URL fournie pour pré-remplir un brouillon de démonstration
    const sourceRef = req.sourceUrl?.trim() || 'https://source-officielle-demo.org/annonce-2027';
    const rawText = req.sourceText?.trim() || '';

    const detectedCountry = rawText.toLowerCase().includes('canada')
      ? 'Canada'
      : rawText.toLowerCase().includes('allemagne')
      ? 'Allemagne'
      : 'France';

    const detectedDomain = rawText.toLowerCase().includes('santé')
      ? ('Santé & Sciences Biomédicales' as const)
      : rawText.toLowerCase().includes('agronomie')
      ? ('Agronomie & Environnement' as const)
      : ('Informatique & Systèmes' as const);

    const extractedTitle =
      rawText.length > 15
        ? `${rawText.split('\n')[0].slice(0, 85)} (Pré-extraction Démo)`
        : `Bourse d’Excellence Coopération Scientifique ${detectedCountry} 2027 (Pré-extraction Démo)`;

    return {
      extractionId: `ai-ext-demo-${Date.now()}`,
      status: 'COMPLETED',
      draft: {
        title: extractedTitle,
        issuerOrganizationName: req.sourceName?.trim() || `Programme Coopération ${detectedCountry}`,
        hostCountry: detectedCountry,
        targetStudyLevels: ['Master'],
        fundingType: 'Bourse complète (Frais + Vie + Transport)',
        deadline: '2027-05-30',
        financialSummary: 'Allocation mensuelle + Exonération des frais de scolarité',
        description:
          rawText ||
          'Annonce extraite en mode simulation locale (Spring AI / Gemini). Vérifiez chaque champ et la source officielle avant d’enregistrer le brouillon.',
        sourceUrl: sourceRef,
        criteria: {
          eligibleNationalities: ['Cameroun', 'Toutes'],
          requiredResidenceCountries: ['Cameroun', 'Tous'],
          requiredDiplomaObtained: ['Licence'],
          targetStudyLevels: ['Master'],
          eligibleDomains: [detectedDomain],
          minGradeOut20: 14,
          maxAge: 28,
          requiredLanguage: 'Français',
          minLanguageLevel: 'B2',
          requiresLanguageCertification: false,
          specificConditions: [
            'Extraction assistée (Simulation mode mock) — Vérification humaine obligatoire avant publication.',
          ],
          preferentialCriteria: [],
        },
      },
      evidence: [
        {
          field: 'title',
          sourceUrl: sourceRef,
          excerpt: extractedTitle,
          confidenceLabel: 'HIGH',
        },
        {
          field: 'criteria.requiredDiplomaObtained / targetStudyLevels',
          sourceUrl: sourceRef,
          excerpt: 'Ouvert aux titulaires d’une Licence candidats à un cycle Master (moyenne >= 14/20).',
          confidenceLabel: 'MEDIUM',
        },
        {
          field: 'deadline',
          sourceUrl: sourceRef,
          excerpt: 'Date limite de réception des dossiers : 30 mai 2027.',
          confidenceLabel: 'MEDIUM',
        },
      ],
      missingFields: ['Numéro officiel de l’arrêté ou de l’appel à candidatures'],
      warnings: [
        'Mode Démonstration (Mock) : cette extraction est simulée localement sans appel direct à Google Gemini.',
        'Conformément au contrat OpenAPI 1.1, l’enregistrement créera uniquement un BROUILLON (DRAFT) non visible par les étudiants.',
      ],
      model: 'spring-ai-gemini-mock-preview',
      promptVersion: 'scholarfind-extract-v1.1',
      createdAt: '2026-11-24T08:00:00Z',
      completedAt: '2026-11-24T08:00:01Z',
      requiresHumanReview: true,
      isMockSimulation: true,
    };
  },

  /**
   * operationId: listIngestionJobs / startIngestionJob / getIngestionJob
   * /admin/ingestion/jobs
   */
  async listIngestionJobs(
    mockJobs: IngestionJob[]
  ): Promise<{ content: IngestionJob[]; page: ApiIngestionJobPageDto['page'] }> {
    const config = getApiRuntimeConfig();
    if (config.mode === 'real') {
      const dto = await executeHttpRequest<ApiIngestionJobPageDto>({
        method: 'GET',
        path: '/admin/ingestion/jobs',
      });
      return {
        content: dto.content.map((j) => ({
          jobId: j.jobId,
          status: j.status,
          requestedBy: j.requestedBy || 'Admin',
          createdAt: j.createdAt,
          startedAt: j.startedAt ?? undefined,
          completedAt: j.completedAt ?? undefined,
          scannedCount: j.scannedCount ?? 0,
          importedDraftCount: j.importedDraftCount,
          duplicateCount: j.duplicateCount ?? 0,
          failedCount: j.failedCount,
          warnings: j.warnings || [],
          dryRun: Boolean(j.dryRun),
          isMockSimulation: false,
        })),
        page: dto.page,
      };
    }

    return {
      content: mockJobs,
      page: {
        page: 0,
        size: 20,
        totalElements: mockJobs.length,
        totalPages: 1,
      },
    };
  },

  async startIngestionJob(req: ApiIngestionJobRequest): Promise<ApiIngestionJobDto> {
    return executeHttpRequest<ApiIngestionJobDto>({
      method: 'POST',
      path: '/admin/ingestion/jobs',
      body: req,
    });
  },

  async updateUserActiveStatus(
    userId: string,
    active: boolean
  ): Promise<ApiUserAccountDto> {
    return executeHttpRequest<ApiUserAccountDto>({
      method: 'PATCH',
      path: `/admin/users/${userId}/status`,
      body: { active },
    });
  },

  async changeUserRole(
    userId: string,
    role: ApiUserRole
  ): Promise<ApiUserAccountDto> {
    return executeHttpRequest<ApiUserAccountDto>({
      method: 'PATCH',
      path: `/admin/users/${userId}/role`,
      body: { role },
    });
  },

  async decideOrganizationSubscriptionRequest(
    requestId: string,
    req: ApiDecideSubscriptionRequest
  ): Promise<SubscriptionRequest> {
    const dto = await executeHttpRequest<ApiSubscriptionRequestDto>({
      method: 'POST',
      path: `/admin/subscription-requests/${requestId}/decide`,
      body: req,
    });
    return {
      ...dto,
      decidedAt: dto.decidedAt ?? undefined,
      activationConfirmed: Boolean(dto.activationConfirmed),
    };
  },

  async getAuditLogs(actionType?: string): Promise<ApiAuditLogEntryDto[]> {
    return executeHttpRequest<ApiAuditLogEntryDto[]>({
      method: 'GET',
      path: '/admin/audit-logs',
      query: { actionType },
    });
  },
};

export {
  adaptApiOfficialSourceToUi,
  adaptUiOfficialSourceToApi,
  adaptApiNotificationToUi,
  computeMissingPublicationFields,
};
