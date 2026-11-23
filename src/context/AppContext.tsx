import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ApplicationRecord,
  ApplicationStatus,
  AppNotification,
  AuditLogEntry,
  CommercialSubscription,
  CurationStatus,
  DuplicateCandidate,
  EligibilityReport,
  Invitation,
  OfficialSource,
  OrganizationProfile,
  PlanTierId,
  Scholarship,
  StudentProfile,
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

const STORAGE_KEY = 'scholarfind_demo_state_v1';

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

  // Services Étudiant
  updateStudentProfile: (studentId: string, patch: Partial<StudentProfile>) => void;
  toggleSavedScholarship: (scholarshipId: string) => void;
  toggleInstitutionalVisibility: (enabled: boolean, allowScoreSharing?: boolean) => void;
  respondToInvitation: (invitationId: string, accept: boolean, note?: string) => void;
  submitApplication: (scholarshipId: string, motivationNote?: string) => void;
  evaluateForCurrentStudent: (scholarship: Scholarship) => EligibilityReport;

  // Services Organisme
  updateOrganizationProfile: (orgId: string, patch: Partial<OrganizationProfile>) => void;
  createOrUpdateScholarship: (scholarship: Scholarship) => void;
  sendInvitationToStudent: (studentId: string, scholarshipId: string, message: string) => void;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string,
    score?: number,
    decisionJustification?: string
  ) => void;
  addOrganizationEvaluator: (orgId: string, name: string, email: string, roleTitle: string, permissionLevel: 'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE') => void;
  changeOrganizationPlan: (orgId: string, planId: PlanTierId) => void;

  // Services Curateur
  curateScholarship: (scholarshipId: string, status: CurationStatus, updatedFields?: Partial<Scholarship>, summaryNote?: string) => void;
  updateSourceReliability: (sourceId: string, status: OfficialSource['reliabilityStatus'], notes?: string) => void;
  resolveDuplicate: (duplicateId: string, action: 'MERGED_ARCHIVED' | 'DISMISSED') => void;

  // Services Administrateur
  toggleUserActiveStatus: (userId: string) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;
  verifyOrganizationAccount: (orgId: string, status: OrganizationProfile['verificationStatus']) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const getInitialState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.users && parsed.scholarships && parsed.students) {
        const sanitizedScholarships = (parsed.scholarships as Scholarship[]).map((s) =>
          s.id === 'sch-6'
            ? {
                ...s,
                criteria: {
                  ...s.criteria,
                  eligibleDomains: ['Santé & Sciences Biomédicales' as const],
                },
              }
            : s
        );
        return {
          ...parsed,
          scholarships: sanitizedScholarships,
          isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : true,
        };
      }
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }
  return {
    currentUserId: 'usr-stu-1',
    isAuthenticated: true,
    users: INITIAL_USER_ACCOUNTS,
    students: INITIAL_STUDENT_PROFILES,
    organizations: INITIAL_ORGANIZATIONS,
    scholarships: INITIAL_SCHOLARSHIPS,
    invitations: INITIAL_INVITATIONS,
    applications: INITIAL_APPLICATIONS,
    sources: INITIAL_OFFICIAL_SOURCES,
    duplicates: INITIAL_DUPLICATE_CANDIDATES,
    notifications: INITIAL_NOTIFICATIONS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) || state.users[0],
    [state.users, state.currentUserId]
  );

  const currentStudent = useMemo(
    () =>
      state.students.find((s) => s.id === currentUser.linkedEntityId) ||
      state.students[0],
    [state.students, currentUser]
  );

  const currentOrganization = useMemo(
    () =>
      state.organizations.find((o) => o.id === currentUser.linkedEntityId) ||
      state.organizations[0],
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
    setState({
      currentUserId: 'usr-stu-1',
      isAuthenticated: true,
      users: INITIAL_USER_ACCOUNTS,
      students: INITIAL_STUDENT_PROFILES,
      organizations: INITIAL_ORGANIZATIONS,
      scholarships: INITIAL_SCHOLARSHIPS,
      invitations: INITIAL_INVITATIONS,
      applications: INITIAL_APPLICATIONS,
      sources: INITIAL_OFFICIAL_SOURCES,
      duplicates: INITIAL_DUPLICATE_CANDIDATES,
      notifications: INITIAL_NOTIFICATIONS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    });
    showToast('Données de démonstration réinitialisées à leur état initial.');
  };

  const updateStudentProfile = (studentId: string, patch: Partial<StudentProfile>) => {
    setState((prev) => {
      const students = prev.students.map((stu) => {
        if (stu.id !== studentId) return stu;
        const merged = { ...stu, ...patch, updatedAt: '2026-11-23' };
        merged.normalizedGradeOut20 = normalizeGradeTo20(merged.averageGrade, merged.gradingScale);
        return merged;
      });
      return { ...prev, students };
    });
    showToast('Profil académique mis à jour et sauvegardé localement.');
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
      const students = prev.students.map((stu) => {
        if (stu.id !== stuId) return stu;
        return {
          ...stu,
          institutionalVisibilityEnabled: enabled,
          visibilityConsentDate: enabled ? '2026-11-23' : undefined,
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
        ? 'Visibilité institutionnelle activée : seuls les organismes vérifiés peuvent voir votre profil anonymisé.'
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
              studentResponseNote: note || (accept ? 'Invitation acceptée avec consentement de partage.' : 'Invitation déclinée.'),
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
            evaluatorNotes: 'Dossier transmis suite à l’acceptation d’une invitation institutionnelle.',
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
      const scholarships = exists
        ? prev.scholarships.map((s) => (s.id === scholarship.id ? scholarship : s))
        : [scholarship, ...prev.scholarships];

      const auditLogs = appendAuditLog(
        prev,
        'CAMPAIGN_PUBLISHED',
        scholarship.title,
        exists ? 'Mise à jour des paramètres et critères de la campagne.' : 'Création d’un nouveau programme de bourse de démonstration.'
      );
      return { ...prev, scholarships, auditLogs };
    });
    showToast('Programme de bourse enregistré avec succès.');
  };

  const sendInvitationToStudent = (studentId: string, scholarshipId: string, message: string) => {
    const student = state.students.find((s) => s.id === studentId);
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

    showToast('Invitation simulée transmise au candidat volontaire.');
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

  const changeOrganizationPlan = (orgId: string, planId: PlanTierId) => {
    const planDetails: Record<PlanTierId, { name: string; amount: number; cycle: CommercialSubscription['billingCycle'] }> = {
      STUDENT_FREE: { name: 'Étudiant Gratuit', amount: 0, cycle: 'Gratuit' },
      ORG_DISCOVERY: { name: 'Organisme Découverte', amount: 0, cycle: 'Gratuit' },
      ORG_PRO: { name: 'Organisme Pro', amount: 50000, cycle: 'Mensuel' },
      ORG_PREMIUM: { name: 'Organisme Premium', amount: 150000, cycle: 'Mensuel' },
      ORG_SINGLE_CAMPAIGN: { name: 'Campagne ponctuelle', amount: 75000, cycle: 'Campagne ponctuelle' },
    };

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
    showToast(`Formule simulée mise à jour : ${planDetails[planId].name} (aucun paiement réel effectué).`);
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
        return {
          ...sch,
          ...updatedFields,
          curationStatus,
          lastVerifiedAt: curationStatus === 'VERIFIED' ? '2026-11-23' : sch.lastVerifiedAt,
          verifiedByCurator: curationStatus === 'VERIFIED' ? currentUser.fullName : sch.verifiedByCurator,
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

  const resolveDuplicate = (duplicateId: string, action: 'MERGED_ARCHIVED' | 'DISMISSED') => {
    setState((prev) => {
      const dup = prev.duplicates.find((d) => d.id === duplicateId);
      const duplicates = prev.duplicates.map((d) =>
        d.id === duplicateId ? { ...d, status: action } : d
      );
      let scholarships = prev.scholarships;
      if (action === 'MERGED_ARCHIVED' && dup) {
        scholarships = prev.scholarships.map((s) =>
          s.id === dup.duplicateScholarshipId ? { ...s, curationStatus: 'ARCHIVED' as const } : s
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

  const toggleUserActiveStatus = (userId: string) => {
    setState((prev) => {
      const target = prev.users.find((u) => u.id === userId);
      const users = prev.users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u));
      const auditLogs = appendAuditLog(
        prev,
        'ACCOUNT_STATUS',
        `Compte ${target?.fullName || userId}`,
        target?.active ? 'Désactivation administrative du compte.' : 'Réactivation administrative du compte.'
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
        updateStudentProfile,
        toggleSavedScholarship,
        toggleInstitutionalVisibility,
        respondToInvitation,
        submitApplication,
        evaluateForCurrentStudent,
        updateOrganizationProfile,
        createOrUpdateScholarship,
        sendInvitationToStudent,
        updateApplicationStatus,
        addOrganizationEvaluator,
        changeOrganizationPlan,
        curateScholarship,
        updateSourceReliability,
        resolveDuplicate,
        toggleUserActiveStatus,
        changeUserRole,
        verifyOrganizationAccount,
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
