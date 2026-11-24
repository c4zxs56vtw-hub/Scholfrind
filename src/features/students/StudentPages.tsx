import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  Globe,
  GraduationCap,
  Lock,
  MailOpen,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
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
  CriterionStatusText,
  EligibilityVerdictIndicator,
  Modal,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import {
  AcademicLevel,
  EligibilityGlobalVerdict,
  FundingType,
  GradingScale,
  LanguageLevel,
  LanguageSkill,
  StudyDomain,
} from '../../types';
import { MobileExpandableSearch } from './MobileExpandableSearch';

/**
 * Sous-navigation de la rubrique « Pour moi »
 * Permet de basculer en 1 clic entre Recommandations et Vérification d'éligibilité.
 */
const PourMoiSubNav: React.FC = () => {
  const location = useLocation();
  const isRecommandations = location.pathname.startsWith(
    '/etudiant/recommandations'
  );
  const isEligibilite = location.pathname.startsWith('/etudiant/eligibilite');

  return (
    <div
      role="navigation"
      aria-label="Sous-navigation Pour moi"
      className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E6ECF5] rounded-2xl shadow-xs"
    >
      <Link
        to="/etudiant/recommandations"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
          isRecommandations
            ? 'bg-[#3457D5] text-white'
            : 'text-[#69768C] hover:text-[#203454] hover:bg-[#F8FAFD]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Recommandations</span>
      </Link>
      <Link
        to="/etudiant/eligibilite"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
          isEligibilite
            ? 'bg-[#3457D5] text-white'
            : 'text-[#69768C] hover:text-[#203454] hover:bg-[#F8FAFD]'
        }`}
      >
        <FileCheck2 className="w-3.5 h-3.5" />
        <span>Vérifier mon éligibilité</span>
      </Link>
    </div>
  );
};

/**
 * Sous-navigation de la rubrique « Activités »
 * Permet de basculer en 1 clic entre Favoris, Invitations et Notifications avec compteurs réels.
 */
const ActivitesSubNav: React.FC = () => {
  const location = useLocation();
  const { currentStudent, currentUser, invitations, notifications } = useApp();

  const favoritesCount = currentStudent.savedScholarshipIds.length;
  const pendingInvitationsCount = invitations.filter(
    (i) => i.studentId === currentStudent.id && i.status === 'PENDING'
  ).length;
  const unreadNotifsCount = notifications.filter(
    (n) => n.userId === currentUser.id && !n.read
  ).length;

  const tabs = [
    {
      label: 'Favoris',
      to: '/etudiant/favoris',
      icon: Bookmark,
      count: favoritesCount,
      isActive: location.pathname.startsWith('/etudiant/favoris'),
    },
    {
      label: 'Invitations',
      to: '/etudiant/invitations',
      icon: MailOpen,
      count: pendingInvitationsCount,
      isActive: location.pathname.startsWith('/etudiant/invitations'),
    },
    {
      label: 'Notifications',
      to: '/etudiant/notifications',
      icon: Bell,
      count: unreadNotifsCount,
      isActive: location.pathname.startsWith('/etudiant/notifications'),
    },
  ];

  return (
    <div
      role="navigation"
      aria-label="Sous-navigation Activités"
      className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E6ECF5] rounded-2xl shadow-xs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              tab.isActive
                ? 'bg-[#3457D5] text-white'
                : 'text-[#69768C] hover:text-[#203454] hover:bg-[#F8FAFD]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                tab.isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F8FAFD] border border-[#E6ECF5] text-[#203454]'
              }`}
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

/**
 * Sous-navigation de la rubrique « Profil »
 * Permet de basculer en 1 clic entre Mon profil et Confidentialité & Visibilité.
 */
const ProfilSubNav: React.FC = () => {
  const location = useLocation();
  const isProfil = location.pathname.startsWith('/etudiant/profil');
  const isConfidentialite = location.pathname.startsWith(
    '/etudiant/confidentialite'
  );

  return (
    <div
      role="navigation"
      aria-label="Sous-navigation Profil"
      className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E6ECF5] rounded-2xl shadow-xs"
    >
      <Link
        to="/etudiant/profil"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
          isProfil
            ? 'bg-[#3457D5] text-white'
            : 'text-[#69768C] hover:text-[#203454] hover:bg-[#F8FAFD]'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Mon profil</span>
      </Link>
      <Link
        to="/etudiant/confidentialite"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
          isConfidentialite
            ? 'bg-[#3457D5] text-white'
            : 'text-[#69768C] hover:text-[#203454] hover:bg-[#F8FAFD]'
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
        <span>Confidentialité & Visibilité</span>
      </Link>
    </div>
  );
};

/**
 * Badge de compatibilité léger pour le tableau de bord étudiant
 * (Direction : Modern Youth Education — Minimal & Friendly)
 */
const YouthCompatibilityBadge: React.FC<{ verdict: EligibilityGlobalVerdict }> = ({
  verdict,
}) => {
  if (verdict === 'POTENTIALLY_COMPATIBLE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDF5EB] text-[#14533C]">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Potentiellement compatible</span>
      </span>
    );
  }
  if (verdict === 'TO_COMPLETE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5A17B]/25 text-[#9A3412]">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>À compléter</span>
      </span>
    );
  }
  if (verdict === 'TO_VERIFY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#3457D5]/10 text-[#3457D5]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>À vérifier</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#69768C]">
      <span>Non compatible</span>
    </span>
  );
};

/**
 * 1. TABLEAU DE BORD ÉTUDIANT (/etudiant/tableau-de-bord)
 * Direction : Modern Youth Education — Minimal & Friendly
 * 4 fonctions clairement définies sans répétition :
 * 1. Rechercher une bourse
 * 2. Découvrir les trois opportunités prioritaires (cohérentes avec le parcours et domaine)
 * 3. Consulter les activités importantes (Invitations, Favoris, Notifications provenant des données réelles)
 * 4. Accéder rapidement au profil
 */
