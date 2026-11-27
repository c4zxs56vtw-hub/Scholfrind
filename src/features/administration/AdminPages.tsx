import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  Button,
  CurationReliabilityNote,
  Modal,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import { useApp } from '../../context/AppContext';
import {
  ACADEMIC_LEVELS,
  FUNDING_TYPES,
  STUDY_DOMAINS,
} from '../../data/mockData';
import { adminApiService } from '../../api/services/scholarfindServices';
import {
  AcademicLevel,
  AiExtractionResult,
  FundingType,
  PartnerOrganizationRequest,
  PartnerRequestStatus,
  PartnerSupportingDocument,
  ScholarshipDraft,
  StudyDomain,
  UserRole,
} from '../../types';
import { getPartnerRequestStatusLabel } from '../auth/authAndPartnerLogic';
import { PartnerRequestStatusBadge } from '../students/PartnerOrganizationRequestPage';

/**
 * 1. TABLEAU DE BORD ADMINISTRATEUR (/admin/tableau-de-bord)
 */
export const AdminDashboardPage: React.FC = () => {
  const {
    users,
    organizations,
    scholarships,
    subscriptions,
    auditLogs,
  } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
          Administration
        </h1>
        <p className="text-sm text-[#69768C] mt-1">
          Supervisez les comptes, l’accréditation des organismes et la conformité de la plateforme.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/utilisateurs"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Utilisateurs</div>
          <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
            {users.length}
          </div>
        </Link>
        <Link
          to="/admin/organismes"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Organismes</div>
          <div className="text-2xl font-bold text-[#203454] tabular-nums mt-1">
            {organizations.length}{' '}
            <span className="text-xs font-semibold text-[#14533C]">
              ({organizations.filter((o) => o.isVerified).length} vérifiés)
            </span>
          </div>
        </Link>
        <Link
          to="/admin/bourses"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Bourses</div>
          <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
            {scholarships.length}
          </div>
        </Link>
        <Link
          to="/admin/abonnements"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Abonnements B2B</div>
          <div className="text-2xl font-bold text-[#203454] tabular-nums mt-1">
            {subscriptions.length}
          </div>
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Panel
            title="Accréditation des organismes"
            subtitle="Vérification requise avant l’accès aux profils volontaires"
            headerRight={
              <Link
                to="/admin/organismes"
                className="text-xs font-semibold text-[#3457D5] hover:underline"
              >
                Gérer →
              </Link>
            }
          >
            <div className="divide-y divide-[#E6ECF5] text-xs">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-[#203454]">
                      {org.officialName}
                    </div>
                    <div className="text-[#69768C]">
                      {org.type} · N° {org.registrationNumber}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-semibold ${
                      org.isVerified
                        ? 'bg-[#DDF5EB] text-[#14533C]'
                        : 'bg-[#F5A17B]/20 text-[#9A421D]'
                    }`}
                  >
                    {org.verificationStatus}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-6">
          <Panel
            title="Activité récente"
            subtitle="Journal de traçabilité et sécurité"
            headerRight={
              <Link
                to="/admin/audit"
                className="text-xs font-semibold text-[#3457D5] hover:underline"
              >
                Tout voir →
              </Link>
            }
          >
            <div className="divide-y divide-[#E6ECF5] text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-[#203454]">
                    <span>{log.targetLabel}</span>
                    <span className="text-[11px] font-normal text-[#69768C] tabular-nums">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-[#69768C]">{log.details}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. GESTION DES UTILISATEURS (/admin/utilisateurs)
 */
export const AdminUsersPage: React.FC = () => {
  const { users, toggleUserActiveStatus, changeUserRole } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="CONTRÔLE D’ACCÈS BASÉ SUR LES RÔLES (RBAC)"
        title="Gestion des comptes utilisateurs"
        subtitle="Consultez les utilisateurs de démonstration, activez ou désactivez un compte et gérez les rôles attribués."
      />

      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6ECF5] bg-[#F8FAFD] text-[#203454]">
                <th className="py-3 px-4 font-semibold">Nom complet</th>
                <th className="py-3 px-4 font-semibold">Adresse e-mail</th>
                <th className="py-3 px-4 font-semibold">Rôle</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFD]">
                  <td className="py-3 px-4 font-semibold text-[#253047]">
                    {u.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#69768C]">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      aria-label={`Rôle de ${u.fullName}`}
                      value={u.role}
                      onChange={(e) =>
                        changeUserRole(u.id, e.target.value as UserRole)
                      }
                      className="px-2 py-1 bg-white border border-[#E6ECF5] rounded-xl text-xs"
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="ORGANIZATION">ORGANIZATION</option>
                      <option value="CURATOR">CURATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        u.active ? 'text-[#14533C]' : 'text-[#B42318]'
                      }`}
                    >
                      {u.active ? 'Compte actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleUserActiveStatus(u.id)}
                    >
                      {u.active ? 'Désactiver' : 'Réactiver'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

/**
 * 3. GESTION DES ORGANISMES & DEMANDES PARTENAIRES (/admin/organismes & /admin/demandes-organismes)
 */
export const AdminOrganizationsPage: React.FC = () => {
  const {
    organizations,
    partnerRequests = [],
    verifyOrganizationAccount,
    decidePartnerOrganizationRequest,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  const [countryFilter, setCountryFilter] = useState<string>('TOUS');
  const [typeFilter, setTypeFilter] = useState<string>('TOUS');

  const [previewDoc, setPreviewDoc] =
    useState<PartnerSupportingDocument | null>(null);

  // État de la modale de confirmation obligatoire avant toute décision sensible
  const [decisionModal, setDecisionModal] = useState<{
    request: PartnerOrganizationRequest;
    targetStatus:
      | 'UNDER_REVIEW'
      | 'MORE_INFO_REQUIRED'
      | 'APPROVED'
      | 'REJECTED';
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    partnerRequests.forEach((r) => {
      if (r.country) set.add(r.country);
    });
    return Array.from(set);
  }, [partnerRequests]);

  const filteredRequests = useMemo(() => {
    return partnerRequests.filter((req) => {
      if (statusFilter !== 'TOUS' && req.status !== statusFilter) return false;
      if (countryFilter !== 'TOUS' && req.country !== countryFilter)
        return false;
      if (typeFilter !== 'TOUS' && req.organizationType !== typeFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay =
          `${req.officialName} ${req.representativeName} ${req.professionalEmail} ${req.legalRegistrationNumber} ${req.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [partnerRequests, statusFilter, countryFilter, typeFilter, searchQuery]);

  const openDecisionModal = (
    request: PartnerOrganizationRequest,
    targetStatus:
      | 'UNDER_REVIEW'
      | 'MORE_INFO_REQUIRED'
      | 'APPROVED'
      | 'REJECTED'
  ) => {
    setDecisionModal({ request, targetStatus });
    setDecisionError(null);
    if (targetStatus === 'APPROVED') {
      setDecisionNote(
        'Vérification de l’existence légale et du mandat du représentant conforme. Approbation et octroi de la permission ORGANIZATION.'
      );
    } else if (targetStatus === 'UNDER_REVIEW') {
      setDecisionNote(
        'Prise en charge du dossier par l’administrateur pour vérification des pièces justificatives.'
      );
    } else {
      setDecisionNote('');
    }
  };

  const handleConfirmDecision = () => {
    if (!decisionModal) return;
    const { request, targetStatus } = decisionModal;

    if (
      (targetStatus === 'REJECTED' ||
        targetStatus === 'MORE_INFO_REQUIRED') &&
      decisionNote.trim().length < 10
    ) {
      setDecisionError(
        targetStatus === 'REJECTED'
          ? 'Une justification détaillée (minimum 10 caractères) est obligatoire pour refuser une demande.'
          : 'Veuillez préciser clairement les documents ou informations complémentaires attendus (minimum 10 caractères).'
      );
      return;
    }

    decidePartnerOrganizationRequest(request.id, targetStatus, decisionNote);
    setDecisionModal(null);
    setDecisionNote('');
    setDecisionError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="GOUVERNANCE & VÉRIFICATION INSTITUTIONNELLE"
        title="Demandes d’organismes partenaires & Accréditations"
        subtitle="Examinez les demandes de création d’espace organisme partenaire, contrôlez les pièces justificatives et approuvez ou refusez l’attribution de la permission ORGANIZATION."
      />

      {/* SECTION 1 : DEMANDES DE CRÉATION D'ESPACE ORGANISME PARTENAIRE */}
      <section className="space-y-4" data-testid="admin-partner-requests-section">
        <div className="rounded-2xl border border-[#E6ECF5] bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#203454] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#3457D5]" />
                <span>
                  Demandes de création de compte organisme partenaire (
                  {filteredRequests.length})
                </span>
              </h2>
              <p className="text-xs text-[#69768C] mt-0.5">
                Toute décision sensible (Approbation, Demande de compléments, Refus) requiert une confirmation explicite et est journalisée.
              </p>
            </div>
          </div>

          {/* Barre de recherche et filtres (Statut, Pays, Type d'organisme) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#69768C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher organisme, représentant..."
                aria-label="Rechercher une demande d'organisme"
                className="w-full rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] pl-9 pr-3 py-2 text-xs text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <select
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] px-3 py-2 text-xs font-semibold text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="SUBMITTED">Soumise (SUBMITTED)</option>
                <option value="UNDER_REVIEW">
                  En cours de vérification (UNDER_REVIEW)
                </option>
                <option value="MORE_INFO_REQUIRED">
                  Compléments requis (MORE_INFO_REQUIRED)
                </option>
                <option value="APPROVED">Approuvée (APPROVED)</option>
                <option value="REJECTED">Refusée (REJECTED)</option>
                <option value="DRAFT">Brouillon (DRAFT)</option>
              </select>
            </div>

            <div>
              <select
                aria-label="Filtrer par pays"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] px-3 py-2 text-xs font-semibold text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
              >
                <option value="TOUS">Tous les pays</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                aria-label="Filtrer par type d'organisme"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] px-3 py-2 text-xs font-semibold text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
              >
                <option value="TOUS">Tous les types d’organismes</option>
                <option value="Fondation">Fondation</option>
                <option value="Université">Université</option>
                <option value="ONG">ONG</option>
                <option value="Entreprise">Entreprise</option>
                <option value="Institution publique">
                  Institution publique
                </option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des demandes partenaires */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-[#E6ECF5] bg-white p-8 text-center text-xs text-[#69768C]">
            Aucune demande d’organisme partenaire ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-[#E6ECF5] bg-white p-5 sm:p-6 shadow-xs space-y-4"
                data-testid={`admin-partner-request-card-${req.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E6ECF5] pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <PartnerRequestStatusBadge status={req.status} />
                      <span className="rounded-lg bg-[#F8FAFD] border border-[#E6ECF5] px-2.5 py-0.5 text-[11px] font-bold text-[#203454]">
                        {req.organizationType}
                      </span>
                      <span className="text-[11px] text-[#69768C]">
                        {req.city}, {req.country} · Agrément :{' '}
                        <strong className="text-[#203454]">
                          {req.legalRegistrationNumber || 'Non spécifié'}
                        </strong>
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#203454]">
                      {req.officialName}
                    </h3>
                    <p className="text-xs text-[#69768C] mt-0.5">
                      {req.description}
                    </p>
                  </div>

                  {/* Actions administratives avec confirmation modale */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {req.status === 'SUBMITTED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDecisionModal(req, 'UNDER_REVIEW')}
                      >
                        Marquer en cours d’examen
                      </Button>
                    )}
                    {req.status !== 'APPROVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openDecisionModal(req, 'APPROVED')}
                      >
                        Approuver la demande
                      </Button>
                    )}
                    {req.status !== 'APPROVED' &&
                      req.status !== 'MORE_INFO_REQUIRED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            openDecisionModal(req, 'MORE_INFO_REQUIRED')
                          }
                        >
                          Demander des compléments
                        </Button>
                      )}
                    {req.status !== 'REJECTED' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openDecisionModal(req, 'REJECTED')}
                      >
                        Refuser
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grille : Informations du représentant & Pièces justificatives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] p-3.5 space-y-1.5">
                    <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#203454]">
                      Informations du représentant
                    </h4>
                    <p>
                      <span className="text-[#69768C]">Représentant : </span>
                      <strong className="text-[#203454]">
                        {req.representativeName}
                      </strong>{' '}
                      ({req.representativeRole})
                    </p>
                    <p>
                      <span className="text-[#69768C]">Coordonnées pro : </span>
                      <span className="font-semibold text-[#203454]">
                        {req.professionalEmail} · {req.professionalPhone}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#69768C]">Site officiel : </span>
                      <span className="font-semibold text-[#3457D5]">
                        {req.website}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#69768C]">Motif déclaré : </span>
                      <span className="text-[#203454]">
                        {req.requestMotivation}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] p-3.5 space-y-2">
                    <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#203454]">
                      Justificatifs transmis ({req.documents.length})
                    </h4>
                    {req.documents.length === 0 ? (
                      <p className="text-[#9A3412]">
                        Aucun document justificatif joint.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {req.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg border border-[#DCE6F7] bg-white px-2.5 py-1.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-[#3457D5] shrink-0" />
                              <span className="truncate font-semibold text-[#203454]">
                                {doc.fileName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1 rounded bg-[#EBF0FF] px-2 py-0.5 text-[11px] font-bold text-[#3457D5] hover:bg-[#3457D5] hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
                            >
                              <Eye className="h-3 w-3" /> Examiner
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Historique des décisions sur la demande */}
                {req.decisionHistory.length > 0 && (
                  <div className="rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#203454] mb-2">
                      <History className="h-3.5 w-3.5 text-[#3457D5]" />
                      <span>
                        Historique des décisions ({req.decisionHistory.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {req.decisionHistory.map((d) => (
                        <div
                          key={d.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] border-t border-[#E6ECF5] pt-1.5 first:border-t-0 first:pt-0"
                        >
                          <div>
                            <strong className="text-[#203454]">
                              {getPartnerRequestStatusLabel(d.newStatus)}
                            </strong>{' '}
                            <span className="text-[#69768C]">
                              par {d.actorName} :
                            </span>{' '}
                            <span className="text-[#253047]">{d.note}</span>
                          </div>
                          <span className="font-mono text-[#69768C] shrink-0">
                            {d.decidedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2 : RÉPERTOIRE DES ORGANISMES DÉJÀ ENREGISTRÉS */}
      <section className="space-y-4 pt-4 border-t border-[#E6ECF5]">
        <h2 className="text-base sm:text-lg font-bold text-[#203454]">
          Répertoire des organismes enregistrés ({organizations.length})
        </h2>
        <div className="space-y-4">
          {organizations.map((org) => (
            <Panel
              key={org.id}
              title={org.officialName}
              subtitle={`${org.type} · ${org.country} · Agrément : ${org.registrationNumber}`}
              headerRight={
                <span className="px-2.5 py-1 rounded bg-[#3457D5]/10 text-[#203454] font-semibold text-xs">
                  Statut : {org.verificationStatus}
                </span>
              }
            >
              <div className="space-y-3 text-xs">
                <p className="text-[#69768C]">{org.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6ECF5]">
                  <span className="text-[#253047]">
                    Contact : <strong>{org.contactPersonName}</strong> (
                    {org.contactEmail})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        verifyOrganizationAccount(org.id, 'VERIFIED')
                      }
                    >
                      Approuver & Vérifier
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        verifyOrganizationAccount(org.id, 'SUSPENDED')
                      }
                    >
                      Suspendre
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        verifyOrganizationAccount(org.id, 'REJECTED')
                      }
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* Modale d'aperçu confidentiel des pièces justificatives */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Examen de pièce justificative : ${previewDoc.fileName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] p-3.5 space-y-1">
              <p className="font-bold text-[#203454]">
                Fichier : {previewDoc.fileName} (
                {Math.round(previewDoc.sizeBytes / 1024)} Ko)
              </p>
              <p className="text-[#69768C]">
                Téléversé le {previewDoc.uploadedAt} · Type :{' '}
                {previewDoc.mimeType}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6ECF5] bg-white p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#14533C]">
                <ShieldCheck className="h-4 w-4 text-[#1F8A5C]" />
                <span>Synthèse du document certifié</span>
              </div>
              <p className="text-[#203454] leading-relaxed">
                {previewDoc.confidentialPreviewSummary}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modale de confirmation obligatoire avant toute décision sensible */}
      {decisionModal && (
        <Modal
          isOpen={Boolean(decisionModal)}
          onClose={() => setDecisionModal(null)}
          title={`Confirmation de décision : ${getPartnerRequestStatusLabel(
            decisionModal.targetStatus
          )}`}
        >
          <div className="space-y-4 text-xs" data-testid="admin-decision-modal">
            <div className="rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] p-3.5 space-y-1">
              <p className="font-bold text-[#203454]">
                Organisme : {decisionModal.request.officialName}
              </p>
              <p className="text-[#69768C]">
                Représentant : {decisionModal.request.representativeName} (
                {decisionModal.request.professionalEmail})
              </p>
            </div>

            {decisionModal.targetStatus === 'APPROVED' && (
              <div className="rounded-xl border border-[#A7E3C9] bg-[#DDF5EB]/60 p-3 text-[#14533C]">
                <strong>Action sensible :</strong> L’approbation créera le profil organisme vérifié et accordera la permission{' '}
                <code className="font-mono font-bold">ORGANIZATION</code> au compte de{' '}
                <strong>{decisionModal.request.applicantFullName}</strong>, lui permettant de basculer entre son Espace Étudiant et son Espace Organisme.
              </div>
            )}

            {decisionError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3 text-[#9E2A2A]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{decisionError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-decision-note"
                className="block font-bold text-[#203454] mb-1.5"
              >
                {decisionModal.targetStatus === 'REJECTED'
                  ? 'Justification obligatoire du refus *'
                  : decisionModal.targetStatus === 'MORE_INFO_REQUIRED'
                  ? 'Précisez les documents ou informations complémentaires attendus *'
                  : 'Note de décision / Commentaire d’audit'}
              </label>
              <textarea
                id="admin-decision-note"
                rows={3}
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Saisissez le motif ou les instructions destinées au représentant..."
                className="w-full rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] p-3 text-xs text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E6ECF5]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDecisionModal(null)}
              >
                Annuler
              </Button>
              <Button
                variant={
                  decisionModal.targetStatus === 'REJECTED'
                    ? 'danger'
                    : 'primary'
                }
                size="sm"
                onClick={handleConfirmDecision}
              >
                Confirmer la décision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/**
 * 4. SUPERVISION PROGRAMMES (/admin/programmes & /admin/bourses)
 * Inclut les fonctionnalités OpenAPI 1.1 :
 * - Création manuelle d'un brouillon de bourse (POST /admin/scholarships -> DRAFT)
 * - Pré-remplissage assisté par Gemini via le backend Spring AI (POST /admin/ai/scholarships/extract)
 * - Cycle éditorial complet : DRAFT -> PENDING_REVIEW -> PUBLISHED -> ARCHIVED
 * - Supervision des collectes automatisées (GET /admin/ingestion/jobs)
 */
export const AdminProgramsPage: React.FC = () => {
  const {
    scholarships,
    adminDrafts = [],
    ingestionJobs = [],
    curateScholarship,
    createAdminScholarshipDraft,
    updateAdminScholarshipDraft,
    submitAdminDraftForReview,
    publishAdminScholarshipDraft,
    archiveAdminScholarship,
  } = useApp();

  // États pour la création manuelle d'un brouillon
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualOrgName, setManualOrgName] = useState('');
  const [manualCountry, setManualCountry] = useState('Canada');
  const [manualFunding, setManualFunding] = useState<FundingType>(
    'Bourse complète (Frais + Vie + Transport)'
  );
  const [manualDeadline, setManualDeadline] = useState('2026-11-30');
  const [manualSourceUrl, setManualSourceUrl] = useState('');
  const [manualRequiredDiploma, setManualRequiredDiploma] =
    useState<AcademicLevel>('Licence');
  const [manualTargetLevel, setManualTargetLevel] =
    useState<AcademicLevel>('Master');
  const [manualDomain, setManualDomain] = useState<StudyDomain>(
    'Informatique & Systèmes'
  );
  const [manualMinGrade, setManualMinGrade] = useState('14');
  const [editorialFeedback, setEditorialFeedback] = useState<string | null>(
    null
  );

  // États pour l'édition d'un brouillon existant
  const [editingDraft, setEditingDraft] = useState<ScholarshipDraft | null>(
    null
  );
  const [editTitle, setEditTitle] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // États pour l'extraction assistée par IA (Spring AI + Gemini côté backend)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSourceUrl, setAiSourceUrl] = useState(
    'https://www.daad.de/en/study-and-research-in-germany/scholarships/epos-2027'
  );
  const [aiRawText, setAiRawText] = useState(
    'Appel à candidatures DAAD EPOS 2026-2027 — Bourses de Master et Doctorat en Allemagne pour étudiants des pays en développement (dont le Cameroun). Financement complet : 934 EUR/mois + assurance + billet. Diplôme requis : Licence ou Master avec moyenne minimale 14/20. Date limite : 31 octobre 2026.'
  );
  const [aiResult, setAiResult] = useState<AiExtractionResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Champs modifiables après extraction IA avant sauvegarde en DRAFT
  const [aiReviewedTitle, setAiReviewedTitle] = useState('');
  const [aiReviewedOrg, setAiReviewedOrg] = useState('');
  const [aiReviewedCountry, setAiReviewedCountry] = useState('');
  const [aiReviewedDeadline, setAiReviewedDeadline] = useState('');
  const [aiReviewedUrl, setAiReviewedUrl] = useState('');

  const handleCreateManualDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualOrgName.trim()) return;

    const draft = createAdminScholarshipDraft({
      title: manualTitle.trim(),
      issuerOrganizationName: manualOrgName.trim(),
      sourceName: manualOrgName.trim(),
      hostCountry: manualCountry.trim() || 'International',
      fundingType: manualFunding,
      deadline: manualDeadline,
      sourceUrl: manualSourceUrl.trim(),
      acquisitionChannel: 'ADMIN_MANUAL',
      criteria: {
        eligibleNationalities: ['Cameroun', 'Sénégal', 'Côte d’Ivoire'],
        requiredResidenceCountries: ['Tous'],
        requiredDiplomaObtained: [manualRequiredDiploma],
        allowedCurrentLevels: [manualRequiredDiploma, manualTargetLevel],
        targetStudyLevels: [manualTargetLevel],
        eligibleDomains: [manualDomain],
        minGradeOut20: parseFloat(manualMinGrade) || 12,
        maxAge: 35,
        requiredLanguage: 'Français',
        minLanguageLevel: 'B2',
        requiresLanguageCertification: false,
        specificConditions: [],
        preferentialCriteria: [],
      },
    });
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualOrgName('');
    setManualSourceUrl('');
    setEditorialFeedback(
      `Brouillon manuel « ${draft.title} » créé avec le statut DRAFT. Il ne sera visible dans le catalogue public qu’après validation et publication.`
    );
  };

  const handleRunAiExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const result = await adminApiService.extractScholarshipWithGemini({
        sourceUrl: aiSourceUrl.trim() || undefined,
        sourceText: aiRawText.trim() || undefined,
      });
      setAiResult(result);
      setAiReviewedTitle(result.draft.title || '');
      setAiReviewedOrg(result.draft.issuerOrganizationName || '');
      setAiReviewedCountry(result.draft.hostCountry || '');
      setAiReviewedDeadline(result.draft.deadline || '2026-10-31');
      setAiReviewedUrl(result.draft.sourceUrl || aiSourceUrl.trim());
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiReviewedDraft = () => {
    if (!aiResult) return;
    const orgLabel =
      aiReviewedOrg.trim() ||
      aiResult.draft.issuerOrganizationName ||
      'Organisme extrait';
    const saved = createAdminScholarshipDraft({
      title:
        aiReviewedTitle.trim() ||
        aiResult.draft.title ||
        'Bourse extraite avec assistance IA',
      issuerOrganizationName: orgLabel,
      sourceName: `${orgLabel} (Portail officiel)`,
      hostCountry:
        aiReviewedCountry.trim() ||
        aiResult.draft.hostCountry ||
        'International',
      fundingType:
        aiResult.draft.fundingType ||
        'Bourse complète (Frais + Vie + Transport)',
      deadline: aiReviewedDeadline || aiResult.draft.deadline || '2026-10-31',
      sourceUrl: aiReviewedUrl.trim(),
      description: aiResult.draft.description,
      financialSummary: aiResult.draft.financialSummary,
      criteria: aiResult.draft.criteria,
      acquisitionChannel: 'ADMIN_MANUAL',
    });
    setIsAiModalOpen(false);
    setAiResult(null);
    setEditorialFeedback(
      `Brouillon assisté par IA « ${saved.title} » enregistré en statut DRAFT après relecture humaine.`
    );
  };

  const openEditDraftModal = (draft: ScholarshipDraft) => {
    setEditingDraft(draft);
    setEditTitle(draft.title);
    setEditSourceUrl(draft.sourceUrl);
    setEditDeadline(draft.deadline);
  };

  const handleSaveEditedDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;
    updateAdminScholarshipDraft(editingDraft.id, {
      title: editTitle.trim() || editingDraft.title,
      sourceUrl: editSourceUrl.trim(),
      deadline: editDeadline || editingDraft.deadline,
    });
    setEditorialFeedback(
      `Brouillon « ${editTitle || editingDraft.title} » mis à jour.`
    );
    setEditingDraft(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="SUPERVISION DU CATALOGUE & CYCLE ÉDITORIAL (OPENAPI 1.1)"
        title="Contrôle global des programmes de bourses"
        subtitle="Créez des brouillons manuels ou assistés par IA (Spring AI / Gemini côté serveur), validez les sources officielles et gérez le cycle DRAFT → PENDING_REVIEW → PUBLISHED → ARCHIVED."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
            >
              Importer avec assistance IA (Gemini Backend)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
            >
              + Nouveau brouillon manuel
            </Button>
          </div>
        }
      />

      {editorialFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#DDF5EB] border border-[#14533C]/20 text-xs font-semibold text-[#14533C] flex items-center justify-between gap-3">
          <span>{editorialFeedback}</span>
          <button
            type="button"
            onClick={() => setEditorialFeedback(null)}
            className="underline cursor-pointer shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 1. CYCLE ÉDITORIAL DES BROUILLONS (/admin/scholarships) */}
      <Panel
        title={`Brouillons & Cycle éditorial (${adminDrafts.length})`}
        subtitle="Conformément au contrat OpenAPI 1.1, aucune bourse créée ou extraite n’est publiée automatiquement sans vérification humaine."
      >
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {adminDrafts.map((draft) => (
            <div key={draft.id} className="py-4 space-y-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#203454]">
                      {draft.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#3457D5]/10 text-[#3457D5]">
                      Publication : {draft.publicationStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#F8FAFD] border border-[#E6ECF5] text-[#69768C]">
                      Canal : {draft.acquisitionChannel}
                    </span>
                  </div>
                  <div className="text-[#69768C] mt-1">
                    Émetteur : <strong>{draft.issuerOrganizationName}</strong> ·
                    Pays : <strong>{draft.hostCountry}</strong> · Date limite :{' '}
                    <strong>{draft.deadline}</strong>
                  </div>
                  <div className="text-[#69768C] mt-0.5">
                    URL source officielle :{' '}
                    {draft.sourceUrl ? (
                      <span className="font-mono text-[#203454]">
                        {draft.sourceUrl}
                      </span>
                    ) : (
                      <span className="text-[#B42318] font-semibold">
                        Non renseignée (bloquante pour publication)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditDraftModal(draft)}
                  >
                    Modifier le brouillon
                  </Button>
                  {draft.publicationStatus === 'DRAFT' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        submitAdminDraftForReview(draft.id);
                        setEditorialFeedback(
                          `Brouillon « ${draft.title} » soumis en file de curation (PENDING_REVIEW).`
                        );
                      }}
                    >
                      Soumettre à validation
                    </Button>
                  )}
                  {draft.publicationStatus !== 'PUBLISHED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (draft.missingPublicationFields.length > 0) {
                          setEditorialFeedback(
                            `Publication refusée : champs obligatoires manquants (${draft.missingPublicationFields.join(', ')}).`
                          );
                          return;
                        }
                        publishAdminScholarshipDraft(
                          draft.id,
                          'Publication éditoriale vérifiée.'
                        );
                        setEditorialFeedback(
                          `L’offre « ${draft.title} » est désormais certifiée et publiée (PUBLISHED) dans le catalogue public.`
                        );
                      }}
                    >
                      Publier l’offre vérifiée
                    </Button>
                  )}
                  {draft.publicationStatus !== 'ARCHIVED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        archiveAdminScholarship(draft.id);
                        setEditorialFeedback(
                          `Brouillon « ${draft.title} » archivé (ARCHIVED).`
                        );
                      }}
                    >
                      Archiver
                    </Button>
                  )}
                </div>
              </div>

              {draft.missingPublicationFields.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#F5A17B]/20 border border-[#F5A17B]/40 text-[#9A3412] text-[11px]">
                  <strong>Champs requis avant publication :</strong>{' '}
                  {draft.missingPublicationFields.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* 2. SUPERVISION DES COLLECTES AUTOMATISÉES (/admin/ingestion/jobs) */}
      <Panel
        title="Supervision des collectes automatisées (/admin/ingestion/jobs)"
        subtitle="Conformément au contrat OpenAPI 1.1, la collecte automatisée est exécutée uniquement côté backend Spring Boot et crée des brouillons soumis à curation."
      >
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {ingestionJobs.map((job) => (
            <div key={job.jobId} className="py-3 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-[#203454]">
                  Job <span className="font-mono">{job.jobId}</span> · Initiateur
                  : <span>{job.requestedBy}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#DDF5EB] text-[#14533C]">
                  Statut : {job.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#253047] pt-1">
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E6ECF5]">
                  Annonces analysées :{' '}
                  <strong className="tabular-nums">{job.scannedCount}</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E6ECF5]">
                  Brouillons créés :{' '}
                  <strong className="tabular-nums text-[#3457D5]">
                    {job.importedDraftCount}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E6ECF5]">
                  Doublons écartés :{' '}
                  <strong className="tabular-nums">{job.duplicateCount}</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E6ECF5]">
                  Échecs :{' '}
                  <strong className="tabular-nums">{job.failedCount}</strong>
                </div>
              </div>
              {job.warnings.map((w, i) => (
                <div key={i} className="text-[11px] text-[#9A421D]">
                  Avertissement : {w}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Panel>

      {/* 3. CATALOGUE ACTUEL & INTERVENTION DIRECTE */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#203454]">
          Bourses enregistrées dans le catalogue ({scholarships.length})
        </h2>
        {scholarships.map((sch) => (
          <Panel
            key={sch.id}
            title={sch.title}
            subtitle={`Code : ${sch.code} · Émetteur : ${sch.organizationName} · Publication : ${sch.publicationStatus || 'PUBLISHED'}`}
            headerRight={
              <CurationReliabilityNote
                status={sch.curationStatus}
                lastVerifiedAt={sch.lastVerifiedAt}
                isDemoData={sch.isDemoData}
              />
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>
                Échéance : <strong>{sch.deadline}</strong> · Statut disponibilité
                : <strong>{sch.status}</strong> · Canal :{' '}
                <strong>{sch.acquisitionChannel || 'ADMIN_MANUAL'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    curateScholarship(
                      sch.id,
                      'VERIFIED',
                      undefined,
                      'Validation administrative directe.'
                    )
                  }
                >
                  Certifier
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => archiveAdminScholarship(sch.id)}
                >
                  Archiver l’offre
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* MODALE 1 : CRÉATION MANUELLE D'UN BROUILLON (POST /admin/scholarships) */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Créer un brouillon de bourse (POST /admin/scholarships)"
      >
        <form onSubmit={handleCreateManualDraft} className="space-y-3 text-xs">
          <p className="text-[#69768C]">
            La bourse sera enregistrée en statut <strong>DRAFT</strong>. Elle ne sera visible par les étudiants qu’après validation et publication.
          </p>
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              Intitulé officiel de la bourse *
            </label>
            <input
              type="text"
              required
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Ex: Bourse d’Excellence Francophonie 2026-2027"
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Organisme émetteur *
              </label>
              <input
                type="text"
                required
                value={manualOrgName}
                onChange={(e) => setManualOrgName(e.target.value)}
                placeholder="Ex: AUF / Gouvernement du Canada"
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Pays d’accueil *
              </label>
              <input
                type="text"
                required
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Type de financement
              </label>
              <select
                value={manualFunding}
                onChange={(e) =>
                  setManualFunding(e.target.value as FundingType)
                }
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                {FUNDING_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Date limite *
              </label>
              <input
                type="date"
                required
                value={manualDeadline}
                onChange={(e) => setManualDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Diplôme requis
              </label>
              <select
                value={manualRequiredDiploma}
                onChange={(e) =>
                  setManualRequiredDiploma(e.target.value as AcademicLevel)
                }
                className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Formation financée
              </label>
              <select
                value={manualTargetLevel}
                onChange={(e) =>
                  setManualTargetLevel(e.target.value as AcademicLevel)
                }
                className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Moyenne min (/20)
              </label>
              <input
                type="number"
                step="0.5"
                value={manualMinGrade}
                onChange={(e) => setManualMinGrade(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              Domaine d’études éligible
            </label>
            <select
              value={manualDomain}
              onChange={(e) => setManualDomain(e.target.value as StudyDomain)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            >
              {STUDY_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              URL de la source officielle (peut être complétée avant publication)
            </label>
            <input
              type="url"
              value={manualSourceUrl}
              onChange={(e) => setManualSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsManualModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Enregistrer en brouillon (DRAFT)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODALE 2 : ÉDITION D'UN BROUILLON (PATCH /admin/scholarships/{id}) */}
      <Modal
        isOpen={Boolean(editingDraft)}
        onClose={() => setEditingDraft(null)}
        title="Modifier le brouillon (PATCH /admin/scholarships/{id})"
      >
        <form onSubmit={handleSaveEditedDraft} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              Intitulé de la bourse
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              URL de la source officielle (requise pour publier)
            </label>
            <input
              type="url"
              value={editSourceUrl}
              onChange={(e) => setEditSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#203454] mb-1">
              Date limite de candidature
            </label>
            <input
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditingDraft(null)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Mettre à jour le brouillon
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODALE 3 : EXTRACTION ASSISTÉE PAR GEMINI VIA BACKEND SPRING AI */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Pré-remplissage assisté par IA (POST /admin/ai/scholarships/extract)"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E6ECF5] text-[#253047]">
            <strong>Architecture de sécurité :</strong> Aucune clé Gemini n’est
            exposée dans le navigateur. En production, cet appel est traité par{' '}
            <code>Spring AI + Gemini</code> sur le backend Java Spring Boot. En
            mode démonstration (Mock), la structuration est simulée localement et
            soumise à votre relecture avant création du brouillon{' '}
            <strong>DRAFT</strong>.
          </div>

          <form onSubmit={handleRunAiExtraction} className="space-y-3">
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                URL de l’annonce officielle (sourceUrl)
              </label>
              <input
                type="url"
                value={aiSourceUrl}
                onChange={(e) => setAiSourceUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#203454] mb-1">
                Texte brut de l’appel à candidatures (rawAnnouncementText)
              </label>
              <textarea
                rows={3}
                value={aiRawText}
                onChange={(e) => setAiRawText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" size="sm">
                {aiLoading
                  ? 'Analyse en cours...'
                  : 'Analyser et pré-remplir les champs'}
              </Button>
            </div>
          </form>

          {aiResult && (
            <div className="pt-3 border-t border-[#E6ECF5] space-y-3">
              <div className="font-bold text-[#203454]">
                Résultat pré-rempli ({aiResult.model}) — Vérifiez et corrigez
                avant création du brouillon :
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-[#69768C] mb-1">
                    Intitulé extrait
                  </label>
                  <input
                    type="text"
                    value={aiReviewedTitle}
                    onChange={(e) => setAiReviewedTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#69768C] mb-1">
                    Organisme émetteur
                  </label>
                  <input
                    type="text"
                    value={aiReviewedOrg}
                    onChange={(e) => setAiReviewedOrg(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#69768C] mb-1">
                    Pays d’accueil
                  </label>
                  <input
                    type="text"
                    value={aiReviewedCountry}
                    onChange={(e) => setAiReviewedCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#69768C] mb-1">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={aiReviewedDeadline}
                    onChange={(e) => setAiReviewedDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#69768C] mb-1">
                  URL officielle vérifiée
                </label>
                <input
                  type="url"
                  value={aiReviewedUrl}
                  onChange={(e) => setAiReviewedUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg font-mono"
                />
              </div>

              {/* Preuves extraites (AiExtractionEvidence) */}
              <div className="space-y-1.5">
                <div className="font-semibold text-[#203454]">
                  Extraits justificatifs détectés (evidence) :
                </div>
                {aiResult.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#F8FAFD] border border-[#E6ECF5] flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div>
                      <strong className="text-[#203454]">{ev.field} :</strong>{' '}
                      <span className="text-[#69768C]">« {ev.excerpt} »</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#3457D5]/10 text-[#3457D5] font-bold">
                      Confiance : {ev.confidenceLabel}
                    </span>
                  </div>
                ))}
              </div>

              {aiResult.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-[#F5A17B]/20 text-[#9A3412] text-[11px]"
                >
                  Avertissement IA : {w}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAiModalOpen(false)}
                >
                  Fermer
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAiReviewedDraft}
                >
                  Créer le brouillon à vérifier (DRAFT)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export const AdminSubscriptionsPage: React.FC = () => {
  const {
    subscriptions,
    subscriptionRequests = [],
    decideSubscriptionRequest,
  } = useApp();

  const totalMonthlySimulated = subscriptions
    .filter((s) => s.status === 'ACTIF_SIMULE')
    .reduce((acc, s) => acc + s.amountFcfa, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="PILOTAGE COMMERCIAL B2B2C (SIMULATION)"
        title="Suivi des abonnements et campagnes ponctuelles"
        subtitle="Rappel : L’accès étudiant est 100 % gratuit. Les revenus simulés ci-dessous proviennent exclusivement des formules souscrites par les organismes."
      />

      {/* Demandes de souscription OpenAPI 1.1 (/admin/subscription-requests/{requestId}/decide) */}
      <Panel
        title={`Demandes de souscription d’organismes (${subscriptionRequests.length})`}
        subtitle="Validez ou rejetez les demandes de changement de formule envoyées via POST /organizations/me/subscription/requests."
      >
        {subscriptionRequests.length === 0 ? (
          <p className="text-xs text-[#69768C]">
            Aucune demande de souscription en attente.
          </p>
        ) : (
          <div className="divide-y divide-[#E6ECF5] text-xs">
            {subscriptionRequests.map((req) => (
              <div
                key={req.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-[#203454]">
                    {req.organizationName || req.organizationId} — Formule
                    demandée :{' '}
                    <span className="text-[#3457D5]">{req.requestedPlan}</span>
                  </div>
                  <div className="text-[#69768C] mt-0.5">
                    Demandée le {req.requestedAt} · Statut :{' '}
                    <strong>{req.status}</strong>
                    {req.requestNote ? ` · Note : ${req.requestNote}` : ''}
                  </div>
                </div>
                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        decideSubscriptionRequest(
                          req.id,
                          true,
                          'Activation administrative simulée.'
                        )
                      }
                    >
                      Approuver (Simulation)
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        decideSubscriptionRequest(
                          req.id,
                          false,
                          'Rejet administratif.'
                        )
                      }
                    >
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Synthèse des souscriptions simulées"
        subtitle={`Volume total actif simulé : ${totalMonthlySimulated.toLocaleString('fr-FR')} FCFA`}
      >
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="py-3 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-[#203454]">
                  {sub.organizationName}
                </div>
                <div className="text-[#69768C]">
                  Formule : <strong>{sub.planName}</strong> ({sub.billingCycle})
                </div>
              </div>
              <div className="font-mono tabular-nums text-right">
                <div className="font-semibold text-[#253047]">
                  {sub.amountFcfa.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[#14533C]">{sub.status}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="CONFORMITÉ & TRAÇABILITÉ"
        title="Journaux d’audit de la plateforme"
        subtitle="Historique horodaté des décisions d’accréditation, de curation, d’attribution et de consentement (Loi n° 2024/017)."
      />

      <Panel noPadding>
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-[#203454]">
                  [{log.actionType}] {log.targetLabel}
                </div>
                <div className="text-[#253047]">{log.details}</div>
              </div>
              <div className="text-[#69768C] font-mono tabular-nums shrink-0">
                {log.timestamp} · {log.actorName} ({log.actorRole})
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const {
    resetDemoData,
    apiConfig,
    setApiMode,
    fallbackToMockMode,
  } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="CONFIGURATION TECHNIQUE & CONFORMITÉ"
        title="Paramètres de la plateforme"
        subtitle="Préparation à la connexion vers l’API REST Java Spring Boot / PostgreSQL selon le contrat OpenAPI 1.1."
      />

      {/* Panneau de pilotage du mode API (Mock vs Real Spring Boot) */}
      <Panel
        title="Mode d’intégration API (Contrat OpenAPI 1.1.0)"
        subtitle="Basculez entre le mode Démonstration (Mock local par défaut) et le futur serveur Java Spring Boot, avec retour immédiat en 1 clic."
      >
        <div className="space-y-4 text-xs text-[#253047]">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E6ECF5]">
            <div>
              <div className="font-bold text-[#203454]">
                Mode actif :{' '}
                <span className="px-2 py-0.5 rounded bg-[#3457D5]/10 text-[#3457D5] font-mono">
                  {apiConfig.mode === 'mock'
                    ? 'mock (Données de démonstration locales)'
                    : 'real (API REST Spring Boot)'}
                </span>
              </div>
              <div className="text-[#69768C] mt-1">
                URL cible configurée :{' '}
                <code className="font-mono text-[#203454]">
                  {apiConfig.baseUrl}
                </code>{' '}
                (aucun appel silencieux vers la production tant que le backend
                n’est pas démarré).
              </div>
            </div>
            <div className="flex items-center gap-2">
              {apiConfig.mode !== 'mock' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={fallbackToMockMode}
                >
                  Revenir au mode Démonstration (Mock)
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setApiMode('real')}
                >
                  Tester le mode API réel (localhost:8080)
                </Button>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Environnement de démonstration et stockage local"
        subtitle="Séparation claire entre la simulation frontend et la sécurité backend"
      >
        <div className="space-y-4 text-xs text-[#253047] leading-relaxed">
          <p>
            Cette application frontend fonctionne actuellement avec une couche
            de services locale persistée afin de permettre le test complet des 4
            espaces utilisateurs sans serveur externe.
          </p>
          <p>
            En production, l’authentification JWT, le chiffrement des données à
            caractère personnel (Loi camerounaise n° 2024/017 du 23 décembre
            2024) et le moteur de règles seront exécutés côté serveur sous{' '}
            <strong>Java 21 + Spring Boot 3 + PostgreSQL</strong>.
          </p>
          <div>
            <Button variant="danger" size="sm" onClick={resetDemoData}>
              Réinitialiser toutes les données de démonstration
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

