import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AcademicLevel,
  AcademicRecord,
  ApplicationRecord,
  ApplicationStatus,
  AppNotification,
  AuditLogEntry,
  CommercialSubscription,
  CurationStatus,
  DuplicateCandidate,
  EligibilityReport,
  IngestionJob,
  Invitation,
  OfficialSource,
  OrganizationCampaign,
  OrganizationProfile,
  PartnerOrganizationRequest,
  PartnerRequestStatus,
  PlanTierId,
  Scholarship,
  ScholarshipDraft,
  StudentProfile,
  StudyDomain,
  SubscriptionRequest,
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DUPLICATE_CANDIDATES,
  INITIAL_INVITATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFICIAL_SOURCES,
  INITIAL_ORGANIZATIONS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_USER_ACCOUNTS,
} from '../data/mockData';
import { evaluateScholarshipEligibility, normalizeGradeTo20 } from '../features/eligibility/eligibilityEngine';
import {
  ApiIntegrationMode,
  ApiRuntimeConfig,
  getApiRuntimeConfig,
  resetToMockMode,
  saveApiRuntimeConfig,
} from '../api/apiConfig';
import {
  buildPseudonymizedCandidateToken,
  computeMissingPublicationFields,
  computeStudentProfileCompletion,
  inferPublicationStatus,
} from '../api/adapters/openapiAdapters';
import {
  adaptPartnerUiTypeToOpenApi,
  enforcePublicRegistrationRole,
  getPartnerRequestStatusLabel,
  isPartnerSubmissionLocked,
} from '../features/auth/authAndPartnerLogic';

const STORAGE_KEY = 'scholarfind_demo_state_v1';

const INITIAL_MOCK_INGESTION_JOBS: IngestionJob[] = [
  {
    jobId: 'job-demo-2026-01',
    status: 'COMPLETED',
    requestedBy: 'Dr. Hélène Mvondo (Curateur)',
    createdAt: '2026-11-22T09:15:00Z',
    startedAt: '2026-11-22T09:15:02Z',
    completedAt: '2026-11-22T09:16:18Z',
    scannedCount: 14,
    importedDraftCount: 2,
    duplicateCount: 1,
    failedCount: 0,
    warnings: [
      'Les 2 annonces importées ont été placées en statut BROUILLON / EN ATTENTE DE REVUE (aucune publication automatique).',
    ],
    dryRun: true,
    isMockSimulation: true,
  },
];

const INITIAL_PARTNER_ORGANIZATION_REQUESTS: PartnerOrganizationRequest[] = [
  {
    id: 'preq-demo-101',
    applicantUserId: 'usr-stu-2',
    applicantStudentId: 'stu-2',
    applicantFullName: 'Samuel Eto’o Ndi',
    applicantEmail: 'samuel.ndi@univ-yaounde1.cm',
    status: 'UNDER_REVIEW',
    officialName: 'Fondation Horizon Sciences & Technologies Cameroun',
    organizationType: 'Fondation',
    country: 'Cameroun',
    city: 'Yaoundé',
    address: 'Avenue Kennedy, Immeuble Horizon, BP 1420 Yaoundé',
    website: 'https://fondation-horizon-sciences.cm',
    description:
      'Fondation reconnue d’utilité publique dédiée au financement de bourses d’études en ingénierie numérique, énergies renouvelables et santé publique pour les diplômés d’Afrique Centrale.',
    professionalEmail: 'direction@fondation-horizon-sciences.cm',
    professionalPhone: '+237 699 42 18 05',
    representativeName: 'Samuel Eto’o Ndi',
    representativeRole: 'Chargé des Programmes Académiques & Bourses',
    requestMotivation:
      'Ouverture de la campagne annuelle de 15 bourses de Master 2027-2028 et présélection de candidats qualifiés via SCHOLARFIND.',
    legalRegistrationNumber: 'MINAT-FOND-2024-0892-CM',
    documents: [
      {
        id: 'doc-preq-101-1',
        category: 'LEGAL_EXISTENCE',
        fileName: 'Arrete_Reconnaissance_MINAT_Horizon_2024.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 428500,
        uploadedAt: '2026-11-20',
        confidentialPreviewSummary:
          'Arrêté ministériel n° 0892/MINAT attestant l’existence légale de la Fondation Horizon Sciences & Technologies Cameroun (Signé le 14/03/2024).',
      },
      {
        id: 'doc-preq-101-2',
        category: 'REPRESENTATIVE_AUTHORIZATION',
        fileName: 'Mandat_Representation_Samuel_Ndi_2026.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 215400,
        uploadedAt: '2026-11-20',
        confidentialPreviewSummary:
          'Délégation officielle de signature du Conseil d’Administration autorisant M. Samuel Eto’o Ndi à administrer l’espace partenaire SCHOLARFIND.',
      },
    ],
    createdAt: '2026-11-20T10:15:00Z',
    updatedAt: '2026-11-21T14:30:00Z',
    submittedAt: '2026-11-20T10:30:00Z',
    decisionHistory: [
      {
        id: 'dec-101-1',
        decidedAt: '2026-11-20 10:30',
        actorName: 'Samuel Eto’o Ndi',
        actorRole: 'STUDENT',
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        note: 'Soumission initiale du dossier et des justificatifs légaux.',
      },
      {
        id: 'dec-101-2',
        decidedAt: '2026-11-21 14:30',
        actorName: 'Jean-Paul Mbarga (Admin)',
        actorRole: 'ADMIN',
        previousStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        note: 'Prise en charge du dossier pour contrôle du numéro d’enregistrement MINAT.',
      },
    ],
  },
  {
    id: 'preq-demo-102',
    applicantUserId: 'usr-stu-3',
    applicantStudentId: 'stu-3',
    applicantFullName: 'Clarisse Biya Tchoumi',
    applicantEmail: 'clarisse.tchoumi@essec-douala.cm',
    status: 'MORE_INFO_REQUIRED',
    officialName: 'Consortium Africain pour l’AgriTech Durable (CAAD)',
    organizationType: 'ONG',
    country: 'Cameroun',
    city: 'Douala',
    address: 'Rue Joss, Bonanjo, BP 3310 Douala',
    website: 'https://caad-agritech.org',
    description:
      'Organisation non gouvernementale accompagnant les étudiants chercheurs en agronomie tropicale et résilience climatique.',
    professionalEmail: 'bourses@caad-agritech.org',
    professionalPhone: '+237 677 88 12 90',
    representativeName: 'Clarisse Biya Tchoumi',
    representativeRole: 'Coordinatrice Régionale des Partenariats Universitaires',
    requestMotivation:
      'Publication de 8 bourses de recherche appliquée en agronomie et gestion durable des sols.',
    legalRegistrationNumber: 'ONG-LT-2023-4410',
    documents: [
      {
        id: 'doc-preq-102-1',
        category: 'LEGAL_EXISTENCE',
        fileName: 'Recepisse_Declaration_CAAD_Douala.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 312000,
        uploadedAt: '2026-11-18',
        confidentialPreviewSummary:
          'Récépissé de déclaration d’association n° 4410 délivré par la Préfecture du Wouri.',
      },
    ],
    createdAt: '2026-11-18T09:00:00Z',
    updatedAt: '2026-11-19T16:45:00Z',
    submittedAt: '2026-11-18T09:20:00Z',
    adminFeedbackNote:
      'Merci de joindre le justificatif d’autorisation ou mandat nominatif signé par la Direction Générale du CAAD désignant Mme Clarisse Biya Tchoumi comme représentante.',
    decisionHistory: [
      {
        id: 'dec-102-1',
        decidedAt: '2026-11-18 09:20',
        actorName: 'Clarisse Biya Tchoumi',
        actorRole: 'STUDENT',
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        note: 'Soumission de la demande partenaire.',
      },
      {
        id: 'dec-102-2',
        decidedAt: '2026-11-19 16:45',
        actorName: 'Jean-Paul Mbarga (Admin)',
        actorRole: 'ADMIN',
        previousStatus: 'SUBMITTED',
        newStatus: 'MORE_INFO_REQUIRED',
        note: 'Merci de joindre le justificatif d’autorisation ou mandat nominatif signé par la Direction Générale du CAAD.',
      },
    ],
  },
];

interface PersistedState {
  currentUserId: string;
  isAuthenticated?: boolean;
  users: UserAccount[];
  students: StudentProfile[];
  organizations: OrganizationProfile[];
  scholarships: Scholarship[];
  invitations: Invitation[];
  applications: ApplicationRecord[];
  sources: OfficialSource[];
  duplicates: DuplicateCandidate[];
  notifications: AppNotification[];
  subscriptions: CommercialSubscription[];
  auditLogs: AuditLogEntry[];
  // Collections additives OpenAPI 1.1 & Gouvernance Partenaires
  adminDrafts?: ScholarshipDraft[];
  ingestionJobs?: IngestionJob[];
  organizationCampaigns?: OrganizationCampaign[];
  subscriptionRequests?: SubscriptionRequest[];
  partnerRequests?: PartnerOrganizationRequest[];
}

interface AppContextValue extends PersistedState {
  isAuthenticated: boolean;
  currentUser: UserAccount;
  currentStudent: StudentProfile;
  currentOrganization: OrganizationProfile;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  switchDemoUser: (userId: string) => void;
  switchDemoRole: (role: UserRole) => void;
  logoutUser: () => void;
  resetDemoData: () => void;

  // Configuration d'intégration API (OpenAPI 1.1 : 'mock' par défaut vs 'real')
  apiConfig: ApiRuntimeConfig;
  setApiMode: (mode: ApiIntegrationMode, baseUrl?: string) => void;
  fallbackToMockMode: () => void;