export const StudentDashboardPage: React.FC = () => {
  const {
    currentStudent,
    currentUser,
    scholarships,
    invitations,
    notifications,
    evaluateForCurrentStudent,
    toggleSavedScholarship,
  } = useApp();
  const navigate = useNavigate();

  // États de la recherche principale et des 3 filtres rapides
  const [searchQuery, setSearchQuery] = useState('');
  const [quickLevel, setQuickLevel] = useState('TOUS');
  const [quickDomain, setQuickDomain] = useState('TOUS');
  const [quickCountry, setQuickCountry] = useState('TOUS');

  const availableCountries = useMemo(
    () =>
      Array.from(
        new Set(
          scholarships
            .filter((s) => s.status !== 'EXPIRED')
            .map((s) => s.hostCountry)
        )
      ),
    [scholarships]
  );

  // Détection des éléments manquants du profil
  const missingProfileItems = useMemo(() => {
    const missing: { label: string; step: number }[] = [];
    if (!currentStudent.highestDiplomaObtained) {
      missing.push({ label: 'Compléter ton diplôme obtenu', step: 2 });
    }
    if (!currentStudent.currentStudyLevel) {
      missing.push({ label: 'Indiquer ton niveau d’études actuel', step: 2 });
    }
    if (!currentStudent.targetStudyLevel) {
      missing.push({ label: 'Préciser la formation recherchée', step: 2 });
    }
    if (currentStudent.averageGrade === null) {
      missing.push({ label: 'Renseigner ta moyenne académique', step: 2 });
    }
    const hasUncertifiedEnglish = currentStudent.languages.some(
      (l) =>
        l.language === 'Anglais' &&
        (!l.certification || !l.certification.trim())
    );
    if (hasUncertifiedEnglish) {
      missing.push({
        label: 'Ajouter ta certification linguistique (IELTS / TOEFL)',
        step: 3,
      });
    }
    return missing;
  }, [currentStudent]);

  const profileCompleteness = useMemo(() => {
    const totalChecks = 5;
    const completed = Math.max(0, totalChecks - missingProfileItems.length);
    return Math.round((completed / totalChecks) * 100);
  }, [missingProfileItems]);

  // Soumission de la recherche principale -> redirection vers le catalogue avec critères pré-appliqués
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (quickLevel !== 'TOUS') params.set('level', quickLevel);
    if (quickDomain !== 'TOUS') params.set('domain', quickDomain);
    if (quickCountry !== 'TOUS') params.set('country', quickCountry);
    const queryString = params.toString();
    navigate(
      queryString ? `/etudiant/recherche?${queryString}` : '/etudiant/recherche'
    );
  };

  // Classement des bourses recommandées cohérentes avec le parcours académique, domaine et préférences
  const recommendedList = useMemo(() => {
    const priorityOrder: Record<EligibilityGlobalVerdict, number> = {
      POTENTIALLY_COMPATIBLE: 1,
      TO_COMPLETE: 2,
      TO_VERIFY: 3,
      INCOMPATIBLE: 4,
    };

    return scholarships
      .filter(
        (s) =>
          s.status !== 'EXPIRED' &&
          s.status !== 'DRAFT' &&
          s.curationStatus !== 'ARCHIVED' &&
          (!s.publicationStatus || s.publicationStatus === 'PUBLISHED')
      )
      .map((s) => {
        const report = evaluateForCurrentStudent(s);
        const matchesDomain =
          !currentStudent.studyDomain ||
          s.criteria.eligibleDomains.includes(currentStudent.studyDomain) ||
          s.criteria.eligibleDomains.includes('Tous domaines');
        const matchesTargetLevel =
          !currentStudent.targetStudyLevel ||
          s.criteria.targetStudyLevels.includes(
            currentStudent.targetStudyLevel
          );
        const matchesDestinationPref =
          currentStudent.preferredDestinationCountries.includes(s.hostCountry);
        const matchesFundingPref =
          currentStudent.preferredFundingTypes.includes(s.fundingType);

        const preferenceScore =
          (matchesDestinationPref ? 2 : 0) + (matchesFundingPref ? 1 : 0);

        return {
          scholarship: s,
          report,
          matchesDomain,
          matchesTargetLevel,
          preferenceScore,
        };
      })
      .filter(
        (item) =>
          item.report.verdict !== 'INCOMPATIBLE' &&
          item.matchesDomain &&
          item.matchesTargetLevel
      )
      .sort((a, b) => {
        const verdictDiff =
          priorityOrder[a.report.verdict] - priorityOrder[b.report.verdict];
        if (verdictDiff !== 0) return verdictDiff;
        return b.preferenceScore - a.preferenceScore;
      });
  }, [scholarships, currentStudent]);

  const topThreeRecommended = recommendedList.slice(0, 3);

  // Données d'activités réelles issues du contexte (Invitations, Favoris, Notifications)
  const studentInvitations = useMemo(
    () => invitations.filter((i) => i.studentId === currentStudent.id),
    [invitations, currentStudent.id]
  );

  const pendingInvitations = useMemo(
    () => studentInvitations.filter((i) => i.status === 'PENDING'),
    [studentInvitations]
  );

  const savedScholarships = useMemo(
    () =>
      scholarships
        .filter(
          (s) =>
            currentStudent.savedScholarshipIds.includes(s.id) &&
            s.status !== 'EXPIRED'
        )
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [scholarships, currentStudent.savedScholarshipIds]
  );

  const studentNotifications = useMemo(
    () => notifications.filter((n) => n.userId === currentUser.id),
    [notifications, currentUser.id]
  );

  const unreadNotifications = useMemo(
    () => studentNotifications.filter((n) => !n.read),
    [studentNotifications]
  );

  return (
    <div className="space-y-6">
      {/* 1. ACCUEIL & RECHERCHE PRINCIPALE */}
      <section className="space-y-4">
        {/* Version Mobile (< 768px) : Barre de recherche rétractable et animée */}
        <MobileExpandableSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          quickLevel={quickLevel}
          onQuickLevelChange={setQuickLevel}
          quickDomain={quickDomain}
          onQuickDomainChange={setQuickDomain}
          quickCountry={quickCountry}
          onQuickCountryChange={setQuickCountry}
          availableCountries={availableCountries}
          onSubmitSearch={handleSearchSubmit}
        />

        {/* Version Tablette et Ordinateur (>= 768px) : Disposition actuelle inchangée */}
        <div className="hidden md:block space-y-4">
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#203454] tracking-tight">
            Trouvons la bourse qui te correspond.
          </h1>

          <div
            aria-label="Recherche principale de bourses"
            className="bg-white border border-[#E6ECF5] rounded-2xl p-4 sm:p-5 shadow-xs"
          >
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="w-5 h-5 text-[#69768C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherche une bourse, une formation ou un pays…"
                  aria-label="Recherche une bourse, une formation ou un pays"
                  className="w-full pl-11 pr-4 py-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-sm text-[#253047] placeholder:text-[#69768C] focus:outline-none focus:bg-white focus:border-[#3457D5] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#3457D5] hover:bg-[#203454] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Rechercher
              </button>
            </div>

            {/* Trois filtres rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                aria-label="Filtrer par niveau d'études"
                value={quickLevel}
                onChange={(e) => setQuickLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
              >
                <option value="TOUS">Niveau d’études (Tous)</option>
                {ACADEMIC_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filtrer par domaine de formation"
                value={quickDomain}
                onChange={(e) => setQuickDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
              >
                <option value="TOUS">Domaine (Tous)</option>
                {STUDY_DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filtrer par pays"
                value={quickCountry}
                onChange={(e) => setQuickCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
              >
                <option value="TOUS">Pays (Toutes destinations)</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </form>
          </div>
        </div>
      </section>

      {/* 2. TROIS OPPORTUNITÉS PRIORITAIRES */}
      <section className="space-y-3.5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#203454]">
              Des bourses pour toi
            </h2>
            <p className="text-xs sm:text-sm text-[#69768C] mt-0.5">
              Sélectionnées selon ton profil ({currentStudent.targetStudyLevel || 'Formation'} · {currentStudent.studyDomain || 'Tous domaines'}).
            </p>
          </div>
          <Link
            to="/etudiant/recommandations"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#3457D5] hover:text-[#203454] shrink-0"
          >
            <span>Tout voir ({recommendedList.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThreeRecommended.map(({ scholarship, report }) => {
            const isSaved = currentStudent.savedScholarshipIds.includes(
              scholarship.id
            );
            return (
              <article
                key={scholarship.id}
                className="bg-white border border-[#E6ECF5] hover:border-[#3457D5]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors shadow-xs"
              >
                <div className="space-y-3">
                  {/* Statut de compatibilité + Favori */}
                  <div className="flex items-center justify-between gap-2">
                    <YouthCompatibilityBadge verdict={report.verdict} />
                    <button
                      type="button"
                      onClick={() => toggleSavedScholarship(scholarship.id)}
                      aria-label={
                        isSaved
                          ? 'Retirer des favoris'
                          : 'Enregistrer dans les favoris'
                      }
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-[#3457D5] text-white border-[#3457D5]'
                          : 'bg-[#F8FAFD] text-[#69768C] border-[#E6ECF5] hover:text-[#3457D5]'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Nom de la bourse & Organisme */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#203454] leading-snug line-clamp-2">
                      <Link
                        to={`/bourses/${scholarship.id}`}
                        className="hover:text-[#3457D5] transition-colors"
                      >
                        {scholarship.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#69768C] mt-1 truncate">
                      {scholarship.organizationName}
                    </p>
                  </div>

                  {/* Métadonnées compactes */}
                  <div className="pt-2.5 border-t border-[#E6ECF5] space-y-1.5 text-xs text-[#253047]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Pays</span>
                      <span className="font-semibold text-[#203454]">
                        {scholarship.hostCountry}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Niveau financé</span>
                      <span className="font-semibold text-[#3457D5]">
                        {scholarship.criteria.targetStudyLevels.join(' / ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C] shrink-0">Financement</span>
                      <span className="font-medium truncate text-right">
                        {scholarship.fundingType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Date limite</span>
                      <span className="font-semibold tabular-nums">
                        {scholarship.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton Voir la bourse */}
                <button
                  type="button"
                  onClick={() => navigate(`/bourses/${scholarship.id}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFD] hover:bg-[#3457D5] text-[#3457D5] hover:text-white border border-[#E6ECF5] hover:border-[#3457D5] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Voir la bourse
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. CONSULTER LES ACTIVITÉS IMPORTANTES (Invitations, Favoris, Notifications issues des données existantes) */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[#203454]">
          Tes activités importantes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Invitations d'organismes */}
          <Link
            to="/etudiant/invitations"
            className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors group shadow-xs ${
              pendingInvitations.length > 0
                ? 'border-[#3457D5]/40 hover:border-[#3457D5]'
                : 'border-[#E6ECF5] hover:border-[#3457D5]/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#3457D5]/10 text-[#3457D5] flex items-center justify-center shrink-0">
                <MailOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#69768C]">
                  Invitations
                </div>
                <div className="text-sm font-bold text-[#203454] mt-0.5 truncate">
                  {pendingInvitations.length > 0
                    ? `${pendingInvitations.length} en attente`
                    : `${studentInvitations.length} reçue(s)`}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#69768C] group-hover:text-[#3457D5] shrink-0" />
          </Link>

          {/* 2. Favoris enregistrés & prochaine échéance */}
          <Link
            to="/etudiant/favoris"
            className="bg-white border border-[#E6ECF5] hover:border-[#3457D5]/40 rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors group shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#DDF5EB] text-[#14533C] flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#69768C]">
                  Favoris enregistrés
                </div>
                <div className="text-sm font-bold text-[#203454] mt-0.5 truncate">
                  {savedScholarships.length} bourse
                  {savedScholarships.length > 1 ? 's' : ''}
                  {savedScholarships[0]
                    ? ` · Échéance ${savedScholarships[0].deadline}`
                    : ''}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#69768C] group-hover:text-[#3457D5] shrink-0" />
          </Link>

          {/* 3. Notifications */}
          <Link
            to="/etudiant/notifications"
            className="bg-white border border-[#E6ECF5] hover:border-[#3457D5]/40 rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors group shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F5A17B]/20 text-[#9A3412] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#69768C]">
                  Notifications
                </div>
                <div className="text-sm font-bold text-[#203454] mt-0.5 truncate">
                  {unreadNotifications.length > 0
                    ? `${unreadNotifications.length} non lue${
                        unreadNotifications.length > 1 ? 's' : ''
                      }`
                    : `${studentNotifications.length} reçue(s)`}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#69768C] group-hover:text-[#3457D5] shrink-0" />
          </Link>
        </div>
      </section>

      {/* 4. ACCÈS RAPIDE AU PROFIL */}
      <section className="bg-white border border-[#E6ECF5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#3457D5] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {currentStudent.firstName.charAt(0)}
            {currentStudent.lastName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#203454]">
                Mon profil
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFD] border border-[#E6ECF5] text-[#69768C]">
                Complété à {profileCompleteness}%
              </span>
            </div>
            <p className="text-xs text-[#69768C] mt-0.5 truncate">
              {missingProfileItems.length > 0
                ? `À compléter : ${missingProfileItems[0].label}`
                : `Diplôme obtenu : ${currentStudent.highestDiplomaObtained} · Objectif : ${currentStudent.targetStudyLevel} (${currentStudent.studyDomain})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/etudiant/profil"
            className="px-3.5 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#E6ECF5]/60 border border-[#E6ECF5] text-xs font-semibold text-[#253047] transition-colors"
          >
            Consulter mon profil
          </Link>
          <Link
            to={
              missingProfileItems.length > 0
                ? `/etudiant/profil?mode=edit&step=${missingProfileItems[0].step}`
                : '/etudiant/profil?mode=edit'
            }
            className="px-4 py-2 rounded-xl bg-[#3457D5] hover:bg-[#203454] text-xs font-semibold text-white transition-colors"
          >
            {missingProfileItems.length > 0
              ? 'Compléter mon profil'
              : 'Modifier mon profil'}
          </Link>
        </div>
      </section>
    </div>
  );
};

/**
 * 2. PAGE « MON PROFIL » (/etudiant/profil)
 * Sépare clairement deux expériences :
 * - Consulter mon profil : organisée en 3 sections principales lisibles (Informations personnelles, Parcours académique, Projet d'études) sans sous-cartes inutiles.
 * - Modifier mon profil : formulaire progressif en 4 étapes lorsque ?mode=edit ou ?step= est actif.
 */
export const StudentProfilePage: React.FC = () => {
  const {
    currentStudent,
    updateStudentProfile,
    addStudentAcademicRecord,
    removeStudentAcademicRecord,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddDiplomaOpen, setIsAddDiplomaOpen] = useState(false);
  const [newDiplomaLevel, setNewDiplomaLevel] =
    useState<AcademicLevel>('Licence');
  const [newDiplomaTitle, setNewDiplomaTitle] = useState('');
  const [newDiplomaInstitution, setNewDiplomaInstitution] = useState('');
  const [newDiplomaYear, setNewDiplomaYear] = useState('2025');
  const [newDiplomaGrade, setNewDiplomaGrade] = useState('15.2');
  const [newDiplomaScale, setNewDiplomaScale] =
    useState<GradingScale>('SUR_20');

  const isEditMode =
    searchParams.get('mode') === 'edit' || searchParams.has('step');
  const stepParam = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState<number>(
    stepParam >= 1 && stepParam <= 4 ? stepParam : 1
  );

  React.useEffect(() => {
    const urlStep = Number(searchParams.get('step'));
    if (urlStep >= 1 && urlStep <= 4) {
      setStep(urlStep);
    } else if (searchParams.get('mode') === 'edit' && !searchParams.has('step')) {
      setStep(1);
    }
  }, [searchParams]);

  const [firstName, setFirstName] = useState(currentStudent.firstName);
  const [lastName, setLastName] = useState(currentStudent.lastName);
  const [nationality, setNationality] = useState(currentStudent.nationality);
  const [residenceCountry, setResidenceCountry] = useState(
    currentStudent.residenceCountry
  );
  const [city, setCity] = useState(currentStudent.city);
  const [birthYear, setBirthYear] = useState(
    currentStudent.birthYear ? String(currentStudent.birthYear) : '2003'
  );

  // Les 3 niveaux strictement distincts
  const [highestDiplomaObtained, setHighestDiplomaObtained] = useState<
    AcademicLevel | ''
  >(currentStudent.highestDiplomaObtained);
  const [highestDiplomaName, setHighestDiplomaName] = useState(
    currentStudent.highestDiplomaName
  );
  const [currentStudyLevel, setCurrentStudyLevel] = useState<
    AcademicLevel | ''
  >(currentStudent.currentStudyLevel);
  const [targetStudyLevel, setTargetStudyLevel] = useState<AcademicLevel | ''>(
    currentStudent.targetStudyLevel
  );

  const [studyDomain, setStudyDomain] = useState<StudyDomain | ''>(
    currentStudent.studyDomain
  );
  const [currentInstitution, setCurrentInstitution] = useState(
    currentStudent.currentInstitution
  );
  const [academicYear, setAcademicYear] = useState(currentStudent.academicYear);
  const [averageGrade, setAverageGrade] = useState(
    currentStudent.averageGrade !== null
      ? String(currentStudent.averageGrade)
      : ''
  );
  const [gradingScale, setGradingScale] = useState<GradingScale>(
    currentStudent.gradingScale
  );

  const [languages, setLanguages] = useState<LanguageSkill[]>(
    currentStudent.languages
  );
  const [preferredCountries, setPreferredCountries] = useState(
    currentStudent.preferredDestinationCountries.join(', ')
  );
  const [preferredFundingTypes, setPreferredFundingTypes] = useState<
    FundingType[]
  >(currentStudent.preferredFundingTypes);

  const [validationError, setValidationError] = useState('');

  // Synchronise le formulaire lorsque les données de currentStudent changent
  React.useEffect(() => {
    setFirstName(currentStudent.firstName);
    setLastName(currentStudent.lastName);
    setNationality(currentStudent.nationality);
    setResidenceCountry(currentStudent.residenceCountry);
    setCity(currentStudent.city);
    setBirthYear(
      currentStudent.birthYear ? String(currentStudent.birthYear) : ''
    );
    setHighestDiplomaObtained(currentStudent.highestDiplomaObtained);
    setHighestDiplomaName(currentStudent.highestDiplomaName);
    setCurrentStudyLevel(currentStudent.currentStudyLevel);
    setTargetStudyLevel(currentStudent.targetStudyLevel);
    setStudyDomain(currentStudent.studyDomain);
    setCurrentInstitution(currentStudent.currentInstitution);
    setAcademicYear(currentStudent.academicYear);
    setAverageGrade(
      currentStudent.averageGrade !== null
        ? String(currentStudent.averageGrade)
        : ''
    );
    setGradingScale(currentStudent.gradingScale);
    setLanguages(currentStudent.languages);
    setPreferredCountries(
      currentStudent.preferredDestinationCountries.join(', ')
    );
    setPreferredFundingTypes(currentStudent.preferredFundingTypes);
  }, [currentStudent]);

  // Détection des informations non renseignées pour la vue de consultation
  const missingFields = useMemo(() => {
    const list: { label: string; step: number }[] = [];
    if (!currentStudent.highestDiplomaObtained) {
      list.push({ label: 'Dernier diplôme obtenu non renseigné', step: 2 });
    }
    if (!currentStudent.currentStudyLevel) {
      list.push({ label: 'Niveau d’études actuel non renseigné', step: 2 });
    }
    if (!currentStudent.targetStudyLevel) {
      list.push({ label: 'Formation recherchée non renseignée', step: 2 });
    }
    if (currentStudent.averageGrade === null) {
      list.push({ label: 'Moyenne académique non renseignée', step: 2 });
    }
    const uncertifiedEnglish = currentStudent.languages.some(
      (l) =>
        l.language === 'Anglais' &&
        (!l.certification || !l.certification.trim())
    );
    if (uncertifiedEnglish) {
      list.push({
        label: 'Certification officielle d’anglais (IELTS / TOEFL) non renseignée',
        step: 3,
      });
    }
    if (currentStudent.preferredDestinationCountries.length === 0) {
      list.push({
        label: 'Pays de destination souhaités non renseignés',
        step: 4,
      });
    }
    return list;
  }, [currentStudent]);

  const openEditAtStep = (targetStep: number) => {
    setStep(targetStep);
    setSearchParams({ mode: 'edit', step: String(targetStep) });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!firstName.trim() || !lastName.trim() || !nationality.trim()) {
      setValidationError(
        'Les champs obligatoires (Nom, Prénom, Nationalité) doivent être renseignés.'
      );
      return;
    }

    const parsedGrade =
      averageGrade.trim() === '' ? null : parseFloat(averageGrade);
    if (
      parsedGrade !== null &&
      (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100)
    ) {
      setValidationError('Veuillez saisir une moyenne académique valide.');
      return;
    }

    updateStudentProfile(currentStudent.id, {
      firstName,
      lastName,
      nationality,
      residenceCountry,
      city,
      birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
      highestDiplomaObtained,
      highestDiplomaName,
      currentStudyLevel,
      targetStudyLevel,
      studyDomain,
      currentInstitution,
      academicYear,
      averageGrade: parsedGrade,
      gradingScale,
      languages,
      preferredDestinationCountries: preferredCountries
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      preferredFundingTypes,
    });

    // Retour immédiat à la page de consultation avec les nouvelles informations affichées
    setSearchParams({});
  };

  const updateLanguageCert = (index: number, certification: string) => {
    setLanguages((prev) =>
      prev.map((l, i) => (i === index ? { ...l, certification } : l))
    );
  };

  const updateLanguageLevel = (index: number, level: LanguageLevel) => {
    setLanguages((prev) =>
      prev.map((l, i) => (i === index ? { ...l, level } : l))
    );
  };

  const initials = `${currentStudent.firstName.charAt(0)}${currentStudent.lastName.charAt(0)}`;

  // ============================================================================
  // EXPÉRIENCE 1 : CONSULTER MON PROFIL (par défaut sur /etudiant/profil)
  // Organisée en 3 sections principales lisibles sans multiplier les sous-cartes.
  // ============================================================================
  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <ProfilSubNav />

        {/* En-tête de la page « Mon profil » */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
              Mon profil
            </h1>
            <p className="text-sm sm:text-base text-[#69768C] mt-1">
              Consulte tes informations personnelles, ton parcours académique et ton projet d’études.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              onClick={() => openEditAtStep(4)}
            >
              Mes préférences
            </Button>
            <Button
              variant="primary"
              onClick={() => openEditAtStep(1)}
            >
              Modifier mon profil
            </Button>
          </div>
        </div>

        {/* Signalement discret des informations à compléter */}
        {missingFields.length > 0 && (
          <section className="bg-[#F5A17B]/15 border border-[#F5A17B]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#9A3412] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {missingFields.length} information{missingFields.length > 1 ? 's' : ''} à compléter pour affiner ton éligibilité
                </span>
              </div>
              <ul className="text-xs text-[#253047] space-y-0.5 pl-5 list-disc">
                {missingFields.map((item, idx) => (
                  <li key={idx}>{item.label}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openEditAtStep(missingFields[0].step)}
            >
              Compléter maintenant
            </Button>
          </section>
        )}

        {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
        <section className="bg-white border border-[#E6ECF5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-3.5">
              <div
                aria-hidden="true"
                className="w-14 h-14 rounded-2xl bg-[#3457D5] text-white font-bold text-lg flex items-center justify-center shrink-0"
              >
                {initials}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#203454]">
                  1. Informations personnelles
                </h2>
                <p className="text-xs text-[#69768C] mt-0.5">
                  Identité, nationalité et pays de résidence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/etudiant/confidentialite"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  currentStudent.institutionalVisibilityEnabled
                    ? 'bg-[#DDF5EB] text-[#14533C]'
                    : 'bg-[#F8FAFD] border border-[#E6ECF5] text-[#69768C] hover:text-[#203454]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {currentStudent.institutionalVisibilityEnabled
                    ? 'Visible par les organismes vérifiés'
                    : 'Visibilité : Privée'}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => openEditAtStep(1)}
                className="text-xs font-semibold text-[#3457D5] hover:text-[#203454] cursor-pointer"
              >
                Modifier
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Nom et prénom
              </dt>
              <dd className="font-bold text-[#203454] mt-1">
                {currentStudent.firstName} {currentStudent.lastName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Nationalité
              </dt>
              <dd className="font-bold text-[#203454] mt-1">
                {currentStudent.nationality || 'Non renseignée'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Pays de résidence
              </dt>
              <dd className="font-bold text-[#203454] mt-1">
                {currentStudent.residenceCountry || 'Non renseigné'}
                {currentStudent.city ? ` (${currentStudent.city})` : ''}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Année de naissance
              </dt>
              <dd className="font-bold text-[#203454] mt-1 tabular-nums">
                {currentStudent.birthYear || 'Non renseignée'}
              </dd>
            </div>
          </dl>
        </section>

        {/* SECTION 2 : PARCOURS ACADÉMIQUE */}
        <section className="bg-white border border-[#E6ECF5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3457D5]/10 text-[#3457D5] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#203454]">
                  2. Parcours académique
                </h2>
                <p className="text-xs text-[#69768C] mt-0.5">
                  Diplôme obtenu, niveau actuel, établissement, filière et résultats
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openEditAtStep(2)}
              className="text-xs font-semibold text-[#3457D5] hover:text-[#203454] cursor-pointer"
            >
              Modifier
            </button>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Dernier diplôme obtenu
              </dt>
              <dd className="mt-1">
                {currentStudent.highestDiplomaObtained ? (
                  <div>
                    <span className="font-bold text-[#203454]">
                      {currentStudent.highestDiplomaObtained}
                    </span>
                    {currentStudent.highestDiplomaName && (
                      <span className="block text-xs text-[#69768C] mt-0.5">
                        {currentStudent.highestDiplomaName}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(2)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Non renseigné · Compléter
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Niveau d’études actuel
              </dt>
              <dd className="mt-1">
                {currentStudent.currentStudyLevel ? (
                  <span className="font-bold text-[#203454]">
                    {currentStudent.currentStudyLevel}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(2)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Non renseigné · Compléter
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Établissement actuel
              </dt>
              <dd className="font-bold text-[#203454] mt-1">
                {currentStudent.currentInstitution || 'Non renseigné'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Filière / Domaine d’études
              </dt>
              <dd className="font-bold text-[#203454] mt-1">
                {currentStudent.studyDomain || 'Non renseigné'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Résultats académiques (Moyenne)
              </dt>
              <dd className="mt-1">
                {currentStudent.averageGrade !== null ? (
                  <span className="font-bold text-[#203454] tabular-nums">
                    {currentStudent.averageGrade}{' '}
                    {currentStudent.gradingScale === 'SUR_20'
                      ? '/ 20'
                      : currentStudent.gradingScale === 'GPA_4'
                      ? '/ 4.0 GPA'
                      : '%'}{' '}
                    {currentStudent.normalizedGradeOut20 !== null && (
                      <span className="text-xs text-[#69768C] font-normal">
                        ({currentStudent.normalizedGradeOut20.toFixed(1)}/20)
                      </span>
                    )}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(2)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Non renseignée · Compléter
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Langues & certifications
              </dt>
              <dd className="mt-1 space-y-1 text-xs">
                {currentStudent.languages.map((l, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span className="font-bold text-[#203454]">
                      {l.language} ({l.level})
                    </span>
                    {l.certification && l.certification.trim() ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#DDF5EB] text-[#14533C] text-[11px] font-semibold">
                        {l.certification}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditAtStep(3)}
                        className="text-[11px] font-medium text-[#9A3412] hover:underline cursor-pointer"
                      >
                        + Ajouter certificat
                      </button>
                    )}
                  </div>
                ))}
              </dd>
            </div>
          </dl>

          {/* Diplômes enregistrés (/students/me/academic-records — OpenAPI 1.1) */}
          <div className="pt-4 border-t border-[#E6ECF5] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-[#203454]">
                  Diplômes enregistrés ({currentStudent.academicRecords?.length || 0})
                </h3>
                <p className="text-[11px] text-[#69768C]">
                  Historique de tes diplômes validés pris en compte pour l’éligibilité académique.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddDiplomaOpen((prev) => !prev)}
              >
                {isAddDiplomaOpen ? 'Fermer' : '+ Ajouter un diplôme'}
              </Button>
            </div>

            {isAddDiplomaOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newDiplomaTitle.trim() || !newDiplomaInstitution.trim()) {
                    return;
                  }
                  const parsedG = parseFloat(newDiplomaGrade);
                  addStudentAcademicRecord({
                    diplomaLevel: newDiplomaLevel,
                    diplomaName: newDiplomaTitle.trim(),
                    institutionName: newDiplomaInstitution.trim(),
                    institutionCountry:
                      currentStudent.residenceCountry || 'Cameroun',
                    obtained: true,
                    completionYear: parseInt(newDiplomaYear, 10) || 2025,
                    gradingScale: newDiplomaScale,
                    grade: Number.isNaN(parsedG) ? null : parsedG,
                  });
                  setNewDiplomaTitle('');
                  setNewDiplomaInstitution('');
                  setIsAddDiplomaOpen(false);
                }}
                className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
              >
                <div>
                  <label className="block font-medium text-[#253047] mb-1">
                    Niveau du diplôme *
                  </label>
                  <select
                    value={newDiplomaLevel}
                    onChange={(e) =>
                      setNewDiplomaLevel(e.target.value as AcademicLevel)
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  >
                    {ACADEMIC_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#253047] mb-1">
                    Intitulé du diplôme *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDiplomaTitle}
                    onChange={(e) => setNewDiplomaTitle(e.target.value)}
                    placeholder="Ex: Baccalauréat C / Licence Informatique"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#253047] mb-1">
                    Établissement *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDiplomaInstitution}
                    onChange={(e) => setNewDiplomaInstitution(e.target.value)}
                    placeholder="Ex: Université de Yaoundé I"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#253047] mb-1">
                    Année d’obtention
                  </label>
                  <input
                    type="number"
                    value={newDiplomaYear}
                    onChange={(e) => setNewDiplomaYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#253047] mb-1">
                    Moyenne obtenue
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDiplomaGrade}
                    onChange={(e) => setNewDiplomaGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg tabular-nums"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block font-medium text-[#253047] mb-1">
                      Échelle
                    </label>
                    <select
                      value={newDiplomaScale}
                      onChange={(e) =>
                        setNewDiplomaScale(e.target.value as GradingScale)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-lg"
                    >
                      <option value="SUR_20">Sur 20</option>
                      <option value="GPA_4">GPA 4.0</option>
                      <option value="POURCENTAGE_100">/ 100 %</option>
                    </select>
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    Enregistrer
                  </Button>
                </div>
              </form>
            )}

            {currentStudent.academicRecords &&
            currentStudent.academicRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {currentStudent.academicRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#3457D5]/10 text-[#3457D5] font-bold text-[11px]">
                          {rec.diplomaLevel}
                        </span>
                        <span className="font-bold text-[#203454] truncate">
                          {rec.diplomaName}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#69768C] mt-1">
                        {rec.institutionName} · {rec.completionYear || 'Validé'}
                        {rec.grade !== null && rec.grade !== undefined
                          ? ` · Moyenne : ${rec.grade}${
                              rec.gradingScale === 'SUR_20'
                                ? '/20'
                                : rec.gradingScale === 'GPA_4'
                                ? '/4.0'
                                : '%'
                            }`
                          : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStudentAcademicRecord(rec.id)}
                      aria-label={`Supprimer le diplôme ${rec.diplomaName}`}
                      className="p-1.5 text-[#69768C] hover:text-[#B42318] transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#69768C]">
                Aucun diplôme détaillé enregistré pour le moment.
              </p>
            )}
          </div>
        </section>

        {/* SECTION 3 : PROJET D'ÉTUDES */}
        <section className="bg-white border border-[#E6ECF5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E6ECF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DDF5EB] text-[#14533C] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#203454]">
                  3. Projet d’études
                </h2>
                <p className="text-xs text-[#69768C] mt-0.5">
                  Formation recherchée, destinations souhaitées et préférences de financement
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openEditAtStep(4)}
              className="text-xs font-semibold text-[#3457D5] hover:text-[#203454] cursor-pointer"
            >
              Modifier mes préférences
            </button>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Formation recherchée (cycle à financer)
              </dt>
              <dd className="mt-1.5">
                {currentStudent.targetStudyLevel ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#3457D5]/10 text-[#3457D5] text-xs font-bold">
                    {currentStudent.targetStudyLevel}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(2)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Non renseignée · Compléter
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Destinations souhaitées
              </dt>
              <dd className="mt-1.5">
                {currentStudent.preferredDestinationCountries.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentStudent.preferredDestinationCountries.map(
                      (country) => (
                        <span
                          key={country}
                          className="px-3 py-1 rounded-xl bg-[#F8FAFD] border border-[#E6ECF5] text-xs font-semibold text-[#203454]"
                        >
                          {country}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(4)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Aucune destination définie · Choisir
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-[#69768C]">
                Préférences de financement
              </dt>
              <dd className="mt-1.5">
                {currentStudent.preferredFundingTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentStudent.preferredFundingTypes.map((funding) => (
                      <span
                        key={funding}
                        className="px-3 py-1 rounded-xl bg-[#DDF5EB]/70 text-[#14533C] text-xs font-semibold"
                      >
                        {funding}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditAtStep(4)}
                    className="text-xs font-semibold text-[#9A3412] underline cursor-pointer"
                  >
                    Aucune préférence définie · Choisir
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    );
  }

  // ============================================================================
  // EXPÉRIENCE 2 : MODIFIER MON PROFIL (Formulaire progressif en 4 étapes)
  // ============================================================================
  return (
    <div className="space-y-6">
      <ProfilSubNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-[#3457D5] hover:text-[#203454] mb-1.5 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>← Retour à la consultation de mon profil</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
            Modifier mon profil
          </h1>
          <p className="text-sm text-[#69768C] mt-0.5">
            Mets à jour tes informations par étapes. Les champs marqués d’un astérisque (*) sont obligatoires.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSearchParams({})}
          >
            Consulter mon profil
          </Button>
        </div>
      </div>

      <AcademicTriptych
        highestDiplomaObtained={highestDiplomaObtained}
        highestDiplomaName={highestDiplomaName}
        currentStudyLevel={currentStudyLevel}
        currentInstitution={currentInstitution}
        targetStudyLevel={targetStudyLevel}
        studyDomain={studyDomain}
      />

      {/* Barre d'étapes du formulaire progressif */}
      <div className="bg-white border border-[#E6ECF5] rounded-2xl p-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
        {[
          { num: 1, title: '01. Identité & Résidence' },
          { num: 2, title: '02. Parcours & Moyenne' },
          { num: 3, title: '03. Langues & Certificats' },
          { num: 4, title: '04. Mes préférences' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => openEditAtStep(s.num)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
              step === s.num
                ? 'bg-[#3457D5] text-white'
                : 'bg-[#F8FAFD] text-[#253047] hover:bg-[#3457D5]/10'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {validationError && (
          <div className="p-3.5 bg-[#B42318]/10 border border-[#B42318]/30 rounded-xl text-xs font-medium text-[#B42318]">
            {validationError}
          </div>
        )}

        {step === 1 && (
          <Panel
            title="Étape 1 — Identité, Nationalité et Pays de résidence"
            subtitle="Ces informations déterminent ton éligibilité géographique aux programmes de bourses."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label
                  htmlFor="stu-firstname"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Prénom (Obligatoire) *
                </label>
                <input
                  id="stu-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="stu-lastname"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Nom de famille (Obligatoire) *
                </label>
                <input
                  id="stu-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="stu-nationality"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Nationalité officielle (Obligatoire) *
                </label>
                <select
                  id="stu-nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="Cameroun">Cameroun</option>
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d’Ivoire">Côte d’Ivoire</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Autre">Autre nationalité</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="stu-residence"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Pays de résidence actuel (Obligatoire) *
                </label>
                <select
                  id="stu-residence"
                  value={residenceCountry}
                  onChange={(e) => setResidenceCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="Cameroun">Cameroun</option>
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d’Ivoire">Côte d’Ivoire</option>
                  <option value="France">France</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="stu-city"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Ville de résidence (Facultatif)
                </label>
                <input
                  id="stu-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="stu-birthyear"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Année de naissance
                </label>
                <input
                  id="stu-birthyear"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono tabular-nums"
                />
              </div>
            </div>
          </Panel>
        )}

        {step === 2 && (
          <Panel
            title="Étape 2 — Parcours Académique, Diplômes et Moyenne"
            subtitle="Distingue le diplôme déjà validé, ton niveau actuel et la formation que tu souhaites financer."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pb-5 mb-5 border-b border-[#E6ECF5]">
              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-2">
                <label
                  htmlFor="stu-diploma-obtained"
                  className="block font-semibold text-[#203454]"
                >
                  1. Diplôme déjà obtenu *
                </label>
                <select
                  id="stu-diploma-obtained"
                  value={highestDiplomaObtained}
                  onChange={(e) =>
                    setHighestDiplomaObtained(e.target.value as AcademicLevel)
                  }
                  className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="">-- Sélectionner --</option>
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={highestDiplomaName}
                  onChange={(e) => setHighestDiplomaName(e.target.value)}
                  placeholder="Intitulé précis du diplôme obtenu"
                  aria-label="Intitulé précis du diplôme obtenu"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-2">
                <label
                  htmlFor="stu-current-level"
                  className="block font-semibold text-[#253047]"
                >
                  2. Niveau d’études actuel *
                </label>
                <select
                  id="stu-current-level"
                  value={currentStudyLevel}
                  onChange={(e) =>
                    setCurrentStudyLevel(e.target.value as AcademicLevel)
                  }
                  className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="">-- Sélectionner --</option>
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#69768C]">
                  Ta classe ou cycle en cours cette année académique.
                </p>
              </div>

              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-2">
                <label
                  htmlFor="stu-target-level"
                  className="block font-semibold text-[#3457D5]"
                >
                  3. Formation recherchée *
                </label>
                <select
                  id="stu-target-level"
                  value={targetStudyLevel}
                  onChange={(e) =>
                    setTargetStudyLevel(e.target.value as AcademicLevel)
                  }
                  className="w-full px-2.5 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="">-- Sélectionner --</option>
                  {ACADEMIC_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#69768C]">
                  Le cycle pour lequel tu demandes une bourse d’études.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label
                  htmlFor="stu-domain"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Domaine de formation *
                </label>
                <select
                  id="stu-domain"
                  value={studyDomain}
                  onChange={(e) =>
                    setStudyDomain(e.target.value as StudyDomain)
                  }
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
                  htmlFor="stu-institution"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Établissement *
                </label>
                <input
                  id="stu-institution"
                  type="text"
                  value={currentInstitution}
                  onChange={(e) => setCurrentInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="stu-grade"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Moyenne académique *
                </label>
                <input
                  id="stu-grade"
                  type="number"
                  step="0.1"
                  value={averageGrade}
                  onChange={(e) => setAverageGrade(e.target.value)}
                  placeholder="Ex: 15.4"
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono tabular-nums"
                />
              </div>

              <div>
                <label
                  htmlFor="stu-scale"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Échelle de notation *
                </label>
                <select
                  id="stu-scale"
                  value={gradingScale}
                  onChange={(e) =>
                    setGradingScale(e.target.value as GradingScale)
                  }
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                >
                  <option value="SUR_20">Moyenne sur 20 (Système francophone / Cameroun)</option>
                  <option value="GPA_4">GPA sur 4.0 (Système anglophone / Buea / Bamenda)</option>
                  <option value="POURCENTAGE_100">Pourcentage sur 100 (%)</option>
                </select>
              </div>
            </div>
          </Panel>
        )}

        {step === 3 && (
          <Panel
            title="Étape 3 — Compétences linguistiques et Certifications officielles"
            subtitle="Renseigne tes niveaux (CECRL : A1 à C2) ainsi que tes attestations (IELTS, TOEFL, DALF, TCF, Goethe)."
          >
            <div className="space-y-3 text-xs">
              {languages.map((lang, idx) => (
                <div
                  key={`${lang.language}-${idx}`}
                  className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
                >
                  <div>
                    <span className="block text-[#69768C] mb-1">Langue</span>
                    <div className="font-semibold text-[#203454] py-1.5">
                      {lang.language}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor={`lang-level-${idx}`}
                      className="block text-[#69768C] mb-1"
                    >
                      Niveau maîtrisé
                    </label>
                    <select
                      id={`lang-level-${idx}`}
                      value={lang.level}
                      onChange={(e) =>
                        updateLanguageLevel(
                          idx,
                          e.target.value as LanguageLevel
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                    >
                      {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'] as LanguageLevel[]).map(
                        (lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`lang-cert-${idx}`}
                      className="block text-[#69768C] mb-1"
                    >
                      Certification officielle (Facultatif sauf bourse exigeante)
                    </label>
                    <input
                      id={`lang-cert-${idx}`}
                      type="text"
                      value={lang.certification || ''}
                      onChange={(e) =>
                        updateLanguageCert(idx, e.target.value)
                      }
                      placeholder="Ex: IELTS 6.5 ou TOEFL 98"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E6ECF5] rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {step === 4 && (
          <Panel
            title="Étape 4 — Mes préférences (Pays de destination & Financement)"
            subtitle="Ces préférences orientent tes recommandations sans restreindre tes recherches manuelles."
          >
            <div className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="stu-pref-countries"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Pays de destination souhaités (séparés par une virgule)
                </label>
                <input
                  id="stu-pref-countries"
                  type="text"
                  value={preferredCountries}
                  onChange={(e) => setPreferredCountries(e.target.value)}
                  placeholder="France, Canada, Allemagne, Suisse, Cameroun"
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <div className="font-medium text-[#253047] mb-2">
                  Préférences de financement
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FUNDING_TYPES.map((ft) => {
                    const checked = preferredFundingTypes.includes(ft);
                    return (
                      <label
                        key={ft}
                        className="flex items-center gap-2 p-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferredFundingTypes([
                                ...preferredFundingTypes,
                                ft,
                              ]);
                            } else {
                              setPreferredFundingTypes(
                                preferredFundingTypes.filter((x) => x !== ft)
                              );
                            }
                          }}
                        />
                        <span>{ft}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => openEditAtStep(step - 1)}
              >
                Étape précédente
              </Button>
            )}
            {step < 4 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => openEditAtStep(step + 1)}
              >
                Étape suivante
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSearchParams({})}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Enregistrer et consulter mon profil
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

/**
 * 3. VÉRIFICATION D'ÉLIGIBILITÉ (/etudiant/eligibilite)
 */
export const StudentEligibilityPage: React.FC = () => {
  const {
    scholarships,
    currentStudent,
    evaluateForCurrentStudent,
    updateStudentProfile,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedId =
    searchParams.get('scholarshipId') || scholarships[0]?.id || 'sch-1';
  const selectedScholarship =
    scholarships.find((s) => s.id === selectedId) || scholarships[0];

  const report = evaluateForCurrentStudent(selectedScholarship);

  // Action rapide pour démontrer la résolution immédiate d'un statut "À compléter" (ex: ajout IELTS 6.5)
  const handleQuickAddEnglishCert = () => {
    const updatedLanguages = currentStudent.languages.map((l) =>
      l.language === 'Anglais' ? { ...l, certification: 'IELTS Academic 6.5' } : l
    );
    updateStudentProfile(currentStudent.id, { languages: updatedLanguages });
  };

  return (
    <div className="space-y-6">
      <PourMoiSubNav />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
          Vérifier mon éligibilité
        </h1>
        <p className="text-sm sm:text-base text-[#69768C] mt-1">
          Compare ton profil académique critère par critère avec n’importe quelle bourse du catalogue.
        </p>
      </div>

      {/* Sélecteur de bourse */}
      <div className="bg-white border border-[#E6ECF5] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-9">
            <label
              htmlFor="select-eligibility-scholarship"
              className="block text-xs font-semibold text-[#69768C] mb-1.5"
            >
              Choisir une bourse à évaluer :
            </label>
            <select
              id="select-eligibility-scholarship"
              value={selectedScholarship.id}
              onChange={(e) =>
                setSearchParams({ scholarshipId: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — ({s.hostCountry} · Date limite : {s.deadline})
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/bourses/${selectedScholarship.id}`)}
            >
              Voir la bourse
            </Button>
          </div>
        </div>
      </div>

      {/* Résultat Global Explicable */}
      <div className="bg-white border border-[#E6ECF5] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6ECF5]">
          <div className="space-y-1">
            <div className="text-xs text-[#69768C]">
              Profil évalué :{' '}
              <strong className="text-[#253047]">
                {currentStudent.firstName} {currentStudent.lastName}
              </strong>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#203454]">
              {selectedScholarship.title}
            </h2>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <EligibilityVerdictIndicator verdict={report.verdict} />
            <span className="text-xs tabular-nums text-[#69768C]">
              {report.satisfiedCount} / {report.totalMandatoryCount} critères
              validés
            </span>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs space-y-2">
          <p className="text-[#253047] leading-relaxed">
            {report.summaryExplanation}
          </p>
          {report.warnings.map((w, idx) => (
            <p key={idx} className="text-[#9A421D] font-medium">
              Note : {w}
            </p>
          ))}
        </div>

        {/* Bouton d'aide contextuelle si le verdict est "À compléter" */}
        {report.verdict === 'TO_COMPLETE' && (
          <div className="p-3.5 bg-[#F5A17B]/15 border border-[#F5A17B]/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-[#253047]">
              <strong>Information manquante :</strong> Complète ton profil pour
              mettre à jour ton éligibilité.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="copper"
                size="sm"
                onClick={handleQuickAddEnglishCert}
              >
                Ajouter un certificat IELTS 6.5
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/etudiant/profil?step=3')}
              >
                Compléter mon profil
              </Button>
            </div>
          </div>
        )}

        {/* Tableau comparatif critère par critère */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6ECF5] bg-[#F8FAFD] text-[#203454]">
                <th className="py-3 px-3 font-semibold">Critère</th>
                <th className="py-3 px-3 font-semibold">Demandé</th>
                <th className="py-3 px-3 font-semibold">Ton profil</th>
                <th className="py-3 px-3 font-semibold">Statut</th>
                <th className="py-3 px-3 font-semibold">Explication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECF5]">
              {report.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFD]/70">
                  <td className="py-3 px-3 font-semibold text-[#253047]">
                    {item.label}
                  </td>
                  <td className="py-3 px-3 text-[#253047] tabular-nums">
                    {item.expectedValue}
                  </td>
                  <td className="py-3 px-3 text-[#203454] font-medium tabular-nums">
                    {item.studentValue}
                  </td>
                  <td className="py-3 px-3">
                    <CriterionStatusText status={item.status} />
                  </td>
                  <td className="py-3 px-3 text-[#69768C] max-w-xs leading-relaxed">
                    {item.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mention légale obligatoire de non-garantie */}
        <div className="pt-3 border-t border-[#E6ECF5] text-[11px] text-[#69768C]">
          {report.legalDisclaimer}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. BOURSES RECOMMANDÉES (/etudiant/recommandations)
 * Strictement différenciée du catalogue public :
 * - Affiche en tête les critères actifs du profil étudiant pris en compte
 * - Filtre uniquement les bourses compatibles avec le parcours académique (diplôme obtenu, formation recherchée) et le domaine d'études
 * - Classe en deux groupes distincts :
 *   1) Forte pertinence — Tous les critères académiques et le domaine sont validés (Potentiellement compatible & vérifiée)
 *   2) Opportunités à compléter ou à vérifier — Pertinentes pour le domaine/niveau mais nécessitant un justificatif ou une vérification
 * - Explique clairement « Pourquoi cette bourse t'est recommandée » sur chaque carte
 */
export const StudentRecommendationsPage: React.FC = () => {
  const {
    scholarships,
    currentStudent,
    evaluateForCurrentStudent,
    toggleSavedScholarship,
  } = useApp();
  const navigate = useNavigate();

  const evaluatedRecommendations = useMemo(() => {
    return scholarships
      .filter(
        (s) =>
          s.status !== 'EXPIRED' &&
          s.status !== 'DRAFT' &&
          s.curationStatus !== 'ARCHIVED' &&
          (!s.publicationStatus || s.publicationStatus === 'PUBLISHED')
      )
      .map((s) => {
        const report = evaluateForCurrentStudent(s);

        const stuDomain = currentStudent.studyDomain;
        const stuTarget = currentStudent.targetStudyLevel;
        const stuDiploma = currentStudent.highestDiplomaObtained;

        // Vérification stricte de la cohérence académique et disciplinaire
        const matchesDomain =
          stuDomain !== '' &&
          (s.criteria.eligibleDomains.includes(stuDomain) ||
            s.criteria.eligibleDomains.includes('Tous domaines'));

        const matchesTargetLevel =
          stuTarget !== '' &&
          s.criteria.targetStudyLevels.includes(stuTarget);

        const matchesDiplomaObtained =
          stuDiploma !== '' &&
          s.criteria.requiredDiplomaObtained.includes(stuDiploma);

        const matchesDestinationPref =
          currentStudent.preferredDestinationCountries.includes(s.hostCountry);

        const matchesFundingPref =
          currentStudent.preferredFundingTypes.includes(s.fundingType);

        // Construction des raisons explicites de recommandation
        const reasons: string[] = [];
        if (matchesDiplomaObtained) {
          reasons.push(
            `Diplôme requis validé (${stuDiploma})`
          );
        }
        if (matchesTargetLevel) {
          reasons.push(
            `Finance ton objectif (${stuTarget})`
          );
        }
        if (matchesDomain && stuDomain) {
          reasons.push(
            s.criteria.eligibleDomains.includes(stuDomain)
              ? `Cible ta filière (${stuDomain})`
              : `Ouverte à ta filière (${stuDomain})`
          );
        }
        if (matchesDestinationPref) {
          reasons.push(`Destination souhaitée (${s.hostCountry})`);
        }
        if (matchesFundingPref) {
          reasons.push(`Type de financement souhaité (${s.fundingType})`);
        }

        const missingItems = report.items.filter(
          (i) =>
            i.status === 'MISSING_INFO' || i.status === 'AMBIGUOUS_TO_VERIFY'
        );

        const preferenceScore =
          (matchesDestinationPref ? 2 : 0) +
          (matchesFundingPref ? 1 : 0) +
          (stuDomain !== '' && s.criteria.eligibleDomains.includes(stuDomain)
            ? 2
            : 1);

        return {
          scholarship: s,
          report,
          matchesDomain,
          matchesTargetLevel,
          matchesDiplomaObtained,
          matchesDestinationPref,
          matchesFundingPref,
          reasons,
          missingItems,
          preferenceScore,
        };
      })
      .filter(
        (item) =>
          item.report.verdict !== 'INCOMPATIBLE' &&
          item.matchesDomain &&
          item.matchesTargetLevel &&
          item.matchesDiplomaObtained
      )
      .sort((a, b) => b.preferenceScore - a.preferenceScore);
  }, [scholarships, currentStudent]);

  // Groupe 1 : Forte pertinence (Tous critères validés + annonce vérifiée)
  const strongMatchRecommendations = useMemo(
    () =>
      evaluatedRecommendations.filter(
        (item) =>
          item.report.verdict === 'POTENTIALLY_COMPATIBLE' &&
          item.scholarship.curationStatus === 'VERIFIED'
      ),
    [evaluatedRecommendations]
  );

  // Groupe 2 : Opportunités compatibles avec le parcours mais nécessitant un complément de profil ou une vérification
  const toCompleteRecommendations = useMemo(
    () =>
      evaluatedRecommendations.filter(
        (item) =>
          item.report.verdict !== 'POTENTIALLY_COMPATIBLE' ||
          item.scholarship.curationStatus !== 'VERIFIED'
      ),
    [evaluatedRecommendations]
  );

  return (
    <div className="space-y-6">
      <PourMoiSubNav />

      {/* En-tête différencié du catalogue */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
            Recommandations personnalisées
          </h1>
          <p className="text-sm sm:text-base text-[#69768C] mt-1">
            Contrairement au catalogue complet, cette sélection retient uniquement les bourses adaptées à ton parcours et à ton domaine.
          </p>
        </div>
        <Link
          to="/etudiant/recherche"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3457D5] hover:text-[#203454] shrink-0"
        >
          <span>Explorer tout le catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bandeau synthèse : Critères du profil utilisés pour la sélection */}
      <section
        aria-label="Critères de ton profil pris en compte"
        className="bg-white border border-[#E6ECF5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#203454] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3457D5]" />
            <span>Critères de ton profil appliqués automatiquement :</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-[#F8FAFD] border border-[#E6ECF5] text-[#253047]">
              Diplôme obtenu :{' '}
              <strong className="text-[#203454]">
                {currentStudent.highestDiplomaObtained || 'Non renseigné'}
              </strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#3457D5]/10 text-[#3457D5]">
              Formation recherchée :{' '}
              <strong>
                {currentStudent.targetStudyLevel || 'Non renseignée'}
              </strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#F8FAFD] border border-[#E6ECF5] text-[#253047]">
              Filière :{' '}
              <strong className="text-[#203454]">
                {currentStudent.studyDomain || 'Non renseignée'}
              </strong>
            </span>
            {currentStudent.preferredDestinationCountries.length > 0 && (
              <span className="px-3 py-1 rounded-xl bg-[#DDF5EB]/70 text-[#14533C]">
                Destinations souhaitées :{' '}
                <strong>
                  {currentStudent.preferredDestinationCountries.join(', ')}
                </strong>
              </span>
            )}
          </div>
        </div>

        <Link
          to="/etudiant/profil?mode=edit&step=4"
          className="px-3.5 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#E6ECF5]/60 border border-[#E6ECF5] text-xs font-semibold text-[#253047] transition-colors shrink-0 self-start lg:self-center"
        >
          Ajuster mon projet d’études
        </Link>
      </section>

      {/* GROUPE 1 : FORTE PERTINENCE */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#203454]">
              Forte pertinence pour ton profil ({strongMatchRecommendations.length})
            </h2>
            <p className="text-xs text-[#69768C]">
              Tous les critères académiques obligatoires sont validés sur ton profil.
            </p>
          </div>
        </div>

        {strongMatchRecommendations.length === 0 ? (
          <div className="bg-white border border-[#E6ECF5] rounded-2xl p-6 text-center space-y-2">
            <p className="text-xs font-semibold text-[#203454]">
              Aucune bourse ne valide encore 100 % des critères obligatoires.
            </p>
            <p className="text-xs text-[#69768C]">
              Consulte les opportunités à compléter ci-dessous ou renseigne les informations manquantes de ton profil.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strongMatchRecommendations.map(
              ({ scholarship, report, reasons }) => {
                const isSaved = currentStudent.savedScholarshipIds.includes(
                  scholarship.id
                );
                return (
                  <article
                    key={scholarship.id}
                    className="bg-white border border-[#E6ECF5] hover:border-[#3457D5]/40 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs transition-colors min-w-0"
                  >
                    <div className="space-y-3.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <EligibilityVerdictIndicator verdict={report.verdict} />
                        <button
                          type="button"
                          onClick={() => toggleSavedScholarship(scholarship.id)}
                          aria-label={
                            isSaved
                              ? 'Retirer des favoris'
                              : 'Ajouter aux favoris'
                          }
                          className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                            isSaved
                              ? 'bg-[#3457D5] border-[#3457D5] text-white'
                              : 'bg-[#F8FAFD] border-[#E6ECF5] text-[#69768C] hover:text-[#3457D5]'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#203454] leading-snug">
                          <Link
                            to={`/bourses/${scholarship.id}`}
                            className="hover:text-[#3457D5]"
                          >
                            {scholarship.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-[#69768C] mt-1">
                          {scholarship.organizationName} ·{' '}
                          <strong className="text-[#203454]">
                            {scholarship.hostCountry}
                          </strong>{' '}
                          · Date limite :{' '}
                          <span className="tabular-nums font-semibold">
                            {scholarship.deadline}
                          </span>
                        </p>
                      </div>

                      {/* Pourquoi cette bourse t'est recommandée */}
                      <div className="p-3.5 bg-[#DDF5EB]/45 border border-[#14533C]/15 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-[#14533C]">
                          Pourquoi cette bourse t’est recommandée :
                        </div>
                        <ul className="space-y-1 text-xs text-[#203454]">
                          {reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#14533C] shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E6ECF5] flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate(
                            `/etudiant/eligibilite?scholarshipId=${scholarship.id}`
                          )
                        }
                      >
                        Détail ({report.satisfiedCount}/
                        {report.totalMandatoryCount})
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/bourses/${scholarship.id}`)}
                      >
                        Voir la bourse
                      </Button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* GROUPE 2 : OPPORTUNITÉS À COMPLÉTER OU À VÉRIFIER */}
      {toCompleteRecommendations.length > 0 && (
        <section className="space-y-3.5 pt-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#203454]">
              Compatibles avec ta filière mais à compléter ({toCompleteRecommendations.length})
            </h2>
            <p className="text-xs text-[#69768C]">
              Ces bourses correspondent à ton parcours ({currentStudent.targetStudyLevel} · {currentStudent.studyDomain}), mais un justificatif ou un critère reste à compléter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {toCompleteRecommendations.map(
              ({ scholarship, report, reasons, missingItems }) => {
                const isSaved = currentStudent.savedScholarshipIds.includes(
                  scholarship.id
                );
                return (
                  <article
                    key={scholarship.id}
                    className="bg-white border border-[#E6ECF5] hover:border-[#3457D5]/40 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs transition-colors min-w-0"
                  >
                    <div className="space-y-3.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <EligibilityVerdictIndicator verdict={report.verdict} />
                        <button
                          type="button"
                          onClick={() => toggleSavedScholarship(scholarship.id)}
                          aria-label={
                            isSaved
                              ? 'Retirer des favoris'
                              : 'Ajouter aux favoris'
                          }
                          className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                            isSaved
                              ? 'bg-[#3457D5] border-[#3457D5] text-white'
                              : 'bg-[#F8FAFD] border-[#E6ECF5] text-[#69768C] hover:text-[#3457D5]'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#203454] leading-snug">
                          <Link
                            to={`/bourses/${scholarship.id}`}
                            className="hover:text-[#3457D5]"
                          >
                            {scholarship.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-[#69768C] mt-1">
                          {scholarship.organizationName} ·{' '}
                          <strong className="text-[#203454]">
                            {scholarship.hostCountry}
                          </strong>{' '}
                          · Date limite :{' '}
                          <span className="tabular-nums font-semibold">
                            {scholarship.deadline}
                          </span>
                        </p>
                      </div>

                      {/* Pourquoi cette bourse apparaît + Ce qu'il manque */}
                      <div className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-2 text-xs">
                        <div className="font-bold text-[#203454]">
                          Correspondance avec ton parcours :
                        </div>
                        <ul className="space-y-1 text-[#253047]">
                          {reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#3457D5] shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>

                        {missingItems.length > 0 && (
                          <div className="pt-2 border-t border-[#E6ECF5] text-[#9A3412]">
                            <strong>Élément à compléter :</strong>{' '}
                            {missingItems[0].explanation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E6ECF5] flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          navigate(
                            `/etudiant/eligibilite?scholarshipId=${scholarship.id}`
                          )
                        }
                      >
                        Vérifier quoi compléter
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/bourses/${scholarship.id}`)}
                      >
                        Voir la bourse
                      </Button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      )}
    </div>
  );
};

/**
 * 5. MES INVITATIONS (/etudiant/invitations)
 */
export const StudentInvitationsPage: React.FC = () => {
  const { currentStudent, invitations, respondToInvitation } = useApp();
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | null
  >(null);
  const [responseNote, setResponseNote] = useState('');

  const myInvitations = invitations.filter(
    (i) => i.studentId === currentStudent.id
  );
  const activeInvitation = myInvitations.find(
    (i) => i.id === selectedInvitationId
  );

  return (
    <div className="space-y-6">
      <ActivitesSubNav />

      <PageHeader
        kicker="MISE EN RELATION SÉCURISÉE ÉTUDIANT — ORGANISME"
        title="Mes invitations reçues"
        subtitle="Les organismes financeurs vérifiés peuvent t'inviter à consulter un programme. Aucune coordonnée privée ni aucun dossier n’est transmis sans ton acceptation explicite."
      />

      {myInvitations.length === 0 ? (
        <Panel>
          <p className="text-xs text-[#69768C] py-6 text-center">
            Aucune invitation reçue pour ce profil étudiant.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {myInvitations.map((inv) => (
            <Panel
              key={inv.id}
              title={inv.scholarshipTitle}
              subtitle={`Émise par : ${inv.organizationName} · Reçue le ${inv.sentAt}`}
              headerRight={
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                    inv.status === 'PENDING'
                      ? 'bg-[#9A421D]/10 text-[#9A421D] border-[#9A421D]/30'
                      : inv.status === 'ACCEPTED'
                      ? 'bg-[#14533C]/10 text-[#14533C] border-[#14533C]/30'
                      : 'bg-[#B42318]/10 text-[#B42318] border-[#B42318]/30'
                  }`}
                >
                  {inv.status === 'PENDING'
                    ? 'En attente de ta réponse'
                    : inv.status === 'ACCEPTED'
                    ? 'Invitation acceptée (Dossier partagé)'
                    : 'Invitation refusée'}
                </span>
              }
            >
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl leading-relaxed text-[#253047]">
                  <div className="font-semibold text-[#203454] mb-1">
                    Message de l’organisme financeur :
                  </div>
                  {inv.message}
                </div>

                {inv.respondedAt && (
                  <div className="text-[#69768C]">
                    Réponse enregistrée le <strong>{inv.respondedAt}</strong> :{' '}
                    <em>{inv.studentResponseNote}</em>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6ECF5]">
                  <Link
                    to={`/bourses/${inv.scholarshipId}`}
                    className="font-semibold text-[#203454] underline"
                  >
                    Consulter les conditions du programme →
                  </Link>

                  {inv.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          respondToInvitation(
                            inv.id,
                            false,
                            'Je décline respectueusement cette invitation.'
                          )
                        }
                      >
                        Refuser l’invitation
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedInvitationId(inv.id);
                          setResponseNote(
                            'J’accepte cette invitation et autorise la transmission de mon profil académique pour examen.'
                          );
                        }}
                      >
                        Accepter & Partager mon dossier
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Modale de consentement spécifique avant le partage d'informations avec un organisme */}
      <Modal
        isOpen={Boolean(activeInvitation)}
        onClose={() => setSelectedInvitationId(null)}
        title="Consentement de partage de dossier avec l’organisme"
        subtitle="Conformité à la Loi camerounaise n° 2024/017 relative à la protection des données personnelles"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedInvitationId(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (activeInvitation) {
                  respondToInvitation(activeInvitation.id, true, responseNote);
                  setSelectedInvitationId(null);
                }
              }}
            >
              Confirmer mon consentement et accepter
            </Button>
          </>
        }
      >
        {activeInvitation && (
          <div className="space-y-4 text-xs text-[#253047]">
            <p className="leading-relaxed">
              En acceptant l’invitation de{' '}
              <strong>{activeInvitation.organizationName}</strong> pour le
              programme <strong>{activeInvitation.scholarshipTitle}</strong>,
              vous consentez expressément à ce que vos informations académiques
              (identité, diplôme obtenu, niveau actuel, moyenne et compétences
              linguistiques) soient transmises au comité d’évaluation de cet
              organisme.
            </p>
            <div>
              <label
                htmlFor="inv-consent-note"
                className="block font-medium mb-1"
              >
                Message d’accompagnement (facultatif) :
              </label>
              <textarea
                id="inv-consent-note"
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/**
 * 6. MES FAVORIS (/etudiant/favoris) ET NOTIFICATIONS (/etudiant/notifications)
 */
export const StudentFavoritesPage: React.FC = () => {
  const {
    scholarships,
    currentStudent,
    toggleSavedScholarship,
    evaluateForCurrentStudent,
  } = useApp();
  const navigate = useNavigate();

  const savedScholarships = scholarships.filter((s) =>
    currentStudent.savedScholarshipIds.includes(s.id)
  );

  return (
    <div className="space-y-6">
      <ActivitesSubNav />

      <PageHeader
        kicker="SUIVI DES ÉCHÉANCES"
        title="Mes bourses favorites"
        subtitle="Retrouve les offres que tu as enregistrées afin de préparer tes pièces justificatives avant la date de clôture."
      />

      {savedScholarships.length === 0 ? (
        <Panel>
          <div className="py-8 text-center space-y-3 text-xs">
            <p className="font-semibold text-[#253047]">
              Aucune bourse enregistrée dans tes favoris.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/etudiant/recherche')}
            >
              Parcourir le catalogue
            </Button>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {savedScholarships.map((sch) => {
            const report = evaluateForCurrentStudent(sch);
            return (
              <Panel
                key={sch.id}
                title={sch.title}
                subtitle={`${sch.organizationName} · Pays : ${sch.hostCountry} · Date limite : ${sch.deadline}`}
                headerRight={<EligibilityVerdictIndicator verdict={report.verdict} />}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#69768C]">
                    Couverture : <strong>{sch.financialSummary}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleSavedScholarship(sch.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Retirer des favoris
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        navigate(`/etudiant/eligibilite?scholarshipId=${sch.id}`)
                      }
                    >
                      Vérifier mon éligibilité
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const StudentNotificationsPage: React.FC = () => {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const navigate = useNavigate();

  const myNotifs = notifications.filter((n) => n.userId === currentUser.id);

  return (
    <div className="space-y-6">
      <ActivitesSubNav />

      <PageHeader
        kicker="ALERTES D’ÉCHÉANCES & INVITATIONS"
        title="Mes notifications"
        subtitle="Suis les rappels de dates limites, les invitations reçues et les nouvelles bourses vérifiées."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
          >
            Tout marquer comme lu
          </Button>
        }
      />

      <Panel noPadding>
        {myNotifs.length === 0 ? (
          <p className="p-6 text-xs text-[#69768C] text-center">
            Aucune notification.
          </p>
        ) : (
          <div className="divide-y divide-[#E6ECF5]">
            {myNotifs.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  n.read ? 'bg-white' : 'bg-[#3457D5]/10/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#203454]">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="text-[11px] font-semibold text-[#3457D5]">
                        · Non lue
                      </span>
                    )}
                  </div>
                  <p className="text-[#253047]">{n.message}</p>
                  <span className="text-[11px] text-[#69768C] font-mono tabular-nums">
                    {n.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markNotificationRead(n.id)}
                    >
                      Marquer lu
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      markNotificationRead(n.id);
                      navigate(n.linkTo);
                    }}
                  >
                    Consulter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

/**
 * 7. PARAMÈTRES ET CONFIDENTIALITÉ (/etudiant/confidentialite)
 */
export const StudentPrivacyPage: React.FC = () => {
  const {
    currentStudent,
    toggleInstitutionalVisibility,
    auditLogs,
    resetDemoData,
  } = useApp();

  return (
    <div className="space-y-6">
      <ProfilSubNav />

      <PageHeader
        kicker="PROTECTION DES DONNÉES À CARACTÈRE PERSONNEL (LOI CAMEROUNAISE N° 2024/017)"
        title="Confidentialité et visibilité du profil"
        subtitle="Contrôle qui peut découvrir ton profil académique. Par défaut, ton dossier est strictement privé."
      />

      <Panel
        title="Visibilité auprès des organismes financeurs vérifiés"
        subtitle="Autorisation volontaire et révocable à tout moment"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="font-semibold text-[#203454] text-sm">
                Statut actuel :{' '}
                {currentStudent.institutionalVisibilityEnabled
                  ? 'Visibilité institutionnelle ACTIVÉE'
                  : 'Profil PRIVÉ (Configuration par défaut)'}
              </div>
              <p className="text-[#69768C] leading-relaxed">
                Lorsque la visibilité est activée, seuls les organismes
                financeurs préalablement vérifiés peuvent voir ton parcours
                académique sous un identifiant anonymisé (sans ton adresse
                e-mail ni tes documents privés) afin de t’envoyer une
                invitation.
              </p>
            </div>

            <Button
              variant={
                currentStudent.institutionalVisibilityEnabled
                  ? 'danger'
                  : 'primary'
              }
              onClick={() =>
                toggleInstitutionalVisibility(
                  !currentStudent.institutionalVisibilityEnabled
                )
              }
            >
              {currentStudent.institutionalVisibilityEnabled
                ? 'Retirer l’autorisation (Repasser en Privé)'
                : 'Activer ma visibilité institutionnelle'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3.5 border border-[#E6ECF5] rounded-xl">
            <div>
              <div className="font-semibold text-[#253047]">
                Autoriser l’utilisation de ma moyenne académique dans les filtres organismes
              </div>
              <p className="text-[#69768C]">
                Permet aux organismes de filtrer ton profil lorsqu’une bourse
                impose un seuil minimal de moyenne.
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Autoriser le filtrage par moyenne académique"
              checked={currentStudent.allowAcademicScoreSharing}
              onChange={(e) =>
                toggleInstitutionalVisibility(
                  currentStudent.institutionalVisibilityEnabled,
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />
          </div>

          {currentStudent.isMinor && (
            <div className="p-3.5 bg-[#3457D5]/10 border border-[#203454]/30 rounded text-[#203454]">
              <strong>Garantie supplémentaire pour utilisateur mineur :</strong>{' '}
              Ce profil appartient à un bachelier mineur. Toute transmission de
              dossier à un organisme requiert la confirmation de l’autorisation
              parentale ou du représentant légal.
            </div>
          )}
        </div>
      </Panel>

      <Panel
        title="Droits d’accès, de rectification et d’effacement (Loi n° 2024/017 du 23 décembre 2024)"
        subtitle="Note : En démonstration frontend, ces contrôles s'exécutent sur votre stockage local. En production, les contrôles définitifs sont assurés par le backend Spring Boot."
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <p className="text-[#69768C] max-w-2xl">
            Tu peux à tout moment modifier tes informations académiques ou
            réinitialiser intégralement les données locales de démonstration.
          </p>
          <Button variant="secondary" size="sm" onClick={resetDemoData}>
            Effacer et réinitialiser mes données locales
          </Button>
        </div>
      </Panel>

      <Panel
        title="Historique de tes actions de confidentialité"
        subtitle="Traçabilité des consentements accordés ou retirés"
      >
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {auditLogs
            .filter((l) => l.actionType === 'PRIVACY_CONSENT')
            .map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-[#203454]">
                    {log.targetLabel}
                  </span>{' '}
                  — <span className="text-[#253047]">{log.details}</span>
                </div>
                <span className="font-mono tabular-nums text-[#69768C] shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
};
