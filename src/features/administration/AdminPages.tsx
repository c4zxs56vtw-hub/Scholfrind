import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  CurationReliabilityNote,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

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
 * 3. GESTION DES ORGANISMES (/admin/organismes)
 */
export const AdminOrganizationsPage: React.FC = () => {
  const { organizations, verifyOrganizationAccount } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="VÉRIFICATION INSTITUTIONNELLE"
        title="Gestion et accréditation des organismes"
        subtitle="Examinez les structures inscrites, approuvez leur vérification pour débloquer la recherche de candidats volontaires ou suspendez un compte."
      />

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
    </div>
  );
};

/**
 * 4. SUPERVISION PROGRAMMES (/admin/programmes), ABONNEMENTS (/admin/abonnements), AUDIT (/admin/audit) & PARAMÈTRES (/admin/parametres)
 */
export const AdminProgramsPage: React.FC = () => {
  const { scholarships, curateScholarship } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="SUPERVISION DU CATALOGUE"
        title="Contrôle global des programmes de bourses"
        subtitle="Supervisez l’ensemble des publications et intervenez en cas de signalement."
      />

      <div className="space-y-3">
        {scholarships.map((sch) => (
          <Panel
            key={sch.id}
            title={sch.title}
            subtitle={`Code : ${sch.code} · Émetteur : ${sch.organizationName}`}
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
                Échéance : <strong>{sch.deadline}</strong> · Statut :{' '}
                <strong>{sch.status}</strong>
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
                  onClick={() =>
                    curateScholarship(
                      sch.id,
                      'ARCHIVED',
                      undefined,
                      'Retrait administratif de l’annonce.'
                    )
                  }
                >
                  Archiver l’offre
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

export const AdminSubscriptionsPage: React.FC = () => {
  const { subscriptions } = useApp();

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
  const { resetDemoData } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="CONFIGURATION TECHNIQUE & CONFORMITÉ"
        title="Paramètres de la plateforme"
        subtitle="Préparation à la connexion vers l’API REST Java Spring Boot / PostgreSQL."
      />

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