  // Authentification professionnelle, Inscription publique unique (STUDENT) & Basculement d'espace
  authenticateUser: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  registerPublicStudentAccount: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
  }) => Promise<{
    success: boolean;
    user?: UserAccount;
    requiresEmailVerification: boolean;
    error?: string;
  }>;
  verifyCurrentStudentEmail: () => void;
  switchAuthorizedWorkspace: (targetRole: 'STUDENT' | 'ORGANIZATION') => boolean;

  // Demande de création d'un compte organisme partenaire (Espace Étudiant & Admin)
  partnerRequests: PartnerOrganizationRequest[];
  savePartnerOrganizationRequestDraft: (
    patch: Partial<PartnerOrganizationRequest>
  ) => PartnerOrganizationRequest;
  submitPartnerOrganizationRequest: (
    patch: Partial<PartnerOrganizationRequest>
  ) => { success: boolean; request?: PartnerOrganizationRequest; error?: string };
  decidePartnerOrganizationRequest: (
    requestId: string,
    newStatus: 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED',
    note: string
  ) => void;

  // Inscription conforme OpenAPI 1.1 (profil étudiant autorisé même si parcours académique incomplet)
  registerStudentAccount: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    nationality: string;
    residenceCountry: string;
    highestDiplomaObtained?: AcademicLevel | '';
    currentStudyLevel?: AcademicLevel | '';
    targetStudyLevel?: AcademicLevel | '';
    studyDomain?: StudyDomain | '';
  }) => void;

  // Services Étudiant
  updateStudentProfile: (studentId: string, patch: Partial<StudentProfile>) => void;
  addStudentAcademicRecord: (record: Omit<AcademicRecord, 'id' | 'normalizedGradeOut20'>) => void;
  removeStudentAcademicRecord: (recordId: string) => void;
  toggleSavedScholarship: (scholarshipId: string) => void;
  toggleInstitutionalVisibility: (enabled: boolean, allowScoreSharing?: boolean) => void;
  respondToInvitation: (invitationId: string, accept: boolean, note?: string) => void;
  submitApplication: (scholarshipId: string, motivationNote?: string) => void;
  evaluateForCurrentStudent: (scholarship: Scholarship) => EligibilityReport;

  // Services Organisme
  updateOrganizationProfile: (orgId: string, patch: Partial<OrganizationProfile>) => void;
  createOrUpdateScholarship: (scholarship: Scholarship) => void;
  submitOrganizationScholarshipForCuration: (scholarshipId: string) => void;
  sendInvitationToStudent: (studentOrPublicTokenId: string, scholarshipId: string, message: string) => void;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string,
    score?: number,
    decisionJustification?: string
  ) => void;
  addOrganizationEvaluator: (
    orgId: string,
    name: string,
    email: string,
    roleTitle: string,
    permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE'
  ) => void;
  changeOrganizationPlan: (orgId: string, planId: PlanTierId) => void;
  requestOrganizationPlanChange: (orgId: string, planId: PlanTierId, requestNote?: string) => void;

  // Services Curateur
  curateScholarship: (
    scholarshipId: string,
    status: CurationStatus,
    updatedFields?: Partial<Scholarship>,
    summaryNote?: string
  ) => void;
  createOfficialSource: (payload: {
    name: string;
    institutionType: string;
    country: string;
    officialUrl: string;
    notes?: string;
  }) => void;
  updateSourceReliability: (
    sourceId: string,
    status: OfficialSource['reliabilityStatus'],
    notes?: string
  ) => void;
  resolveDuplicate: (duplicateId: string, action: 'MERGED_ARCHIVED' | 'DISMISSED') => void;

  // Services Administrateur (Gouvernance + Brouillons + Demandes d'abonnement)
  toggleUserActiveStatus: (userId: string, explicitActive?: boolean) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;
  verifyOrganizationAccount: (orgId: string, status: OrganizationProfile['verificationStatus']) => void;
  decideSubscriptionRequest: (requestId: string, approve: boolean, reason?: string) => void;
  createAdminScholarshipDraft: (draftInput: Partial<ScholarshipDraft>) => ScholarshipDraft;
  updateAdminScholarshipDraft: (draftId: string, patch: Partial<ScholarshipDraft>) => void;
  submitAdminDraftForReview: (draftId: string) => void;
  publishAdminScholarshipDraft: (draftId: string, editorialNote?: string) => void;
  archiveAdminScholarship: (idOrDraftId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const enrichStudentsWithCompletion = (students: StudentProfile[]): StudentProfile[] =>
  students.map((stu) => {
    const defaultRecords: AcademicRecord[] =
      stu.academicRecords && stu.academicRecords.length > 0
        ? stu.academicRecords
        : stu.highestDiplomaObtained
        ? [
            {
              id: `rec-${stu.id}-1`,
              diplomaLevel: stu.highestDiplomaObtained,
              diplomaName: stu.highestDiplomaName || stu.highestDiplomaObtained,
              institutionName: stu.currentInstitution || 'Établissement déclaré',
              institutionCountry: stu.residenceCountry,
              obtained: true,
              completionYear: 2025,
              gradingScale: stu.gradingScale,
              grade: stu.averageGrade,
              normalizedGradeOut20: stu.normalizedGradeOut20,
              officialEquivalenceVerified: true,
            },
          ]
        : [];
    return {
      ...stu,
      academicRecords: defaultRecords,
      profileCompletion: computeStudentProfileCompletion(stu),
    };
  });

const enrichScholarshipsWithPublicationStatus = (scholarships: Scholarship[]): Scholarship[] =>
  scholarships.map((s) => ({
    ...s,
    publicationStatus: inferPublicationStatus(s),
    acquisitionChannel: s.acquisitionChannel || 'ADMIN_MANUAL',
  }));

const enrichUsersWithPermissions = (users: UserAccount[]): UserAccount[] =>
  users.map((u) => ({
    ...u,
    grantedRoles: u.grantedRoles && u.grantedRoles.length > 0 ? u.grantedRoles : [u.role],
    linkedStudentId: u.linkedStudentId || (u.role === 'STUDENT' ? u.linkedEntityId : undefined),
    linkedOrganizationId:
      u.linkedOrganizationId || (u.role === 'ORGANIZATION' ? u.linkedEntityId : undefined),
    emailVerified: u.emailVerified !== undefined ? u.emailVerified : true,
  }));

const getInitialState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.users && parsed.scholarships && parsed.students) {
        const sanitizedScholarships = enrichScholarshipsWithPublicationStatus(
          (parsed.scholarships as Scholarship[]).map((s) =>
            s.id === 'sch-6'
              ? {
                  ...s,
                  criteria: {
                    ...s.criteria,
                    eligibleDomains: ['Santé & Sciences Biomédicales' as const],
                  },
                }
              : s
          )
        );
        return {
          ...parsed,
          users: enrichUsersWithPermissions(parsed.users as UserAccount[]),
          students: enrichStudentsWithCompletion(parsed.students as StudentProfile[]),
          scholarships: sanitizedScholarships,
          isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : true,
          adminDrafts: parsed.adminDrafts || [],
          ingestionJobs: parsed.ingestionJobs || INITIAL_MOCK_INGESTION_JOBS,
          organizationCampaigns: parsed.organizationCampaigns || [],
          subscriptionRequests: parsed.subscriptionRequests || [],
          partnerRequests: parsed.partnerRequests || INITIAL_PARTNER_ORGANIZATION_REQUESTS,
        };
      }
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }
  return {
    currentUserId: 'usr-stu-1',
    isAuthenticated: true,
    users: enrichUsersWithPermissions(INITIAL_USER_ACCOUNTS),
    students: enrichStudentsWithCompletion(INITIAL_STUDENT_PROFILES),
    organizations: INITIAL_ORGANIZATIONS,
    scholarships: enrichScholarshipsWithPublicationStatus(INITIAL_SCHOLARSHIPS),
    invitations: INITIAL_INVITATIONS,
    applications: INITIAL_APPLICATIONS,
    sources: INITIAL_OFFICIAL_SOURCES,
    duplicates: INITIAL_DUPLICATE_CANDIDATES,
    notifications: INITIAL_NOTIFICATIONS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    adminDrafts: [],
    ingestionJobs: INITIAL_MOCK_INGESTION_JOBS,
    organizationCampaigns: [],
    subscriptionRequests: [],
    partnerRequests: INITIAL_PARTNER_ORGANIZATION_REQUESTS,
  };
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiConfig, setApiConfigState] = useState<ApiRuntimeConfig>(getApiRuntimeConfig);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore write errors
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4200);
  };

  const setApiMode = (mode: ApiIntegrationMode, baseUrl?: string) => {
    const updated = saveApiRuntimeConfig({
      mode,
      baseUrl: baseUrl ?? apiConfig.baseUrl,
    });
    setApiConfigState(updated);
    showToast(
      mode === 'mock'
        ? 'Mode Démonstration (Mock) actif : données locales utilisées.'
        : `Mode API Réel activé (${updated.baseUrl}). Attention : le serveur Spring Boot doit être démarré.`
    );
  };

  const fallbackToMockMode = () => {
    const updated = resetToMockMode();
    setApiConfigState(updated);
    showToast('Retour au mode Démonstration (Mock) effectué.');
  };

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) || state.users[0],
    [state.users, state.currentUserId]
  );

  const currentStudent = useMemo(
    () =>
      state.students.find(
        (s) =>
          s.id === currentUser.linkedStudentId ||
          s.id === currentUser.linkedEntityId ||
          s.userId === currentUser.id
      ) || state.students[0],
    [state.students, currentUser]
  );

  const currentOrganization = useMemo(
    () =>
      state.organizations.find(
        (o) =>
          o.id === currentUser.linkedOrganizationId ||
          o.id === currentUser.linkedEntityId ||
          o.userId === currentUser.id
      ) || state.organizations[0],
    [state.organizations, currentUser]
  );

  const appendAuditLog = (
    prev: PersistedState,
    actionType: AuditLogEntry['actionType'],
    targetLabel: string,
    details: string
  ): AuditLogEntry[] => {
    const actor = prev.users.find((u) => u.id === prev.currentUserId) || prev.users[0];
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: '2026-11-23 ' + new Date().toTimeString().slice(0, 5),
      actorName: actor.fullName,
      actorRole: actor.role,
      actionType,
      targetLabel,
      details,
    };
    return [entry, ...prev.auditLogs];
  };

  const switchDemoUser = (userId: string) => {
    const target = state.users.find((u) => u.id === userId);
    if (!target) return;
    setState((prev) => ({ ...prev, currentUserId: userId, isAuthenticated: true }));
    showToast(`Session de démonstration active : ${target.fullName}`);
  };

  const switchDemoRole = (role: UserRole) => {
    const target = state.users.find((u) => u.role === role);
    if (target) {
      switchDemoUser(target.id);
    }
  };

  const logoutUser = () => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
    showToast('Vous êtes déconnecté. Navigation en mode visiteur.');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const updatedCfg = resetToMockMode();
    setApiConfigState(updatedCfg);
    setState({
      currentUserId: 'usr-stu-1',
      isAuthenticated: true,
      users: enrichUsersWithPermissions(INITIAL_USER_ACCOUNTS),
      students: enrichStudentsWithCompletion(INITIAL_STUDENT_PROFILES),
      organizations: INITIAL_ORGANIZATIONS,
      scholarships: enrichScholarshipsWithPublicationStatus(INITIAL_SCHOLARSHIPS),
      invitations: INITIAL_INVITATIONS,
      applications: INITIAL_APPLICATIONS,
      sources: INITIAL_OFFICIAL_SOURCES,
      duplicates: INITIAL_DUPLICATE_CANDIDATES,
      notifications: INITIAL_NOTIFICATIONS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      adminDrafts: [],
      ingestionJobs: INITIAL_MOCK_INGESTION_JOBS,
      organizationCampaigns: [],
      subscriptionRequests: [],
      partnerRequests: INITIAL_PARTNER_ORGANIZATION_REQUESTS,
    });
    showToast('Données de démonstration réinitialisées à leur état initial.');
  };

  /**
   * Connexion professionnelle (POST /auth/login) :
   * - Aucune sélection de rôle avant connexion.
   * - Le rôle et les permissions (`grantedRoles`) sont résolus depuis le compte retourné.
   */
  const authenticateUser: AppContextValue['authenticateUser'] = async (
    email,
    password,
    _rememberMe
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return {
        success: false,
        error: 'Veuillez renseigner votre adresse email et votre mot de passe.',
      };
    }

    const matchedUser = state.users.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );

    if (!matchedUser || password.length < 4) {
      return {
        success: false,
        error:
          'Identifiants incorrects. Vérifiez votre adresse email et votre mot de passe.',
      };
    }

    if (!matchedUser.active) {
      return {
        success: false,
        error:
          'Ce compte est actuellement suspendu par un administrateur. Contactez le support SCHOLARFIND.',
      };
    }

    const updatedUser: UserAccount = {
      ...matchedUser,
      lastLoginAt: '2026-11-24',
      grantedRoles:
        matchedUser.grantedRoles && matchedUser.grantedRoles.length > 0
          ? matchedUser.grantedRoles
          : [matchedUser.role],
    };

    setState((prev) => ({
      ...prev,
      currentUserId: updatedUser.id,
      isAuthenticated: true,
      users: prev.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));

    showToast(`Bienvenue, ${updatedUser.fullName}.`);
    return {
      success: true,
      user: updatedUser,
    };
  };

  /**
   * Inscription publique unique (POST /auth/register/student) :
   * - Attribue TOUJOURS le rôle STUDENT (via enforcePublicRegistrationRole()).
   * - Ne permet jamais l'inscription publique directe en ORGANIZATION, CURATOR ou ADMIN.
   */
  const registerPublicStudentAccount: AppContextValue['registerPublicStudentAccount'] = async (
    payload
  ) => {
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!payload.firstName.trim() || !payload.lastName.trim() || !cleanEmail) {
      return {
        success: false,
        requiresEmailVerification: false,
        error: 'Veuillez remplir votre nom, prénom et adresse email.',
      };
    }

    if (!payload.acceptedTerms || !payload.acceptedPrivacy) {
      return {
        success: false,
        requiresEmailVerification: false,
        error:
          'Vous devez accepter les conditions d’utilisation et la politique de confidentialité.',
      };
    }

    const emailAlreadyExists = state.users.some(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );
    if (emailAlreadyExists) {
      return {
        success: false,
        requiresEmailVerification: false,
        error:
          'Un compte existe déjà avec cette adresse email. Connectez-vous ou réinitialisez votre mot de passe.',
      };
    }

    const assignedRole = enforcePublicRegistrationRole(); // Toujours 'STUDENT'
    const newStuId = `stu-${Date.now()}`;
    const newUserId = `usr-stu-${Date.now()}`;

    const newStudent: StudentProfile = {
      id: newStuId,
      userId: newUserId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      isMinor: false,
      nationality: 'Cameroun',
      residenceCountry: 'Cameroun',
      city: '',
      highestDiplomaObtained: '',
      highestDiplomaName: '',
      currentStudyLevel: '',
      targetStudyLevel: '',
      studyDomain: '',
      currentInstitution: '',
      academicYear: '2026-2027',
      averageGrade: null,
      gradingScale: 'SUR_20',
      normalizedGradeOut20: null,
      languages: [{ language: 'Français', level: 'C1' }],
      preferredDestinationCountries: [],
      preferredFundingTypes: [],
      institutionalVisibilityEnabled: false,
      allowAcademicScoreSharing: false,
      savedScholarshipIds: [],
      updatedAt: '2026-11-24',
      academicRecords: [],
    };
    newStudent.profileCompletion = computeStudentProfileCompletion(newStudent);

    const newUser: UserAccount = {
      id: newUserId,
      email: payload.email.trim(),
      fullName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
      role: assignedRole,
      grantedRoles: [assignedRole],
      active: true,
      createdAt: '2026-11-24',
      lastLoginAt: '2026-11-24',
      linkedEntityId: newStuId,
      linkedStudentId: newStuId,
      emailVerified: false,
    };

    setState((prev) => ({
      ...prev,
      currentUserId: newUserId,
      isAuthenticated: true,
      users: [newUser, ...prev.users],
      students: [newStudent, ...prev.students],
    }));

    return {
      success: true,
      user: newUser,
      requiresEmailVerification: true,
    };
  };

  const verifyCurrentStudentEmail = () => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === prev.currentUserId ? { ...u, emailVerified: true } : u
      ),
    }));
    showToast('Adresse email vérifiée avec succès. Bienvenue dans votre espace étudiant.');
  };

  /**
   * Basculement entre l'Espace Étudiant et l'Espace Organisme :
   * Autorisé uniquement lorsque le backend / l'administrateur a accordé les deux permissions
   * (`grantedRoles` contient 'STUDENT' et 'ORGANIZATION').
   */
  const switchAuthorizedWorkspace = (targetRole: 'STUDENT' | 'ORGANIZATION'): boolean => {
    const allowedRoles = currentUser.grantedRoles || [currentUser.role];
    if (!allowedRoles.includes(targetRole)) {
      showToast(
        'Accès refusé : votre compte ne dispose pas encore des permissions pour cet espace.'
      );
      return false;
    }

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id !== prev.currentUserId) return u;
        const nextLinkedEntityId =
          targetRole === 'ORGANIZATION'
            ? u.linkedOrganizationId || u.linkedEntityId
            : u.linkedStudentId || u.linkedEntityId;
        return {
          ...u,
          role: targetRole,
          linkedEntityId: nextLinkedEntityId,
        };
      }),
    }));

    showToast(
      targetRole === 'ORGANIZATION'
        ? 'Basculement vers votre Espace Organisme Partenaire effectué.'
        : 'Basculement vers votre Espace Étudiant effectué.'
    );
    return true;
  };

  /**
   * Enregistrement en brouillon d'une demande de création de compte organisme partenaire
   */
  const savePartnerOrganizationRequestDraft: AppContextValue['savePartnerOrganizationRequestDraft'] = (
    patch
  ) => {
    const existing = (state.partnerRequests || []).find(
      (r) => r.applicantUserId === currentUser.id
    );
    const nowIso = '2026-11-24T10:00:00Z';

    const draftRequest: PartnerOrganizationRequest = existing
      ? {
          ...existing,
          ...patch,
          status:
            existing.status === 'MORE_INFO_REQUIRED'
              ? 'MORE_INFO_REQUIRED'
              : 'DRAFT',
          updatedAt: nowIso,
        }
      : {
          id: `preq-${Date.now()}`,
          applicantUserId: currentUser.id,
          applicantStudentId: currentStudent.id,
          applicantFullName: currentUser.fullName,
          applicantEmail: currentUser.email,
          status: 'DRAFT',
          officialName: patch.officialName || '',
          organizationType: patch.organizationType || 'Fondation',
          country: patch.country || 'Cameroun',
          city: patch.city || '',
          address: patch.address || '',
          website: patch.website || '',
          description: patch.description || '',
          professionalEmail: patch.professionalEmail || '',
          professionalPhone: patch.professionalPhone || '',
          representativeName: patch.representativeName || currentUser.fullName,
          representativeRole: patch.representativeRole || '',
          requestMotivation: patch.requestMotivation || '',
          legalRegistrationNumber: patch.legalRegistrationNumber || '',
          documents: patch.documents || [],
          createdAt: nowIso,
          updatedAt: nowIso,
          decisionHistory: [],
        };

    setState((prev) => {
      const others = (prev.partnerRequests || []).filter(
        (r) => r.applicantUserId !== currentUser.id
      );
      return {
        ...prev,
        partnerRequests: [draftRequest, ...others],
      };
    });

    showToast('Brouillon de votre demande organisme partenaire sauvegardé.');
    return draftRequest;
  };

  /**
   * Soumission officielle d'une demande de création de compte organisme partenaire :
   * - Bloque toute soumission multiple si une demande est déjà en cours ou approuvée.
   * - N'attribue JAMAIS automatiquement le rôle ORGANIZATION.
   */
  const submitPartnerOrganizationRequest: AppContextValue['submitPartnerOrganizationRequest'] = (
    patch
  ) => {
    const existing = (state.partnerRequests || []).find(
      (r) => r.applicantUserId === currentUser.id
    );

    if (existing && isPartnerSubmissionLocked(existing.status)) {
      const msg = `Une demande est déjà au statut « ${getPartnerRequestStatusLabel(existing.status)} ». Les soumissions multiples sont bloquées.`;
      showToast(msg);
      return {
        success: false,
        error: msg,
      };
    }

    const nowIso = '2026-11-24T10:15:00Z';
    const prevStatus: PartnerRequestStatus = existing ? existing.status : 'DRAFT';
    const merged: PartnerOrganizationRequest = {
      id: existing?.id || `preq-${Date.now()}`,
      applicantUserId: currentUser.id,
      applicantStudentId: currentStudent.id,
      applicantFullName: currentUser.fullName,
      applicantEmail: currentUser.email,
      status: 'SUBMITTED',
      officialName: (patch.officialName ?? existing?.officialName ?? '').trim(),
      organizationType:
        patch.organizationType ?? existing?.organizationType ?? 'Fondation',
      country: (patch.country ?? existing?.country ?? 'Cameroun').trim(),
      city: (patch.city ?? existing?.city ?? '').trim(),
      address: (patch.address ?? existing?.address ?? '').trim(),
      website: (patch.website ?? existing?.website ?? '').trim(),
      description: (patch.description ?? existing?.description ?? '').trim(),
      professionalEmail: (
        patch.professionalEmail ??
        existing?.professionalEmail ??
        ''
      ).trim(),
      professionalPhone: (
        patch.professionalPhone ??
        existing?.professionalPhone ??
        ''
      ).trim(),
      representativeName: (
        patch.representativeName ??
        existing?.representativeName ??
        currentUser.fullName
      ).trim(),
      representativeRole: (
        patch.representativeRole ??
        existing?.representativeRole ??
        ''
      ).trim(),
      requestMotivation: (
        patch.requestMotivation ??
        existing?.requestMotivation ??
        ''
      ).trim(),
      legalRegistrationNumber: (
        patch.legalRegistrationNumber ??
        existing?.legalRegistrationNumber ??
        ''
      ).trim(),
      documents: patch.documents ?? existing?.documents ?? [],
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
      submittedAt: nowIso,
      adminFeedbackNote: existing?.adminFeedbackNote,
      decisionHistory: [
        {
          id: `dec-${Date.now()}`,
          decidedAt: '2026-11-24 10:15',
          actorName: currentUser.fullName,
          actorRole: 'STUDENT',
          previousStatus: prevStatus,
          newStatus: 'SUBMITTED',
          note:
            prevStatus === 'MORE_INFO_REQUIRED'
              ? 'Transmission des informations et justificatifs complémentaires demandés.'
              : 'Soumission initiale de la demande de création d’un compte organisme partenaire.',
        },
        ...(existing?.decisionHistory || []),
      ],
    };

    setState((prev) => {
      const others = (prev.partnerRequests || []).filter(
        (r) => r.applicantUserId !== currentUser.id
      );
      const auditLogs = appendAuditLog(
        prev,
        'ORG_VERIFICATION',
        merged.officialName,
        `Soumission d’une demande de création de compte organisme partenaire par ${currentUser.fullName} (Statut : SUBMITTED — en attente de validation administrative).`
      );
      return {
        ...prev,
        partnerRequests: [merged, ...others],
        auditLogs,
      };
    });

    showToast(
      'Demande soumise avec succès. Elle sera examinée par un administrateur SCHOLARFIND.'
    );
    return {
      success: true,
      request: merged,
    };
  };

  /**
   * Décision administrative sur une demande d'organisme partenaire :
   * - UNDER_REVIEW : prise en charge du dossier.
   * - MORE_INFO_REQUIRED : demande de pièces ou précisions complémentaires.
   * - APPROVED : création/activation du profil organisme vérifié et octroi de la permission
   *   `ORGANIZATION` en complément de `STUDENT` (`grantedRoles: ['STUDENT', 'ORGANIZATION']`).
   * - REJECTED : refus motivé avec justification obligatoire.
   */
  const decidePartnerOrganizationRequest: AppContextValue['decidePartnerOrganizationRequest'] = (
    requestId,
    newStatus,
    note
  ) => {
    setState((prev) => {
      const target = (prev.partnerRequests || []).find((r) => r.id === requestId);
      if (!target) return prev;

      const cleanNote =
        note.trim() ||
        `Décision administrative : ${getPartnerRequestStatusLabel(newStatus)}.`;
      const decisionEntry = {
        id: `dec-${Date.now()}`,
        decidedAt: '2026-11-24 ' + new Date().toTimeString().slice(0, 5),
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        previousStatus: target.status,
        newStatus,
        note: cleanNote,
      };

      let createdOrgId = target.createdOrganizationId;
      let organizations = prev.organizations;
      let users = prev.users;

      if (newStatus === 'APPROVED') {
        createdOrgId = target.createdOrganizationId || `org-partner-${Date.now()}`;
        const existingOrg = prev.organizations.find((o) => o.id === createdOrgId);
        const newOrgProfile: OrganizationProfile = existingOrg || {
          id: createdOrgId,
          userId: target.applicantUserId,
          officialName: target.officialName,
          type: adaptPartnerUiTypeToOpenApi(target.organizationType),
          country: target.country,
          address: `${target.address}${target.city ? `, ${target.city}` : ''}`,
          website: target.website,
          contactEmail: target.professionalEmail,
          contactPersonName: target.representativeName,
          contactPersonRole: target.representativeRole,
          description: target.description,
          registrationNumber:
            target.legalRegistrationNumber || 'VERIF-ADMIN-2026',
          isVerified: true,
          verificationStatus: 'VERIFIED',
          verifiedAt: '2026-11-24',
          activePlan: 'ORG_DISCOVERY',
          evaluators: [
            {
              id: `eval-${Date.now()}`,
              name: target.representativeName,
              email: target.professionalEmail,
              roleTitle: target.representativeRole || 'Représentant habilité',
              permissionLevel: 'DECISION_FINALE',
              active: true,
            },
          ],
        };

        if (!existingOrg) {
          organizations = [newOrgProfile, ...prev.organizations];
        } else {
          organizations = prev.organizations.map((o) =>
            o.id === createdOrgId
              ? {
                  ...o,
                  isVerified: true,
                  verificationStatus: 'VERIFIED',
                  verifiedAt: '2026-11-24',
                }
              : o
          );
        }

        // Octroi de la permission ORGANIZATION au compte utilisateur demandeur tout en conservant STUDENT
        users = prev.users.map((u) => {
          if (u.id !== target.applicantUserId) return u;
          const existingRoles = u.grantedRoles || [u.role];
          const updatedRoles: UserRole[] = Array.from(
            new Set([...existingRoles, 'STUDENT', 'ORGANIZATION'])
          );
          return {
            ...u,
            grantedRoles: updatedRoles,
            linkedStudentId: u.linkedStudentId || target.applicantStudentId,
            linkedOrganizationId: createdOrgId,
          };
        });
      }

      const partnerRequests = (prev.partnerRequests || []).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: newStatus,
              updatedAt: '2026-11-24T11:00:00Z',
              decidedAt:
                newStatus === 'APPROVED' || newStatus === 'REJECTED'
                  ? '2026-11-24T11:00:00Z'
                  : r.decidedAt,
              adminFeedbackNote:
                newStatus === 'MORE_INFO_REQUIRED' || newStatus === 'UNDER_REVIEW'
                  ? cleanNote
                  : r.adminFeedbackNote,
              rejectionReason:
                newStatus === 'REJECTED' ? cleanNote : r.rejectionReason,
              createdOrganizationId: createdOrgId,
              decisionHistory: [decisionEntry, ...r.decisionHistory],
            }
          : r
      );

      const applicantNotif: AppNotification = {
        id: `notif-preq-${Date.now()}`,
        userId: target.applicantUserId,
        role: 'STUDENT',
        category: 'SYSTEM',
        title: `Demande Organisme Partenaire : ${getPartnerRequestStatusLabel(newStatus)}`,
        message: `${target.officialName} — ${cleanNote}`,
        createdAt: '2026-11-24',
        read: false,
        linkTo: '/etudiant/devenir-partenaire',
      };

      const auditLogs = appendAuditLog(
        prev,
        'ORG_VERIFICATION',
        `Demande partenaire : ${target.officialName}`,
        `Statut modifié vers ${newStatus} (${getPartnerRequestStatusLabel(newStatus)}). Motif : ${cleanNote}`
      );

      return {
        ...prev,
        partnerRequests,
        organizations,
        users,
        notifications: [applicantNotif, ...prev.notifications],
        auditLogs,
      };
    });

    showToast(
      `Décision enregistrée : ${getPartnerRequestStatusLabel(newStatus)}.`
    );
  };

  /**
   * Inscription d'un étudiant conforme à RegisterStudentRequest (OpenAPI 1.1) :
   * Les champs académiques sont optionnels à l'inscription ; s'ils ne sont pas fournis,
   * ils restent vides ('') sans jamais être remplacés par de fausses valeurs.
   */
  const registerStudentAccount: AppContextValue['registerStudentAccount'] = (payload) => {
    const newStuId = `stu-${Date.now()}`;
    const newUserId = `usr-stu-${Date.now()}`;
    const newStudent: StudentProfile = {
      id: newStuId,
      userId: newUserId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      isMinor: false,
      nationality: payload.nationality.trim() || 'Cameroun',
      residenceCountry: payload.residenceCountry.trim() || 'Cameroun',
      city: '',
      highestDiplomaObtained: payload.highestDiplomaObtained || '',
      highestDiplomaName: payload.highestDiplomaObtained || '',
      currentStudyLevel: payload.currentStudyLevel || '',
      targetStudyLevel: payload.targetStudyLevel || '',
      studyDomain: payload.studyDomain || '',
      currentInstitution: '',
      academicYear: '2026-2027',
      averageGrade: null,
      gradingScale: 'SUR_20',
      normalizedGradeOut20: null,
      languages: [{ language: 'Français', level: 'C1' }],
      preferredDestinationCountries: [],
      preferredFundingTypes: [],
      institutionalVisibilityEnabled: false,
      allowAcademicScoreSharing: false,
      savedScholarshipIds: [],
      updatedAt: '2026-11-24',
      academicRecords: payload.highestDiplomaObtained
        ? [
            {
              id: `rec-${newStuId}-1`,
              diplomaLevel: payload.highestDiplomaObtained,
              diplomaName: payload.highestDiplomaObtained,
              institutionName: 'Établissement à compléter',
              institutionCountry: payload.residenceCountry.trim() || 'Cameroun',
              obtained: true,
              completionYear: 2026,
              gradingScale: 'SUR_20',
              grade: null,
              normalizedGradeOut20: null,
              officialEquivalenceVerified: false,
            },
          ]
        : [],
    };
    newStudent.profileCompletion = computeStudentProfileCompletion(newStudent);

    const newUser: UserAccount = {
      id: newUserId,
      email: payload.email.trim(),
      fullName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
      role: 'STUDENT',
      active: true,
      createdAt: '2026-11-24',
      lastLoginAt: '2026-11-24',
      linkedEntityId: newStuId,
    };

    setState((prev) => ({
      ...prev,
      currentUserId: newUserId,
      isAuthenticated: true,
      users: [newUser, ...prev.users],
      students: [newStudent, ...prev.students],
    }));

    showToast(
      newStudent.profileCompletion.readyForEligibility
        ? `Compte créé pour ${newUser.fullName} (Simulation).`
        : `Compte créé pour ${newUser.fullName}. Complète ton profil académique quand tu le souhaites.`
    );
  };

  const updateStudentProfile = (studentId: string, patch: Partial<StudentProfile>) => {
    setState((prev) => {
      const students = prev.students.map((stu) => {
        if (stu.id !== studentId) return stu;
        const merged: StudentProfile = { ...stu, ...patch, updatedAt: '2026-11-23' };
        merged.normalizedGradeOut20 = normalizeGradeTo20(merged.averageGrade, merged.gradingScale);
        merged.profileCompletion = computeStudentProfileCompletion(merged);
        return merged;
      });
      return { ...prev, students };
    });
    showToast('Profil académique mis à jour et sauvegardé localement.');
  };

  const addStudentAcademicRecord: AppContextValue['addStudentAcademicRecord'] = (record) => {
    setState((prev) => {
      const stuId = currentStudent.id;
      const students = prev.students.map((stu) => {
        if (stu.id !== stuId) return stu;
        const scale = record.gradingScale || 'SUR_20';
        const grade = record.grade ?? null;
        const newRec: AcademicRecord = {
          ...record,
          id: `rec-${Date.now()}`,
          gradingScale: scale,
          grade,
          normalizedGradeOut20: normalizeGradeTo20(grade, scale),
        };
        const updatedRecords = [newRec, ...(stu.academicRecords || [])];
        const updatedStu: StudentProfile = {
          ...stu,
          academicRecords: updatedRecords,
          // Si aucun diplôme principal n'était renseigné et que celui-ci est obtenu, on synchronise sans écraser un diplôme existant
          highestDiplomaObtained:
            stu.highestDiplomaObtained || (newRec.obtained ? newRec.diplomaLevel : ''),
          highestDiplomaName:
            stu.highestDiplomaName || (newRec.obtained ? newRec.diplomaName : ''),
          updatedAt: '2026-11-24',
        };
        updatedStu.profileCompletion = computeStudentProfileCompletion(updatedStu);
        return updatedStu;
      });
      return { ...prev, students };
    });
    showToast('Diplôme / parcours ajouté à ton historique académique.');
  };

  const removeStudentAcademicRecord = (recordId: string) => {
    setState((prev) => {
      const stuId = currentStudent.id;
      const students = prev.students.map((stu) => {
        if (stu.id !== stuId) return stu;
        return {
          ...stu,
          academicRecords: (stu.academicRecords || []).filter((r) => r.id !== recordId),
          updatedAt: '2026-11-24',
        };
      });
      return { ...prev, students };
    });
    showToast('Entrée retirée de ton historique académique.');
  };

  const toggleSavedScholarship = (scholarshipId: string) => {
    setState((prev) => {
      const stuId = currentStudent.id;
      let added = false;
      const students = prev.students.map((stu) => {
        if (stu.id !== stuId) return stu;
        const exists = stu.savedScholarshipIds.includes(scholarshipId);
        added = !exists;
        return {
          ...stu,
          savedScholarshipIds: exists
            ? stu.savedScholarshipIds.filter((id) => id !== scholarshipId)
            : [...stu.savedScholarshipIds, scholarshipId],
        };
      });
      showToast(added ? 'Bourse enregistrée dans vos favoris.' : 'Bourse retirée de vos favoris.');
      return { ...prev, students };
    });
  };

  const toggleInstitutionalVisibility = (enabled: boolean, allowScoreSharing?: boolean) => {
    setState((prev) => {
      const stuId = currentStudent.id;
      const nowIso = '2026-11-24T08:00:00Z';
      const students = prev.students.map((stu) => {
        if (stu.id !== stuId) return stu;
        return {
          ...stu,
          institutionalVisibilityEnabled: enabled,
          visibilityConsentDate: enabled ? '2026-11-24' : undefined,
          visibilityConsentAt: enabled ? nowIso : stu.visibilityConsentAt,
          visibilityRevokedAt: !enabled ? nowIso : undefined,
          allowAcademicScoreSharing:
            allowScoreSharing !== undefined ? allowScoreSharing : stu.allowAcademicScoreSharing,
        };
      });
      const auditLogs = appendAuditLog(
        prev,
        'PRIVACY_CONSENT',
        `Profil étudiant ${currentStudent.firstName} ${currentStudent.lastName}`,
        enabled
          ? 'Activation volontaire de la visibilité institutionnelle auprès des organismes vérifiés (Loi n° 2024/017).'
          : 'Retrait de l’autorisation de visibilité institutionnelle (profil repassé en mode privé).'
      );
      return { ...prev, students, auditLogs };
    });
    showToast(
      enabled
        ? 'Visibilité institutionnelle activée : seuls les organismes vérifiés peuvent voir votre profil pseudonymisé.'
        : 'Votre profil est désormais strictement privé.'
    );
  };

  const respondToInvitation = (invitationId: string, accept: boolean, note?: string) => {
    setState((prev) => {
      const targetInv = prev.invitations.find((i) => i.id === invitationId);
      if (!targetInv) return prev;

      const invitations = prev.invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              status: accept ? ('ACCEPTED' as const) : ('DECLINED' as const),
              respondedAt: '2026-11-23',
              studentResponseNote:
                note ||
                (accept
                  ? 'Invitation acceptée avec consentement de partage.'
                  : 'Invitation déclinée.'),
              consentToShareDossier: accept,
            }
          : inv
      );

      let applications = prev.applications;
      if (accept) {
        const student = prev.students.find((s) => s.id === targetInv.studentId) || currentStudent;
        const alreadyExists = prev.applications.some(
          (a) => a.scholarshipId === targetInv.scholarshipId && a.studentId === student.id
        );
        if (!alreadyExists) {
          const newApp: ApplicationRecord = {
            id: `app-${Date.now()}`,
            referenceCode: `DOS-2027-${Math.floor(1000 + Math.random() * 9000)}`,
            scholarshipId: targetInv.scholarshipId,
            scholarshipTitle: targetInv.scholarshipTitle,
            organizationId: targetInv.organizationId,
            organizationName: targetInv.organizationName,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentHighestDiploma: student.highestDiplomaObtained,
            studentCurrentLevel: student.currentStudyLevel,
            studentTargetLevel: student.targetStudyLevel,
            studentDomain: student.studyDomain,
            studentGradeOut20: student.normalizedGradeOut20,
            studentNationality: student.nationality,
            submittedAt: '2026-11-23',
            updatedAt: '2026-11-23',
            status: 'Candidature reçue',
            evaluatorNotes:
              'Dossier transmis suite à l’acceptation d’une invitation institutionnelle.',
            originatedFromInvitationId: invitationId,
          };
          applications = [newApp, ...prev.applications];
        }
      }

      const auditLogs = appendAuditLog(
        prev,
        'PRIVACY_CONSENT',
        `Invitation ${invitationId} (${targetInv.scholarshipTitle})`,
        accept
          ? 'Acceptation de l’invitation et consentement spécifique de transmission du dossier académique à l’organisme.'
          : 'Refus de l’invitation par l’étudiant (aucune donnée personnelle transmise).'
      );

      return { ...prev, invitations, applications, auditLogs };
    });

    showToast(
      accept
        ? 'Invitation acceptée : votre dossier de candidature a été transmis à l’organisme.'
        : 'Invitation refusée : vos coordonnées restent confidentielles.'
    );
  };

  const submitApplication = (scholarshipId: string, motivationNote?: string) => {
    const scholarship = state.scholarships.find((s) => s.id === scholarshipId);
    if (!scholarship) return;

    const existing = state.applications.find(
      (a) => a.scholarshipId === scholarshipId && a.studentId === currentStudent.id
    );
    if (existing) {
      showToast('Vous avez déjà enregistré une candidature simulée pour ce programme.');
      return;
    }

    setState((prev) => {
      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}`,
        referenceCode: `DOS-2027-${Math.floor(1000 + Math.random() * 9000)}`,
        scholarshipId: scholarship.id,
        scholarshipTitle: scholarship.title,
        organizationId: scholarship.organizationId,
        organizationName: scholarship.organizationName,
        studentId: currentStudent.id,
        studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
        studentHighestDiploma: currentStudent.highestDiplomaObtained,
        studentCurrentLevel: currentStudent.currentStudyLevel,
        studentTargetLevel: currentStudent.targetStudyLevel,
        studentDomain: currentStudent.studyDomain,
        studentGradeOut20: currentStudent.normalizedGradeOut20,
        studentNationality: currentStudent.nationality,
        submittedAt: '2026-11-23',
        updatedAt: '2026-11-23',
        status: 'Candidature reçue',
        evaluatorNotes: motivationNote
          ? `Note de motivation candidat : ${motivationNote}`
          : 'Candidature soumise par l’étudiant via SCHOLARFIND (simulation).',
      };
      return {
        ...prev,
        applications: [newApp, ...prev.applications],
      };
    });
    showToast('Candidature simulée enregistrée dans l’espace de l’organisme financeur.');
  };

  const evaluateForCurrentStudent = (scholarship: Scholarship): EligibilityReport => {
    return evaluateScholarshipEligibility(currentStudent, scholarship, '2026-11-23');
  };

  const updateOrganizationProfile = (orgId: string, patch: Partial<OrganizationProfile>) => {
    setState((prev) => ({
      ...prev,
      organizations: prev.organizations.map((o) => (o.id === orgId ? { ...o, ...patch } : o)),
    }));
    showToast('Profil institutionnel mis à jour.');
  };

  const createOrUpdateScholarship = (scholarship: Scholarship) => {
    setState((prev) => {
      const exists = prev.scholarships.some((s) => s.id === scholarship.id);
      const enriched: Scholarship = {
        ...scholarship,
        publicationStatus: inferPublicationStatus(scholarship),
        acquisitionChannel: scholarship.acquisitionChannel || 'ORGANIZATION_SUBMISSION',
      };
      const scholarships = exists
        ? prev.scholarships.map((s) => (s.id === scholarship.id ? enriched : s))
        : [enriched, ...prev.scholarships];

      const auditLogs = appendAuditLog(
        prev,
        'CAMPAIGN_PUBLISHED',
        scholarship.title,
        exists
          ? 'Mise à jour des paramètres et critères de la campagne.'
          : `Soumission d’un programme de bourse (${enriched.publicationStatus} / ${enriched.curationStatus}).`
      );
      return { ...prev, scholarships, auditLogs };
    });
    showToast(
      scholarship.curationStatus === 'PENDING_REVIEW'
        ? 'Programme enregistré et soumis à la curation avant publication publique.'
        : 'Programme de bourse enregistré avec succès.'
    );
  };

  const submitOrganizationScholarshipForCuration = (scholarshipId: string) => {
    setState((prev) => ({
      ...prev,
      scholarships: prev.scholarships.map((s) =>
        s.id === scholarshipId
          ? {
              ...s,
              curationStatus: 'PENDING_REVIEW',
              publicationStatus: 'PENDING_REVIEW',
            }
          : s
      ),
    }));
    showToast('Offre soumise à la revue documentaire du curateur.');
  };

  /**
   * Envoi d'invitation supportant à la fois le jeton public opaque `candidatePublicId`
   * (conforme OpenAPI 1.1) et l'identifiant interne en fallback de démonstration.
   */
  const sendInvitationToStudent = (
    studentOrPublicTokenId: string,
    scholarshipId: string,
    message: string
  ) => {
    const student = state.students.find(
      (s) =>
        s.id === studentOrPublicTokenId ||
        buildPseudonymizedCandidateToken(s.id) === studentOrPublicTokenId
    );
    const scholarship = state.scholarships.find((s) => s.id === scholarshipId);
    if (!student || !scholarship) return;

    if (!student.institutionalVisibilityEnabled) {
      showToast('Action refusée : ce profil étudiant est privé.');
      return;
    }

    setState((prev) => {
      const newInv: Invitation = {
        id: `inv-${Date.now()}`,
        organizationId: currentOrganization.id,
        organizationName: currentOrganization.officialName,
        scholarshipId: scholarship.id,
        scholarshipTitle: scholarship.title,
        studentId: student.id,
        studentAnonymizedCode: `CAND-CM-2026-0${student.id.replace('stu-', '')}`,
        studentDisplayName: `${student.firstName} ${student.lastName}`,
        message,
        sentAt: '2026-11-23',
        status: 'PENDING',
        consentToShareDossier: false,
      };

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: student.userId,
        role: 'STUDENT',
        category: 'INVITATION',
        title: `Invitation reçue : ${currentOrganization.officialName}`,
        message: `Votre profil correspond au programme « ${scholarship.title} ». Consultez l’invitation pour accepter ou refuser.`,
        createdAt: '2026-11-23',
        read: false,
        linkTo: '/etudiant/invitations',
      };

      return {
        ...prev,
        invitations: [newInv, ...prev.invitations],
        notifications: [newNotif, ...prev.notifications],
      };
    });

    showToast('Invitation simulée transmise au candidat volontaire pseudonymisé.');
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string,
    score?: number,
    decisionJustification?: string
  ) => {
    setState((prev) => {
      const targetApp = prev.applications.find((a) => a.id === applicationId);
      const applications = prev.applications.map((app) => {
        if (app.id !== applicationId) return app;
        return {
          ...app,
          status,
          updatedAt: '2026-11-23',
          evaluatorNotes: notes !== undefined ? notes : app.evaluatorNotes,
          evaluatorScoreOut100: score !== undefined ? score : app.evaluatorScoreOut100,
          decisionRecordedAt:
            status === 'Retenue' || status === 'Non retenue' ? '2026-11-23' : app.decisionRecordedAt,
          decisionJustification:
            decisionJustification !== undefined ? decisionJustification : app.decisionJustification,
        };
      });

      const auditLogs =
        status === 'Retenue' || status === 'Non retenue'
          ? appendAuditLog(
              prev,
              'AWARD_DECISION',
              `Candidature ${targetApp?.referenceCode || applicationId}`,
              `Enregistrement de la décision finale : ${status}.`
            )
          : prev.auditLogs;

      return { ...prev, applications, auditLogs };
    });
    showToast(`Statut de la candidature mis à jour : « ${status} ».`);
  };

  const addOrganizationEvaluator = (
    orgId: string,
    name: string,
    email: string,
    roleTitle: string,
    permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE'
  ) => {
    setState((prev) => ({
      ...prev,
      organizations: prev.organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              evaluators: [
                ...org.evaluators,
                {
                  id: `eval-${Date.now()}`,
                  name,
                  email,
                  roleTitle,
                  permissionLevel,
                  active: true,
                },
              ],
            }
          : org
      ),
    }));
    showToast(`Collaborateur évaluateur « ${name} » ajouté à l'équipe.`);
  };

  const planDetails: Record<
    PlanTierId,
    { name: string; amount: number; cycle: CommercialSubscription['billingCycle'] }
  > = {
    STUDENT_FREE: { name: 'Étudiant Gratuit', amount: 0, cycle: 'Gratuit' },
    ORG_DISCOVERY: { name: 'Organisme Découverte', amount: 0, cycle: 'Gratuit' },
    ORG_PRO: { name: 'Organisme Pro', amount: 50000, cycle: 'Mensuel' },
    ORG_PREMIUM: { name: 'Organisme Premium', amount: 150000, cycle: 'Mensuel' },
    ORG_SINGLE_CAMPAIGN: {
      name: 'Campagne ponctuelle',
      amount: 75000,
      cycle: 'Campagne ponctuelle',
    },
  };

  const changeOrganizationPlan = (orgId: string, planId: PlanTierId) => {
    setState((prev) => {
      const organizations = prev.organizations.map((o) =>
        o.id === orgId ? { ...o, activePlan: planId } : o
      );
      const org = prev.organizations.find((o) => o.id === orgId);
      const info = planDetails[planId];
      const newSub: CommercialSubscription = {
        id: `sub-${Date.now()}`,
        organizationId: orgId,
        organizationName: org?.officialName || 'Organisme',
        planId,
        planName: info.name,
        amountFcfa: info.amount,
        billingCycle: info.cycle,
        status: 'ACTIF_SIMULE',
        startedAt: '2026-11-23',
        nextRenewalAt: info.cycle === 'Mensuel' ? '2026-12-23' : undefined,
      };
      const subscriptions = [
        newSub,
        ...prev.subscriptions.filter((s) => s.organizationId !== orgId),
      ];
      return { ...prev, organizations, subscriptions };
    });
    showToast(
      `Formule simulée en mode Sandbox : ${planDetails[planId].name} (aucun paiement réel effectué).`
    );
  };

  /**
   * Nouveau flux OpenAPI 1.1 : POST /organizations/me/subscription/requests
   * Crée une demande de changement de plan soumise à validation administrative
   * sans débloquer automatiquement de droits payants sur simple requête client.
   */
  const requestOrganizationPlanChange = (
    orgId: string,
    planId: PlanTierId,
    requestNote?: string
  ) => {
    setState((prev) => {
      const org = prev.organizations.find((o) => o.id === orgId);
      const newReq: SubscriptionRequest = {
        id: `subreq-${Date.now()}`,
        organizationId: orgId,
        organizationName: org?.officialName || 'Organisme',
        requestedPlan: planId,
        status: 'PENDING',
        requestedAt: '2026-11-24T08:00:00Z',
        activationConfirmed: false,
        requestNote:
          requestNote ||
          `Demande de souscription à la formule ${planDetails[planId].name}.`,
      };
      return {
        ...prev,
        subscriptionRequests: [newReq, ...(prev.subscriptionRequests || [])],
      };
    });
    showToast(
      `Demande de passage à « ${planDetails[planId].name} » enregistrée (en attente de validation administrative).`
    );
  };

  const decideSubscriptionRequest = (
    requestId: string,
    approve: boolean,
    reason?: string
  ) => {
    setState((prev) => {
      const target = (prev.subscriptionRequests || []).find((r) => r.id === requestId);
      if (!target) return prev;

      const subscriptionRequests = (prev.subscriptionRequests || []).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: approve ? ('APPROVED' as const) : ('REJECTED' as const),
              decidedAt: '2026-11-24T08:30:00Z',
              activationConfirmed: approve,
              decisionReason:
                reason ||
                (approve
                  ? 'Demande approuvée par l’administrateur (simulation sandbox).'
                  : 'Demande refusée.'),
            }
          : r
      );

      if (!approve) {
        return { ...prev, subscriptionRequests };
      }

      const info = planDetails[target.requestedPlan];
      const organizations = prev.organizations.map((o) =>
        o.id === target.organizationId
          ? { ...o, activePlan: target.requestedPlan }
          : o
      );
      const newSub: CommercialSubscription = {
        id: `sub-${Date.now()}`,
        organizationId: target.organizationId,
        organizationName: target.organizationName || 'Organisme',
        planId: target.requestedPlan,
        planName: info.name,
        amountFcfa: info.amount,
        billingCycle: info.cycle,
        status: 'ACTIF_SIMULE',
        startedAt: '2026-11-24',
        nextRenewalAt: info.cycle === 'Mensuel' ? '2026-12-24' : undefined,
      };
      const subscriptions = [
        newSub,
        ...prev.subscriptions.filter((s) => s.organizationId !== target.organizationId),
      ];

      return { ...prev, subscriptionRequests, organizations, subscriptions };
    });
    showToast(
      approve
        ? 'Demande d’abonnement approuvée et activée en mode simulation.'
        : 'Demande d’abonnement rejetée.'
    );
  };

  const curateScholarship = (
    scholarshipId: string,
    curationStatus: CurationStatus,
    updatedFields?: Partial<Scholarship>,
    summaryNote?: string
  ) => {
    setState((prev) => {
      const scholarships = prev.scholarships.map((sch) => {
        if (sch.id !== scholarshipId) return sch;
        const newMod = {
          id: `mod-${Date.now()}`,
          date: '2026-11-23',
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          summary:
            summaryNote ||
            `Décision de curation : passage au statut ${curationStatus}.`,
        };
        const nextPubStatus =
          curationStatus === 'VERIFIED'
            ? ('PUBLISHED' as const)
            : curationStatus === 'ARCHIVED' || curationStatus === 'REJECTED'
            ? ('ARCHIVED' as const)
            : ('PENDING_REVIEW' as const);

        return {
          ...sch,
          ...updatedFields,
          curationStatus,
          publicationStatus: nextPubStatus,
          lastVerifiedAt: curationStatus === 'VERIFIED' ? '2026-11-23' : sch.lastVerifiedAt,
          verifiedByCurator:
            curationStatus === 'VERIFIED' ? currentUser.fullName : sch.verifiedByCurator,
          status: curationStatus === 'ARCHIVED' ? ('EXPIRED' as const) : sch.status,
          modificationHistory: [newMod, ...sch.modificationHistory],
        };
      });

      const auditLogs = appendAuditLog(
        prev,
        'CURATION_DECISION',
        `Annonce ${scholarshipId}`,
        summaryNote || `Statut de curation modifié vers ${curationStatus}.`
      );

      return { ...prev, scholarships, auditLogs };
    });
    showToast(`Annonce mise à jour avec le statut de curation : ${curationStatus}.`);
  };

  const createOfficialSource: AppContextValue['createOfficialSource'] = (payload) => {
    setState((prev) => {
      const newSrc: OfficialSource = {
        id: `src-${Date.now()}`,
        name: payload.name.trim(),
        institutionType: payload.institutionType.trim() || 'Institution officielle',
        country: payload.country.trim() || 'Cameroun',
        officialUrl: payload.officialUrl.trim(),
        reliabilityStatus: 'A_CONTROLER',
        lastCheckedAt: '2026-11-24',
        activeAnnouncementsCount: 0,
        notes:
          payload.notes?.trim() ||
          'Nouvelle source enregistrée dans le répertoire officiel.',
      };
      return {
        ...prev,
        sources: [newSrc, ...prev.sources],
      };
    });
    showToast(`Source officielle « ${payload.name} » ajoutée au répertoire.`);
  };

  const updateSourceReliability = (
    sourceId: string,
    reliabilityStatus: OfficialSource['reliabilityStatus'],
    notes?: string
  ) => {
    setState((prev) => ({
      ...prev,
      sources: prev.sources.map((src) =>
        src.id === sourceId
          ? {
              ...src,
              reliabilityStatus,
              lastCheckedAt: '2026-11-23',
              notes: notes !== undefined ? notes : src.notes,
            }
          : src
      ),
    }));
    showToast('Statut de fiabilité de la source mis à jour.');
  };

  const resolveDuplicate = (
    duplicateId: string,
    action: 'MERGED_ARCHIVED' | 'DISMISSED'
  ) => {
    setState((prev) => {
      const dup = prev.duplicates.find((d) => d.id === duplicateId);
      const duplicates = prev.duplicates.map((d) =>
        d.id === duplicateId ? { ...d, status: action } : d
      );
      let scholarships = prev.scholarships;
      if (action === 'MERGED_ARCHIVED' && dup) {
        scholarships = prev.scholarships.map((s) =>
          s.id === dup.duplicateScholarshipId
            ? {
                ...s,
                curationStatus: 'ARCHIVED' as const,
                publicationStatus: 'ARCHIVED' as const,
              }
            : s
        );
      }
      return { ...prev, duplicates, scholarships };
    });
    showToast(
      action === 'MERGED_ARCHIVED'
        ? 'Doublon confirmé : l’annonce redondante a été archivée.'
        : 'Signalement de doublon écarté : les deux annonces sont distinctes.'
    );
  };

  const toggleUserActiveStatus = (userId: string, explicitActive?: boolean) => {
    setState((prev) => {
      const target = prev.users.find((u) => u.id === userId);
      const nextActive = explicitActive !== undefined ? explicitActive : !target?.active;
      const users = prev.users.map((u) =>
        u.id === userId ? { ...u, active: nextActive } : u
      );
      const auditLogs = appendAuditLog(
        prev,
        'ACCOUNT_STATUS',
        `Compte ${target?.fullName || userId}`,
        nextActive
          ? 'Réactivation administrative du compte.'
          : 'Désactivation administrative du compte.'
      );
      return { ...prev, users, auditLogs };
    });
    showToast('Statut du compte utilisateur mis à jour.');
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    }));
    showToast(`Rôle utilisateur modifié vers ${newRole}.`);
  };

  const verifyOrganizationAccount = (
    orgId: string,
    verificationStatus: OrganizationProfile['verificationStatus']
  ) => {
    setState((prev) => {
      const org = prev.organizations.find((o) => o.id === orgId);
      const isVerified = verificationStatus === 'VERIFIED';
      const organizations = prev.organizations.map((o) =>
        o.id === orgId
          ? {
              ...o,
              isVerified,
              verificationStatus,
              verifiedAt: isVerified ? '2026-11-23' : o.verifiedAt,
            }
          : o
      );
      const auditLogs = appendAuditLog(
        prev,
        'ORG_VERIFICATION',
        org?.officialName || orgId,
        `Décision administrative sur le compte organisme : ${verificationStatus}.`
      );
      return { ...prev, organizations, auditLogs };
    });
    showToast(`Statut de l'organisme mis à jour : ${verificationStatus}.`);
  };

  /**
   * Cycle éditorial des bourses côté Administrateur (OpenAPI 1.1 : /admin/scholarships)
   * RÈGLE ABSOLUE : La création d'une bourse ne déclenche JAMAIS sa publication immédiate.
   * Elle commence en statut `DRAFT` (non visible dans le catalogue public).
   */
  const createAdminScholarshipDraft: AppContextValue['createAdminScholarshipDraft'] = (
    draftInput
  ) => {
    const newDraft: ScholarshipDraft = {
      id: `draft-${Date.now()}`,
      title: draftInput.title?.trim() || 'Nouveau brouillon de bourse',
      publicationStatus: 'DRAFT',
      acquisitionChannel: draftInput.acquisitionChannel || 'ADMIN_MANUAL',
      issuerOrganizationId: draftInput.issuerOrganizationId,
      issuerOrganizationName: draftInput.issuerOrganizationName?.trim() || '',
      hostCountry: draftInput.hostCountry?.trim() || 'France',
      fundingType:
        draftInput.fundingType || 'Bourse complète (Frais + Vie + Transport)',
      financialSummary: draftInput.financialSummary?.trim() || '',
      deadline: draftInput.deadline || '2027-06-30',
      startDate: draftInput.startDate || '2027-09-15',
      durationMonths: draftInput.durationMonths || 12,
      description: draftInput.description?.trim() || '',
      benefits: draftInput.benefits || [
        'Prise en charge académique selon les conditions officielles',
      ],
      requiredDocuments: draftInput.requiredDocuments || [
        'Diplôme certifié conforme',
        'Relevés de notes',
        'Lettre de motivation',
      ],
      criteria: draftInput.criteria || {
        eligibleNationalities: ['Cameroun', 'Toutes'],
        requiredResidenceCountries: ['Tous'],
        requiredDiplomaObtained: ['Licence'],
        targetStudyLevels: ['Master'],
        eligibleDomains: ['Informatique & Systèmes'],
        minGradeOut20: 14,
        maxAge: 28,
        requiredLanguage: 'Français',
        minLanguageLevel: 'B2',
        requiresLanguageCertification: false,
        specificConditions: [],
        preferentialCriteria: [],
      },
      sourceName: draftInput.sourceName?.trim() || '',
      sourceUrl: draftInput.sourceUrl?.trim() || '',
      applicationUrl: draftInput.applicationUrl?.trim() || undefined,
      internalNotes: draftInput.internalNotes?.trim() || '',
      missingPublicationFields: [],
      createdBy: currentUser.fullName,
      createdAt: '2026-11-24T08:00:00Z',
      updatedAt: '2026-11-24T08:00:00Z',
      version: 1,
    };
    newDraft.missingPublicationFields = computeMissingPublicationFields(newDraft);

    setState((prev) => ({
      ...prev,
      adminDrafts: [newDraft, ...(prev.adminDrafts || [])],
    }));

    showToast(
      'Brouillon enregistré (statut DRAFT). Il n’est pas encore publié dans le catalogue étudiant.'
    );
    return newDraft;
  };

  const updateAdminScholarshipDraft = (
    draftId: string,
    patch: Partial<ScholarshipDraft>
  ) => {
    setState((prev) => ({
      ...prev,
      adminDrafts: (prev.adminDrafts || []).map((d) => {
        if (d.id !== draftId) return d;
        const merged: ScholarshipDraft = {
          ...d,
          ...patch,
          updatedAt: '2026-11-24T08:15:00Z',
          version: d.version + 1,
        };
        merged.missingPublicationFields = computeMissingPublicationFields(merged);
        return merged;
      }),
    }));
    showToast('Modifications du brouillon enregistrées.');
  };

  const submitAdminDraftForReview = (draftId: string) => {
    setState((prev) => ({
      ...prev,
      adminDrafts: (prev.adminDrafts || []).map((d) =>
        d.id === draftId
          ? {
              ...d,
              publicationStatus: 'PENDING_REVIEW',
              updatedAt: '2026-11-24T08:20:00Z',
              version: d.version + 1,
            }
          : d
      ),
    }));
    showToast('Brouillon soumis pour validation éditoriale (PENDING_REVIEW).');
  };

  const publishAdminScholarshipDraft = (draftId: string, editorialNote?: string) => {
    const targetDraft = (state.adminDrafts || []).find((d) => d.id === draftId);
    if (!targetDraft) return;

    const missing = computeMissingPublicationFields(targetDraft);
    if (missing.length > 0) {
      showToast(
        `Publication refusée : veuillez compléter les champs obligatoires (${missing.join(', ')}).`
      );
      return;
    }

    const publishedScholarship: Scholarship = {
      id: `sch-${Date.now()}`,
      code: `ADM-2027-${Math.floor(100 + Math.random() * 900)}`,
      title: targetDraft.title,
      organizationId: targetDraft.issuerOrganizationId || 'org-1',
      organizationName: targetDraft.issuerOrganizationName,
      organizationType: 'Coopération internationale',
      hostCountry: targetDraft.hostCountry,
      fundingType: targetDraft.fundingType,
      financialSummary: targetDraft.financialSummary,
      deadline: targetDraft.deadline,
      startDate: targetDraft.startDate,
      durationMonths: targetDraft.durationMonths,
      description: targetDraft.description,
      benefits: targetDraft.benefits,
      requiredDocuments: targetDraft.requiredDocuments,
      criteria: targetDraft.criteria,
      isDemoData: true,
      sourceName: targetDraft.sourceName,
      sourceUrl: targetDraft.sourceUrl,
      retrievedAt: '2026-11-24',
      lastVerifiedAt: '2026-11-24',
      verifiedByCurator: currentUser.fullName,
      curationStatus: 'VERIFIED',
      status: 'OPEN',
      publicationStatus: 'PUBLISHED',
      acquisitionChannel: targetDraft.acquisitionChannel,
      applicationUrl: targetDraft.applicationUrl,
      createdBy: targetDraft.createdBy,
      updatedAt: '2026-11-24T08:30:00Z',
      version: targetDraft.version + 1,
      modificationHistory: [
        {
          id: `mod-${Date.now()}`,
          date: '2026-11-24',
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          summary:
            editorialNote ||
            'Vérification de la source officielle et publication dans le catalogue public.',
        },
      ],
    };

    setState((prev) => {
      const adminDrafts = (prev.adminDrafts || []).map((d) =>
        d.id === draftId
          ? { ...d, publicationStatus: 'PUBLISHED' as const, version: d.version + 1 }
          : d
      );
      const auditLogs = appendAuditLog(
        prev,
        'CAMPAIGN_PUBLISHED',
        publishedScholarship.title,
        editorialNote || 'Publication d’une offre vérifiée depuis un brouillon administrateur.'
      );
      return {
        ...prev,
        adminDrafts,
        scholarships: [publishedScholarship, ...prev.scholarships],
        auditLogs,
      };
    });

    showToast('Offre vérifiée et publiée dans le catalogue public des bourses.');
  };

  const archiveAdminScholarship = (idOrDraftId: string) => {
    setState((prev) => {
      const adminDrafts = (prev.adminDrafts || []).map((d) =>
        d.id === idOrDraftId
          ? { ...d, publicationStatus: 'ARCHIVED' as const, version: d.version + 1 }
          : d
      );
      const scholarships = prev.scholarships.map((s) =>
        s.id === idOrDraftId
          ? {
              ...s,
              curationStatus: 'ARCHIVED' as const,
              publicationStatus: 'ARCHIVED' as const,
              status: 'EXPIRED' as const,
            }
          : s
      );
      return { ...prev, adminDrafts, scholarships };
    });
    showToast('Offre archivée et retirée de la liste publique.');
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('Toutes vos notifications ont été marquées comme lues.');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isAuthenticated: state.isAuthenticated ?? true,
        currentUser,
        currentStudent,
        currentOrganization,
        toastMessage,
        showToast,
        switchDemoUser,
        switchDemoRole,
        logoutUser,
        resetDemoData,
        apiConfig,
        setApiMode,
        fallbackToMockMode,
        authenticateUser,
        registerPublicStudentAccount,
        verifyCurrentStudentEmail,
        switchAuthorizedWorkspace,
        partnerRequests: state.partnerRequests || [],
        savePartnerOrganizationRequestDraft,
        submitPartnerOrganizationRequest,
        decidePartnerOrganizationRequest,
        registerStudentAccount,
        updateStudentProfile,
        addStudentAcademicRecord,
        removeStudentAcademicRecord,
        toggleSavedScholarship,
        toggleInstitutionalVisibility,
        respondToInvitation,
        submitApplication,
        evaluateForCurrentStudent,
        updateOrganizationProfile,
        createOrUpdateScholarship,
        submitOrganizationScholarshipForCuration,
        sendInvitationToStudent,
        updateApplicationStatus,
        addOrganizationEvaluator,
        changeOrganizationPlan,
        requestOrganizationPlanChange,
        curateScholarship,
        createOfficialSource,
        updateSourceReliability,
        resolveDuplicate,
        toggleUserActiveStatus,
        changeUserRole,
        verifyOrganizationAccount,
        decideSubscriptionRequest,
        createAdminScholarshipDraft,
        updateAdminScholarshipDraft,
        submitAdminDraftForReview,
        publishAdminScholarshipDraft,
        archiveAdminScholarship,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp doit être utilisé à l’intérieur d’un AppProvider');
  }
  return ctx;
};

