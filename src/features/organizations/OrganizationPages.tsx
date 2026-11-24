import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  Lock,
  MailOpen,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ACADEMIC_LEVELS,
  FUNDING_TYPES,
  STUDY_DOMAINS,
} from '../../data/mockData';
import {
  AcademicTriptych,
  Button,
  Modal,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import {
  AcademicLevel,
  ApplicationStatus,
  FundingType,
  PlanTierId,
  Scholarship,
  StudyDomain,
} from '../../types';

/**
 * 1. TABLEAU DE BORD ORGANISME FINANCEUR (/organisme/tableau-de-bord)
 */
export const OrganizationDashboardPage: React.FC = () => {
  const {
    currentOrganization,
    scholarships,
    applications,
    invitations,
  } = useApp();
  const navigate = useNavigate();

  const orgScholarships = scholarships.filter(
    (s) => s.organizationId === currentOrganization.id
  );
  const orgApplications = applications.filter(
    (a) => a.organizationId === currentOrganization.id
  );
  const orgInvitations = invitations.filter(
    (i) => i.organizationId === currentOrganization.id
  );

  const activeProgramsCount = orgScholarships.filter(
    (s) => s.status !== 'EXPIRED'
  ).length;
  const inReviewCount = orgApplications.filter(
    (a) =>
      a.status === 'Candidature reçue' ||
      a.status === 'En cours d’examen' ||
      a.status === 'Informations complémentaires demandées' ||
      a.status === 'Présélectionnée'
  ).length;
  const decisionsCount = orgApplications.filter(
    (a) => a.status === 'Retenue' || a.status === 'Non retenue'
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* SECTION 1 — ACCUEIL ORGANISME */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
            Bonjour, {currentOrganization.officialName}
          </h1>
          <p className="text-sm text-[#69768C] mt-1">
            Pilotez vos programmes de bourses et invitez des candidats éligibles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => navigate('/organisme/recherche-candidats')}
          >
            Rechercher des candidats
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/organisme/creer-campagne')}
          >
            + Créer une bourse
          </Button>
        </div>
      </section>

      {/* Statut de vérification discret */}
      {!currentOrganization.isVerified ? (
        <div className="bg-[#F5A17B]/15 border border-[#F5A17B]/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#9A421D] shrink-0" />
            <div className="text-[#253047]">
              <strong>Vérification en attente :</strong> Complétez votre profil pour débloquer la recherche de candidats volontaires.
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/organisme/profil')}
          >
            Compléter
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#E6ECF5] rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#14533C] font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DDF5EB] text-[#14533C]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Organisme vérifié
            </span>
            <span className="text-[#69768C] font-normal">
              N° {currentOrganization.registrationNumber}
            </span>
          </div>
          <div className="text-[#69768C]">
            Formule :{' '}
            <strong className="text-[#203454]">
              {currentOrganization.activePlan}
            </strong>{' '}
            ·{' '}
            <Link
              to="/organisme/abonnement"
              className="font-semibold text-[#3457D5] hover:underline"
            >
              Gérer l’abonnement →
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 2 — ACTIVITÉ EN UN COUP D'ŒIL */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#203454]">Votre activité</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/organisme/programmes"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
          >
            <div className="text-xs text-[#69768C]">Bourses actives</div>
            <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
              {activeProgramsCount}
            </div>
          </Link>
          <Link
            to="/organisme/candidatures"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
          >
            <div className="text-xs text-[#69768C]">Candidatures</div>
            <div className="text-2xl font-bold text-[#203454] tabular-nums mt-1">
              {orgApplications.length}
            </div>
          </Link>
          <Link
            to="/organisme/invitations"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
          >
            <div className="text-xs text-[#69768C]">Invitations</div>
            <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
              {orgInvitations.length}
            </div>
          </Link>
          <Link
            to="/organisme/evaluations"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
          >
            <div className="text-xs text-[#69768C]">En évaluation</div>
            <div className="text-2xl font-bold text-[#9A421D] tabular-nums mt-1">
              {inReviewCount}
            </div>
          </Link>
          <Link
            to="/organisme/decisions"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
          >
            <div className="text-xs text-[#69768C]">Décisions</div>
            <div className="text-2xl font-bold text-[#14533C] tabular-nums mt-1">
              {decisionsCount}
            </div>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Programmes de bourses actifs */}
        <div className="lg:col-span-7">
          <Panel
            title="Vos programmes de bourses"
            subtitle="Campagnes publiées et dates limites"
            headerRight={
              <Link
                to="/organisme/programmes"
                className="text-xs font-semibold text-[#3457D5] hover:underline"
              >
                Tout voir →
              </Link>
            }
            noPadding
          >
            <div className="divide-y divide-[#E6ECF5] text-xs">
              {orgScholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[#203454] text-sm">
                      {sch.title}
                    </div>
                    <div className="text-[#69768C]">
                      Niveau financé :{' '}
                      <strong className="text-[#253047]">
                        {sch.criteria.targetStudyLevels.join(' / ')}
                      </strong>{' '}
                      · Échéance :{' '}
                      <span className="tabular-nums font-semibold text-[#253047]">
                        {sch.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/bourses/${sch.id}`)}
                    >
                      Découvrir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Derniers dossiers de candidature */}
        <div className="lg:col-span-5">
          <Panel
            title="Candidatures récentes"
            subtitle="Derniers dossiers transmis"
            headerRight={
              <Link
                to="/organisme/candidatures"
                className="text-xs font-semibold text-[#3457D5] hover:underline"
              >
                Ouvrir →
              </Link>
            }
            noPadding
          >
            <div className="divide-y divide-[#E6ECF5] text-xs">
              {orgApplications.map((app) => (
                <div key={app.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#253047]">
                      {app.studentName}{' '}
                      <span className="text-[#69768C] font-mono">
                        ({app.referenceCode})
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#3457D5]/10 text-[#203454] font-semibold text-[11px]">
                      {app.status}
                    </span>
                  </div>
                  <div className="text-[#69768C]">
                    Obtenu : {app.studentHighestDiploma} · Visé :{' '}
                    {app.studentTargetLevel} · Moyenne :{' '}
                    <strong className="font-mono tabular-nums">
                      {app.studentGradeOut20}/20
                    </strong>
                  </div>
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
 * 2. PROFIL INSTITUTIONNEL (/organisme/profil)
 */
export const OrganizationProfilePage: React.FC = () => {
  const { currentOrganization, updateOrganizationProfile } = useApp();

  const [officialName, setOfficialName] = useState(
    currentOrganization.officialName
  );
  const [type, setType] = useState(currentOrganization.type);
  const [country, setCountry] = useState(currentOrganization.country);
  const [address, setAddress] = useState(currentOrganization.address);
  const [website, setWebsite] = useState(currentOrganization.website);
  const [contactEmail, setContactEmail] = useState(
    currentOrganization.contactEmail
  );
  const [contactPersonName, setContactPersonName] = useState(
    currentOrganization.contactPersonName
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    currentOrganization.registrationNumber
  );
  const [description, setDescription] = useState(
    currentOrganization.description
  );

  React.useEffect(() => {
    setOfficialName(currentOrganization.officialName);
    setType(currentOrganization.type);
    setCountry(currentOrganization.country);
    setAddress(currentOrganization.address);
    setWebsite(currentOrganization.website);
    setContactEmail(currentOrganization.contactEmail);
    setContactPersonName(currentOrganization.contactPersonName);
    setRegistrationNumber(currentOrganization.registrationNumber);
    setDescription(currentOrganization.description);
  }, [currentOrganization.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationProfile(currentOrganization.id, {
      officialName,
      type,
      country,
      address,
      website,
      contactEmail,
      contactPersonName,
      registrationNumber,
      description,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="IDENTITÉ & ACCRÉDITATION INSTITUTIONNELLE"
        title="Profil institutionnel de l’organisme"
        subtitle="Ces informations sont vérifiées par l’administrateur de SCHOLARFIND avant d’autoriser la recherche de candidats volontaires."
      />

      <Panel
        title="Informations officielles de la structure"
        subtitle={`Statut actuel : ${
          currentOrganization.isVerified
            ? 'Organisme vérifié et accrédité'
            : 'En attente de vérification administrative'
        }`}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="org-name"
                className="block font-medium text-[#253047] mb-1"
              >
                Nom officiel de l’organisme *
              </label>
              <input
                id="org-name"
                type="text"
                value={officialName}
                onChange={(e) => setOfficialName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="org-type"
                className="block font-medium text-[#253047] mb-1"
              >
                Type d’organisation *
              </label>
              <select
                id="org-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                <option value="Université">Université / Grande École</option>
                <option value="Fondation">Fondation</option>
                <option value="Ministère">Ministère</option>
                <option value="Ambassade">Ambassade</option>
                <option value="Coopération internationale">
                  Organisme de coopération internationale
                </option>
                <option value="Entreprise">Entreprise</option>
                <option value="ONG">ONG</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="org-country"
                className="block font-medium text-[#253047] mb-1"
              >
                Pays du siège *
              </label>
              <input
                id="org-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="org-reg"
                className="block font-medium text-[#253047] mb-1"
              >
                Référence d’agrément / Immatriculation officielle *
              </label>
              <input
                id="org-reg"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="org-address"
                className="block font-medium text-[#253047] mb-1"
              >
                Adresse physique *
              </label>
              <input
                id="org-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="org-website"
                className="block font-medium text-[#253047] mb-1"
              >
                Site web officiel *
              </label>
              <input
                id="org-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="org-contact-name"
                className="block font-medium text-[#253047] mb-1"
              >
                Responsable référent *
              </label>
              <input
                id="org-contact-name"
                type="text"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="org-contact-email"
                className="block font-medium text-[#253047] mb-1"
              >
                Coordonnées e-mail professionnelles *
              </label>
              <input
                id="org-contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="org-desc"
              className="block font-medium text-[#253047] mb-1"
            >
              Présentation et vocation des programmes de financement *
            </label>
            <textarea
              id="org-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary">
              Enregistrer le profil institutionnel
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
};

/**
 * 3. MES PROGRAMMES (/organisme/programmes) & CRÉER UNE CAMPAGNE (/organisme/creer-campagne)
 */
export const OrganizationProgramsPage: React.FC = () => {
  const {
    currentOrganization,
    scholarships,
    createOrUpdateScholarship,
  } = useApp();
  const navigate = useNavigate();

  const myPrograms = scholarships.filter(
    (s) => s.organizationId === currentOrganization.id
  );

  const toggleCampaignStatus = (sch: Scholarship) => {
    const nextStatus = sch.status === 'EXPIRED' ? 'OPEN' : 'EXPIRED';
    createOrUpdateScholarship({ ...sch, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="GESTION DES CAMPAGNES DE BOURSES"
        title="Mes programmes de bourses"
        subtitle="Consultez, modifiez ou clôturez vos appels à candidatures."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/organisme/creer-campagne')}
          >
            + Nouvelle campagne de bourse
          </Button>
        }
      />

      <div className="space-y-4">
        {myPrograms.map((sch) => (
          <Panel
            key={sch.id}
            title={sch.title}
            subtitle={`Code : ${sch.code} · Pays : ${sch.hostCountry} · Échéance : ${sch.deadline}`}
            headerRight={
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                  sch.status === 'EXPIRED'
                    ? 'bg-[#B42318]/10 text-[#B42318] border-[#B42318]/30'
                    : 'bg-[#14533C]/10 text-[#14533C] border-[#14533C]/30'
                }`}
              >
                {sch.status === 'EXPIRED'
                  ? 'Campagne clôturée'
                  : 'Campagne ouverte'}
              </span>
            }
          >
            <div className="space-y-3 text-xs">
              <p className="text-[#69768C]">{sch.description}</p>
              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[#69768C] block">
                    Diplôme obtenu exigé
                  </span>
                  <strong>
                    {sch.criteria.requiredDiplomaObtained.join(', ')}
                  </strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">Niveau financé</span>
                  <strong>{sch.criteria.targetStudyLevels.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">Moyenne minimale</span>
                  <strong className="font-mono tabular-nums">
                    {sch.criteria.minGradeOut20
                      ? `${sch.criteria.minGradeOut20}/20`
                      : 'Non définie'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">Statut curation</span>
                  <strong>{sch.curationStatus}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <span className="text-[#69768C]">
                  Financement : <strong>{sch.financialSummary}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleCampaignStatus(sch)}
                  >
                    {sch.status === 'EXPIRED'
                      ? 'Rouvrir la campagne'
                      : 'Clôturer la campagne'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/bourses/${sch.id}`)}
                  >
                    Voir la fiche publique
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

export const CreateCampaignPage: React.FC = () => {
  const { currentOrganization, createOrUpdateScholarship } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [hostCountry, setHostCountry] = useState('France');
  const [fundingType, setFundingType] = useState<FundingType>(
    'Bourse complète (Frais + Vie + Transport)'
  );
  const [financialSummary, setFinancialSummary] = useState(
    '750 000 FCFA / mois + Frais de scolarité'
  );
  const [deadline, setDeadline] = useState('2027-06-15');
  const [requiredDiploma, setRequiredDiploma] =
    useState<AcademicLevel>('Licence');
  const [targetLevel, setTargetLevel] = useState<AcademicLevel>('Master');
  const [domain, setDomain] = useState<StudyDomain>('Informatique & Systèmes');
  const [minGrade, setMinGrade] = useState('14.0');
  const [maxAge, setMaxAge] = useState('28');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim()) {
      setError(
        'Veuillez renseigner l’intitulé officiel et la description du programme de bourse.'
      );
      return;
    }

    const newScholarship: Scholarship = {
      id: `sch-${Date.now()}`,
      code: `DEMO-CAMP-${Math.floor(100 + Math.random() * 900)}`,
      title: `${title} (Démo)`,
      organizationId: currentOrganization.id,
      organizationName: currentOrganization.officialName,
      organizationType: currentOrganization.type,
      hostCountry,
      fundingType,
      financialSummary,
      deadline,
      startDate: '2027-09-15',
      durationMonths: 24,
      slotsAvailable: 10,
      description: `[Programme fictif de démonstration] ${description}`,
      benefits: [
        financialSummary,
        'Accompagnement académique et suivi pédagogique',
      ],
      requiredDocuments: [
        `Copie certifiée du diplôme (${requiredDiploma})`,
        'Relevés de notes académiques',
        'Lettre de motivation',
      ],
      criteria: {
        eligibleNationalities: ['Cameroun', 'Toutes'],
        requiredResidenceCountries: ['Tous'],
        requiredDiplomaObtained: [requiredDiploma],
        targetStudyLevels: [targetLevel],
        eligibleDomains: [domain],
        minGradeOut20: minGrade ? parseFloat(minGrade) : null,
        maxAge: maxAge ? parseInt(maxAge, 10) : null,
        requiredLanguage: 'Français',
        minLanguageLevel: 'B2',
        requiresLanguageCertification: false,
        specificConditions: [
          'Campagne créée en démonstration depuis l’espace organisme.',
        ],
        preferentialCriteria: [],
      },
      isDemoData: true,
      sourceName: `${currentOrganization.officialName} (Soumission directe organisme)`,
      sourceUrl: currentOrganization.website,
      retrievedAt: '2026-11-24',
      lastVerifiedAt: null,
      curationStatus: 'PENDING_REVIEW',
      publicationStatus: 'PENDING_REVIEW',
      acquisitionChannel: 'ORGANIZATION_SUBMISSION',
      status: 'OPEN',
      modificationHistory: [
        {
          id: `mod-${Date.now()}`,
          date: '2026-11-24',
          actorName: currentOrganization.contactPersonName,
          actorRole: 'ORGANIZATION',
          summary:
            'Soumission de la campagne de bourse par l’organisme (en attente de validation par un curateur avant publication publique).',
        },
      ],
    };

    createOrUpdateScholarship(newScholarship);
    navigate('/organisme/programmes');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="PARAMÉTRAGE DES CRITÈRES D’ÉLIGIBILITÉ"
        title="Créer et publier une campagne de bourse"
        subtitle="Définissez précisément les prérequis (diplôme déjà obtenu vs formation financée, moyenne minimale, échéance) afin d’alimenter le moteur de vérification."
      />

      <Panel title="Caractéristiques du programme de financement">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] rounded font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="camp-title"
                className="block font-medium text-[#253047] mb-1"
              >
                Intitulé officiel du programme de bourse *
              </label>
              <input
                id="camp-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Bourse d’Excellence Ingénierie & Transition Énergétique 2027"
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="camp-country"
                className="block font-medium text-[#253047] mb-1"
              >
                Pays d’accueil de la formation *
              </label>
              <input
                id="camp-country"
                type="text"
                value={hostCountry}
                onChange={(e) => setHostCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="camp-deadline"
                className="block font-medium text-[#253047] mb-1"
              >
                Date limite de candidature *
              </label>
              <input
                id="camp-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="camp-req-diploma"
                className="block font-semibold text-[#203454] mb-1"
              >
                1. Diplôme déjà obtenu exigé *
              </label>
              <select
                id="camp-req-diploma"
                value={requiredDiploma}
                onChange={(e) =>
                  setRequiredDiploma(e.target.value as AcademicLevel)
                }
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="camp-target-level"
                className="block font-semibold text-[#3457D5] mb-1"
              >
                2. Niveau de formation financé par la bourse *
              </label>
              <select
                id="camp-target-level"
                value={targetLevel}
                onChange={(e) =>
                  setTargetLevel(e.target.value as AcademicLevel)
                }
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              >
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="camp-domain"
                className="block font-medium text-[#253047] mb-1"
              >
                Filière / Domaine académique éligible *
              </label>
              <select
                id="camp-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value as StudyDomain)}
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
              <label
                htmlFor="camp-mingrade"
                className="block font-medium text-[#253047] mb-1"
              >
                Moyenne académique minimale requise (sur 20)
              </label>
              <input
                id="camp-mingrade"
                type="number"
                step="0.5"
                value={minGrade}
                onChange={(e) => setMinGrade(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="camp-funding"
                className="block font-medium text-[#253047] mb-1"
              >
                Type de financement *
              </label>
              <select
                id="camp-funding"
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value as FundingType)}
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
              <label
                htmlFor="camp-financial"
                className="block font-medium text-[#253047] mb-1"
              >
                Montant / Résumé financier *
              </label>
              <input
                id="camp-financial"
                type="text"
                value={financialSummary}
                onChange={(e) => setFinancialSummary(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="camp-desc"
              className="block font-medium text-[#253047] mb-1"
            >
              Description détaillée du programme et objectifs *
            </label>
            <textarea
              id="camp-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les objectifs du programme, les établissements d’accueil et les attentes envers les boursiers..."
              className="w-full p-3 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/organisme/programmes')}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Publier la campagne de démonstration
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
};

/**
 * 4. RECHERCHER DES CANDIDATS VOLONTAIRES (/organisme/recherche-candidats)
 */
export const OrganizationCandidateSearchPage: React.FC = () => {
  const {
    currentOrganization,
    students,
    scholarships,
    sendInvitationToStudent,
  } = useApp();

  const [diplomaFilter, setDiplomaFilter] = useState('TOUS');
  const [targetLevelFilter, setTargetLevelFilter] = useState('TOUS');
  const [domainFilter, setDomainFilter] = useState('TOUS');
  const [minGradeFilter, setMinGradeFilter] = useState('0');

  const [invitingStudentId, setInvitingStudentId] = useState<string | null>(
    null
  );
  const orgScholarships = scholarships.filter(
    (s) => s.organizationId === currentOrganization.id
  );
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(
    orgScholarships[0]?.id || scholarships[0]?.id || 'sch-1'
  );
  const [invitationMessage, setInvitationMessage] = useState(
    'Bonjour, votre parcours académique correspond aux critères de notre campagne de bourse. Nous vous invitons à consulter notre programme et, si vous êtes intéressé(e), à autoriser le dépôt de votre dossier.'
  );

  // RÈGLE STRICTE : Seuls les étudiants ayant volontairement activé institutionalVisibilityEnabled sont accessibles !
  const visibleStudents = useMemo(() => {
    return students.filter((stu) => {
      if (!stu.institutionalVisibilityEnabled) return false;
      if (
        diplomaFilter !== 'TOUS' &&
        stu.highestDiplomaObtained !== diplomaFilter
      ) {
        return false;
      }
      if (
        targetLevelFilter !== 'TOUS' &&
        stu.targetStudyLevel !== targetLevelFilter
      ) {
        return false;
      }
      if (domainFilter !== 'TOUS' && stu.studyDomain !== domainFilter) {
        return false;
      }
      const minG = parseFloat(minGradeFilter) || 0;
      if (minG > 0) {
        if (
          !stu.allowAcademicScoreSharing ||
          (stu.normalizedGradeOut20 || 0) < minG
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    students,
    diplomaFilter,
    targetLevelFilter,
    domainFilter,
    minGradeFilter,
  ]);

  const hiddenPrivateCount = students.filter(
    (s) => !s.institutionalVisibilityEnabled
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="SOURCING RESPECTUEUX DE LA CONFIDENTIALITÉ (LOI N° 2024/017)"
        title="Recherche de candidats volontaires"
        subtitle="Cette interface affiche exclusivement les étudiants ayant activé volontairement leur visibilité institutionnelle. Les coordonnées personnelles (e-mail, téléphone, documents) restent masquées tant que le candidat n’accepte pas votre invitation."
      />

      {!currentOrganization.isVerified ? (
        <Panel title="Accès restreint — Vérification institutionnelle requise">
          <p className="text-xs text-[#B42318]">
            Votre compte organisme est actuellement en attente de vérification
            par l’administrateur. Vous ne pouvez pas encore consulter la base
            des candidats volontaires.
          </p>
        </Panel>
      ) : (
        <>
          <div className="bg-[#3457D5]/10 border border-[#203454]/20 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#203454]">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                <strong>Filtre de confidentialité actif :</strong>{' '}
                {visibleStudents.length} profil(s) volontaire(s) accessible(s) ·{' '}
                {hiddenPrivateCount} profil(s) privé(s) automatiquement exclu(s)
                des résultats.
              </span>
            </div>
          </div>

          {/* Barre de filtres académiques */}
          <Panel title="Critères de recherche académique">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label
                  htmlFor="cand-diploma"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Diplôme déjà obtenu
                </label>
                <select
                  id="cand-diploma"
                  value={diplomaFilter}
                  onChange={(e) => setDiplomaFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="TOUS">Tous les diplômes</option>
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cand-target"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Formation recherchée
                </label>
                <select
                  id="cand-target"
                  value={targetLevelFilter}
                  onChange={(e) => setTargetLevelFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="TOUS">Tous niveaux visés</option>
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cand-domain"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Filière / Domaine
                </label>
                <select
                  id="cand-domain"
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="TOUS">Toutes filières</option>
                  {STUDY_DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cand-grade"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Moyenne minimale (/20, si autorisée)
                </label>
                <select
                  id="cand-grade"
                  value={minGradeFilter}
                  onChange={(e) => setMinGradeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl font-mono"
                >
                  <option value="0">Sans filtre de moyenne</option>
                  <option value="12">≥ 12.0 / 20</option>
                  <option value="14">≥ 14.0 / 20</option>
                  <option value="15">≥ 15.0 / 20</option>
                  <option value="16">≥ 16.0 / 20</option>
                </select>
              </div>
            </div>
          </Panel>

          {/* Résultats pseudonymisés (OpenAPI 1.1 : candidatePublicId opaque, sans ville ni coordonnées personnelles) */}
          <div className="space-y-4">
            {visibleStudents.map((stu) => {
              const anonCode = `CAND-CM-2026-0${stu.id.replace('stu-', '')}`;
              const candidatePublicId = `CAND-PUB-2026-${stu.id
                .replace(/[^a-zA-Z0-9]/g, '')
                .toUpperCase()}`;
              return (
                <Panel
                  key={candidatePublicId}
                  title={`Profil Candidat Volontaire · Réf. ${anonCode}`}
                  subtitle={`Jeton public : ${candidatePublicId} · Nationalité : ${stu.nationality} · Résidence : ${stu.residenceCountry} · Consentement accordé le ${stu.visibilityConsentDate || '2026-10-15'}`}
                  headerRight={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setInvitingStudentId(candidatePublicId)}
                    >
                      <MailOpen className="w-3.5 h-3.5" />
                      Inviter à postuler
                    </Button>
                  }
                >
                  <div className="space-y-3 text-xs">
                    <AcademicTriptych
                      highestDiplomaObtained={stu.highestDiplomaObtained}
                      highestDiplomaName={stu.highestDiplomaName}
                      currentStudyLevel={stu.currentStudyLevel}
                      currentInstitution={stu.currentInstitution}
                      targetStudyLevel={stu.targetStudyLevel}
                      studyDomain={stu.studyDomain}
                      compact
                    />

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-[#69768C]">
                      <div>
                        Moyenne normalisée :{' '}
                        <strong className="text-[#253047] font-mono tabular-nums">
                          {stu.allowAcademicScoreSharing &&
                          stu.normalizedGradeOut20
                            ? `${stu.normalizedGradeOut20.toFixed(2)} / 20`
                            : 'Non partagée'}
                        </strong>{' '}
                        · Langues :{' '}
                        <strong className="text-[#253047]">
                          {stu.languages
                            .map((l) => `${l.language} (${l.level})`)
                            .join(', ')}
                        </strong>
                      </div>
                      <span className="text-[11px] text-[#14533C] font-medium">
                        Coordonnées privées protégées jusqu’à acceptation de
                        l’invitation
                      </span>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}

      {/* Modale d'envoi d'invitation à un candidat */}
      <Modal
        isOpen={Boolean(invitingStudentId)}
        onClose={() => setInvitingStudentId(null)}
        title="Envoyer une invitation à consulter un programme"
        subtitle="Le candidat recevra cette invitation dans son espace et restera libre d’accepter ou de refuser."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInvitingStudentId(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (invitingStudentId) {
                  sendInvitationToStudent(
                    invitingStudentId,
                    selectedScholarshipId,
                    invitationMessage
                  );
                  setInvitingStudentId(null);
                }
              }}
            >
              Envoyer l’invitation (Simulation)
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="inv-scholarship"
              className="block font-medium text-[#253047] mb-1"
            >
              Programme de bourse proposé *
            </label>
            <select
              id="inv-scholarship"
              value={selectedScholarshipId}
              onChange={(e) => setSelectedScholarshipId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            >
              {(orgScholarships.length > 0 ? orgScholarships : scholarships).map(
                (s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="inv-msg"
              className="block font-medium text-[#253047] mb-1"
            >
              Message personnalisé adressé au candidat *
            </label>
            <textarea
              id="inv-msg"
              rows={4}
              value={invitationMessage}
              onChange={(e) => setInvitationMessage(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * 5. INVITATIONS ENVOYÉES (/organisme/invitations)
 */
export const OrganizationInvitationsSentPage: React.FC = () => {
  const { currentOrganization, invitations } = useApp();

  const sentList = invitations.filter(
    (i) => i.organizationId === currentOrganization.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="HISTORIQUE DE SOURCING"
        title="Invitations envoyées aux candidats"
        subtitle="Suivez l’état des invitations adressées aux profils étudiants volontaires."
      />

      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6ECF5] bg-[#F8FAFD] text-[#203454]">
                <th className="py-3 px-4 font-semibold">Candidat</th>
                <th className="py-3 px-4 font-semibold">Programme proposé</th>
                <th className="py-3 px-4 font-semibold">Date d’envoi</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold">Consentement dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5]">
              {sentList.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8FAFD]">
                  <td className="py-3 px-4 font-semibold text-[#253047]">
                    {inv.consentToShareDossier
                      ? inv.studentDisplayName
                      : `${inv.studentAnonymizedCode} (Anonymisé)`}
                  </td>
                  <td className="py-3 px-4 text-[#203454]">
                    {inv.scholarshipTitle}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {inv.sentAt}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {inv.status === 'PENDING'
                      ? 'En attente de réponse'
                      : inv.status === 'ACCEPTED'
                      ? 'Acceptée'
                      : 'Refusée'}
                  </td>
                  <td className="py-3 px-4 text-[#69768C]">
                    {inv.consentToShareDossier
                      ? 'Dossier partagé dans vos candidatures'
                      : 'Protégé (Non transmis)'}
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
 * 6. GESTION DES CANDIDATURES (/organisme/candidatures)
 * États requis : Candidature reçue, En cours d’examen, Informations complémentaires demandées, Présélectionnée, Retenue, Non retenue.
 */
export const OrganizationApplicationsPage: React.FC = () => {
  const {
    currentOrganization,
    applications,
    updateApplicationStatus,
  } = useApp();

  const ALL_STATUSES: ApplicationStatus[] = [
    'Candidature reçue',
    'En cours d’examen',
    'Informations complémentaires demandées',
    'Présélectionnée',
    'Retenue',
    'Non retenue',
  ];

  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  const orgApps = applications.filter(
    (a) =>
      a.organizationId === currentOrganization.id &&
      (statusFilter === 'TOUS' || a.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="PIPELINE DE SÉLECTION INSTITUTIONNEL"
        title="Gestion des candidatures"
        subtitle="Examinez les dossiers reçus et faites évoluer leur statut à chaque étape du comité de sélection."
      />

      {/* Filtres par état */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white border border-[#E6ECF5] rounded-2xl p-2">
        <button
          type="button"
          onClick={() => setStatusFilter('TOUS')}
          className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer ${
            statusFilter === 'TOUS'
              ? 'bg-[#203454] text-white'
              : 'text-[#253047] hover:bg-[#F8FAFD]'
          }`}
        >
          Tous les dossiers
        </button>
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer ${
              statusFilter === st
                ? 'bg-[#203454] text-white'
                : 'text-[#253047] hover:bg-[#F8FAFD]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orgApps.map((app) => (
          <Panel
            key={app.id}
            title={`${app.studentName} · Réf. ${app.referenceCode}`}
            subtitle={`Programme : ${app.scholarshipTitle} · Soumise le ${app.submittedAt}`}
            headerRight={
              <span className="px-2.5 py-1 rounded bg-[#3457D5]/10 text-[#203454] font-semibold text-xs">
                Statut actuel : {app.status}
              </span>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[#69768C] block">Diplôme obtenu</span>
                  <strong>{app.studentHighestDiploma}</strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">Niveau actuel</span>
                  <strong>{app.studentCurrentLevel}</strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">Formation visée</span>
                  <strong className="text-[#3457D5]">
                    {app.studentTargetLevel} ({app.studentDomain})
                  </strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">
                    Moyenne académique
                  </span>
                  <strong className="font-mono tabular-nums">
                    {app.studentGradeOut20}/20
                  </strong>
                </div>
              </div>

              <div className="text-[#253047]">
                <strong>Notes d’évaluation :</strong> {app.evaluatorNotes}
              </div>

              <div className="pt-2 border-t border-[#E6ECF5] flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#69768C]">
                  Modifier le statut du dossier :
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {ALL_STATUSES.map((st) => (
                    <Button
                      key={st}
                      variant={app.status === st ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => updateApplicationStatus(app.id, st)}
                    >
                      {st}
                    </Button>
                  ))}
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
 * 7. ÉVALUATION DES DOSSIERS & GESTION DES ÉVALUATEURS (/organisme/evaluations)
 */
export const OrganizationEvaluationsPage: React.FC = () => {
  const {
    currentOrganization,
    applications,
    updateApplicationStatus,
    addOrganizationEvaluator,
  } = useApp();

  const [evalName, setEvalName] = useState('');
  const [evalEmail, setEvalEmail] = useState('');
  const [evalRole, setEvalRole] = useState('Membre de la Commission Scientifique');
  const [evalPerm, setEvalPerm] = useState<
    'LECTURE_SEULE' | 'EVALUATION_DOSSIERS' | 'DECISION_FINALE'
  >('EVALUATION_DOSSIERS');

  const orgApps = applications.filter(
    (a) => a.organizationId === currentOrganization.id
  );

  const handleAddEvaluator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalName.trim() || !evalEmail.trim()) return;
    addOrganizationEvaluator(
      currentOrganization.id,
      evalName,
      evalEmail,
      evalRole,
      evalPerm
    );
    setEvalName('');
    setEvalEmail('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="COMITÉ DE SÉLECTION & COLLABORATEURS"
        title="Évaluation des dossiers & Gestion des évaluateurs"
        subtitle="Attribuez des scores d’évaluation aux candidatures et gérez les permissions des membres de votre comité."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Panel
            title="Grille de notation des dossiers"
            subtitle="Scores académiques et commentaires des rapporteurs"
          >
            <div className="space-y-4 text-xs">
              {orgApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#203454]">
                      {app.studentName} ({app.referenceCode})
                    </div>
                    <span className="font-mono tabular-nums font-semibold">
                      Score comité : {app.evaluatorScoreOut100 ?? 80} / 100
                    </span>
                  </div>
                  <div className="text-[#69768C]">{app.evaluatorNotes}</div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateApplicationStatus(
                          app.id,
                          'Présélectionnée',
                          'Dossier validé par la commission scientifique avec avis très favorable.',
                          92
                        )
                      }
                    >
                      Noter 92/100 & Présélectionner
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateApplicationStatus(
                          app.id,
                          'Informations complémentaires demandées',
                          'En attente de fourniture du relevé de notes certifié.'
                        )
                      }
                    >
                      Demander un complément
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Panel
            title="Membres évaluateurs et permissions"
            subtitle="Collaborateurs habilités à consulter ou noter les dossiers"
          >
            <div className="space-y-3 text-xs">
              {currentOrganization.evaluators.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-[#253047]">{ev.name}</div>
                    <div className="text-[#69768C]">
                      {ev.roleTitle} · {ev.email}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white border border-[#E6ECF5] font-mono text-[11px]">
                    {ev.permissionLevel}
                  </span>
                </div>
              ))}

              <form
                onSubmit={handleAddEvaluator}
                className="pt-4 mt-4 border-t border-[#E6ECF5] space-y-3"
              >
                <div className="font-semibold text-[#203454]">
                  Inviter un nouvel évaluateur
                </div>
                <input
                  type="text"
                  value={evalName}
                  onChange={(e) => setEvalName(e.target.value)}
                  placeholder="Nom et titre (ex: Pr. Samuel Oumarou)"
                  aria-label="Nom de l'évaluateur"
                  className="w-full px-3 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                />
                <input
                  type="email"
                  value={evalEmail}
                  onChange={(e) => setEvalEmail(e.target.value)}
                  placeholder="Adresse e-mail professionnelle"
                  aria-label="Email de l'évaluateur"
                  className="w-full px-3 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                />
                <select
                  value={evalPerm}
                  onChange={(e) => setEvalPerm(e.target.value as any)}
                  aria-label="Niveau de permission"
                  className="w-full px-3 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="LECTURE_SEULE">
                    Permission : Lecture seule des dossiers
                  </option>
                  <option value="EVALUATION_DOSSIERS">
                    Permission : Évaluation & Notation
                  </option>
                  <option value="DECISION_FINALE">
                    Permission : Décision finale d’attribution
                  </option>
                </select>
                <Button type="submit" variant="primary" size="sm">
                  Ajouter l’évaluateur
                </Button>
              </form>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

/**
 * 8. DÉCISIONS D'ATTRIBUTION (/organisme/decisions), STATISTIQUES (/organisme/statistiques) & ABONNEMENT (/organisme/abonnement)
 */
export const OrganizationDecisionsPage: React.FC = () => {
  const { currentOrganization, applications, updateApplicationStatus } =
    useApp();

  const orgApps = applications.filter(
    (a) => a.organizationId === currentOrganization.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="DÉLIBÉRATIONS SOUVERAINES DU JURY"
        title="Décisions d’attribution des bourses"
        subtitle="La décision finale d’attribution appartient exclusivement à l’organisme financeur. Enregistrez vos décisions motivées pour traçabilité."
      />

      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6ECF5] bg-[#F8FAFD] text-[#203454]">
                <th className="py-3 px-4 font-semibold">Référence & Candidat</th>
                <th className="py-3 px-4 font-semibold">Programme</th>
                <th className="py-3 px-4 font-semibold">Score / Moyenne</th>
                <th className="py-3 px-4 font-semibold">Statut actuel</th>
                <th className="py-3 px-4 font-semibold">Décision finale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5]">
              {orgApps.map((app) => (
                <tr key={app.id} className="hover:bg-[#F8FAFD]">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#253047]">
                      {app.studentName}
                    </div>
                    <div className="text-[#69768C] font-mono">
                      {app.referenceCode}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#203454]">
                    {app.scholarshipTitle}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {app.studentGradeOut20}/20 · Score :{' '}
                    {app.evaluatorScoreOut100 ?? 'N/A'}/100
                  </td>
                  <td className="py-3 px-4 font-semibold">{app.status}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          app.status === 'Retenue' ? 'primary' : 'secondary'
                        }
                        size="sm"
                        onClick={() =>
                          updateApplicationStatus(
                            app.id,
                            'Retenue',
                            app.evaluatorNotes,
                            app.evaluatorScoreOut100,
                            'Candidature retenue par décision du comité d’attribution.'
                          )
                        }
                      >
                        Retenir (Attribuer)
                      </Button>
                      <Button
                        variant={
                          app.status === 'Non retenue' ? 'danger' : 'secondary'
                        }
                        size="sm"
                        onClick={() =>
                          updateApplicationStatus(
                            app.id,
                            'Non retenue',
                            app.evaluatorNotes,
                            app.evaluatorScoreOut100,
                            'Candidature non retenue au regard du quota de places disponibles.'
                          )
                        }
                      >
                        Non retenue
                      </Button>
                    </div>
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

export const OrganizationStatisticsPage: React.FC = () => {
  const { currentOrganization, scholarships, applications, invitations } =
    useApp();

  const orgScholarships = scholarships.filter(
    (s) => s.organizationId === currentOrganization.id
  );
  const orgApps = applications.filter(
    (a) => a.organizationId === currentOrganization.id
  );
  const orgInvs = invitations.filter(
    (i) => i.organizationId === currentOrganization.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="ANALYSE OPÉRATIONNELLE DES CAMPAGNES"
        title="Statistiques de suivi"
        subtitle="Données factuelles utiles au pilotage de vos appels à candidatures (sans graphiques purement décoratifs)."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Répartition des candidatures par statut">
          <div className="divide-y divide-[#E6ECF5] text-xs">
            {(
              [
                'Candidature reçue',
                'En cours d’examen',
                'Informations complémentaires demandées',
                'Présélectionnée',
                'Retenue',
                'Non retenue',
              ] as ApplicationStatus[]
            ).map((st) => {
              const count = orgApps.filter((a) => a.status === st).length;
              return (
                <div
                  key={st}
                  className="py-2.5 flex items-center justify-between"
                >
                  <span className="text-[#253047]">{st}</span>
                  <strong className="font-mono tabular-nums text-[#203454]">
                    {count} dossier(s)
                  </strong>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Performance des invitations envoyées">
          <div className="divide-y divide-[#E6ECF5] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span>Total des invitations transmises</span>
              <strong className="font-mono tabular-nums">
                {orgInvs.length}
              </strong>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span>Invitations acceptées avec partage de dossier</span>
              <strong className="font-mono tabular-nums text-[#14533C]">
                {orgInvs.filter((i) => i.status === 'ACCEPTED').length}
              </strong>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span>Invitations en attente de réponse</span>
              <strong className="font-mono tabular-nums text-[#9A421D]">
                {orgInvs.filter((i) => i.status === 'PENDING').length}
              </strong>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span>Programmes de bourses publiés</span>
              <strong className="font-mono tabular-nums">
                {orgScholarships.length}
              </strong>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export const OrganizationBillingPage: React.FC = () => {
  const {
    currentOrganization,
    subscriptions,
    subscriptionRequests,
    changeOrganizationPlan,
    requestOrganizationPlanChange,
  } = useApp();

  const plans: {
    id: PlanTierId;
    name: string;
    price: string;
    desc: string;
  }[] = [
    {
      id: 'ORG_DISCOVERY',
      name: 'Organisme Découverte',
      price: 'Gratuit',
      desc: 'Accès institutionnel limité et vérification du compte.',
    },
    {
      id: 'ORG_SINGLE_CAMPAIGN',
      name: 'Campagne ponctuelle',
      price: '75 000 FCFA / campagne',
      desc: 'Organisation d’une campagne annuelle sans abonnement mensuel.',
    },
    {
      id: 'ORG_PRO',
      name: 'Organisme Pro',
      price: '50 000 FCFA / mois',
      desc: 'Gestion multi-campagnes, recherche de candidats volontaires, invitations et statistiques.',
    },
    {
      id: 'ORG_PREMIUM',
      name: 'Organisme Premium',
      price: '150 000 FCFA / mois',
      desc: 'Collaboration avancée entre évaluateurs, rapports détaillés et support dédié.',
    },
  ];

  const mySubs = subscriptions.filter(
    (s) => s.organizationId === currentOrganization.id
  );
  const myRequests = (subscriptionRequests || []).filter(
    (r) => r.organizationId === currentOrganization.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MODÈLE B2B2C (SOUSCRIPTIONS SIMULÉES — OPENAPI 1.1)"
        title="Abonnement et facturation institutionnelle"
        subtitle="Ces tarifs sont des hypothèses commerciales destinées à la démonstration. Conformément au contrat OpenAPI 1.1, une demande de changement de plan est soumise à validation administrative (ou simulable en mode Sandbox)."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = currentOrganization.activePlan === p.id;
          return (
            <Panel
              key={p.id}
              title={p.name}
              subtitle={p.price}
              className={isCurrent ? 'border-[#203454] bg-[#3457D5]/10/30' : ''}
            >
              <div className="space-y-3 text-xs">
                <p className="text-[#69768C]">{p.desc}</p>
                <div className="space-y-1.5">
                  <Button
                    variant={isCurrent ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      requestOrganizationPlanChange(currentOrganization.id, p.id)
                    }
                  >
                    {isCurrent
                      ? 'Formule active'
                      : 'Demander cette formule (v1.1)'}
                  </Button>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        changeOrganizationPlan(currentOrganization.id, p.id)
                      }
                    >
                      Simuler en Sandbox immédiat
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {myRequests.length > 0 && (
        <Panel
          title="Demandes de changement de formule (/organizations/me/subscription/requests)"
          subtitle="Aucune fonctionnalité payante n’est activée sans confirmation serveur ou validation admin"
        >
          <div className="divide-y divide-[#E6ECF5] text-xs">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="py-2.5 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <strong className="text-[#203454]">{req.requestedPlan}</strong>{' '}
                  · <span className="text-[#69768C]">{req.requestNote}</span>
                </div>
                <div className="font-mono tabular-nums">
                  Statut : <strong>{req.status}</strong> ({req.requestedAt.slice(0, 10)})
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Historique des souscriptions simulées">
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {mySubs.map((s) => (
            <div
              key={s.id}
              className="py-2.5 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <strong className="text-[#203454]">{s.planName}</strong> ·{' '}
                <span>{s.billingCycle}</span>
              </div>
              <div className="font-mono tabular-nums">
                {s.amountFcfa.toLocaleString('fr-FR')} FCFA · Statut :{' '}
                <strong>{s.status}</strong> (Début : {s.startedAt})
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
