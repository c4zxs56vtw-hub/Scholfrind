import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Lock,
  Search,
  ShieldCheck,
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
  CriterionStatusText,
  CurationReliabilityNote,
  EligibilityVerdictIndicator,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import { UserRole } from '../../types';

/**
 * 1. PAGE D'ACCUEIL PUBLIQUE (/)
 */
export const HomePage: React.FC = () => {
  const {
    scholarships,
    currentStudent,
    evaluateForCurrentStudent,
    switchDemoRole,
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const verifiedScholarships = scholarships.filter(
    (s) => s.curationStatus === 'VERIFIED' && s.status !== 'EXPIRED'
  );
  const availableCountries = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.hostCountry))),
    [scholarships]
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedDomain) params.set('domain', selectedDomain);
    if (selectedCountry) params.set('country', selectedCountry);
    navigate(`/bourses${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* SECTION 1 — HERO & RECHERCHE PRINCIPALE */}
      <section className="bg-white border border-[#E6ECF5] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3457D5]/10 text-[#3457D5] text-xs font-semibold">
              Découverte & éligibilité aux bourses d’études
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF5EB] text-[#14533C] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recherche 100 % gratuite pour les étudiants</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#203454] tracking-tight leading-tight">
            Trouvons la bourse qui te correspond.
          </h1>
          <p className="text-base text-[#69768C] leading-relaxed">
            Explore des programmes vérifiés du Baccalauréat au Doctorat, vérifie ton éligibilité en un clic et reçois des invitations d’organismes financeurs.
          </p>
        </div>

        {/* Barre de recherche centrale */}
        <form onSubmit={handleHeroSearch} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#69768C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Recherche une bourse, une formation ou un pays…"
                aria-label="Recherche une bourse, une formation ou un pays"
                className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-sm text-[#253047] placeholder-[#69768C] focus:outline-none focus:border-[#3457D5] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#3457D5] hover:bg-[#2946B2] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-2"
            >
              Rechercher
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Niveau d'études"
              className="px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="">Niveau d&apos;études (Tous)</option>
              {ACADEMIC_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              aria-label="Domaine de formation"
              className="px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="">Domaine de formation (Tous)</option>
              {STUDY_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              aria-label="Pays"
              className="px-3.5 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="">Pays (Toutes destinations)</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E6ECF5]">
          <div className="text-xs text-[#69768C]">
            Niveaux couverts : Baccalauréat · BTS · DUT · HND · Licence · Master · Doctorat
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                switchDemoRole('STUDENT');
                navigate('/etudiant/tableau-de-bord');
              }}
            >
              Mon tableau de bord étudiant
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/tableau-de-bord');
              }}
            >
              Espace organisme
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2 — BOURSES RECOMMANDÉES EN VEDETTE */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#203454]">
              Des bourses vérifiées pour toi
            </h2>
            <p className="text-sm text-[#69768C]">
              Comparées avec le profil de démonstration ({currentStudent.firstName} {currentStudent.lastName}).
            </p>
          </div>
          <Link
            to="/bourses"
            className="text-sm font-semibold text-[#3457D5] hover:text-[#203454] inline-flex items-center gap-1.5"
          >
            Voir tout le catalogue ({scholarships.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verifiedScholarships.slice(0, 3).map((sch) => {
            const report = evaluateForCurrentStudent(sch);
            return (
              <article
                key={sch.id}
                className="bg-white border border-[#E6ECF5] rounded-2xl p-5 shadow-xs hover:border-[#3457D5]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <EligibilityVerdictIndicator verdict={report.verdict} />
                    <span className="text-[11px] font-medium text-[#69768C] bg-[#F8FAFD] border border-[#E6ECF5] px-2.5 py-1 rounded-lg">
                      {sch.hostCountry}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#203454] leading-snug line-clamp-2">
                      {sch.title}
                    </h3>
                    <p className="text-xs text-[#69768C] mt-1">
                      {sch.organizationName}
                    </p>
                  </div>

                  <div className="pt-1 space-y-1.5 text-xs text-[#253047]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#69768C]">Niveau financé</span>
                      <span className="font-semibold text-[#203454]">
                        {sch.criteria.targetStudyLevels.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#69768C]">Financement</span>
                      <span className="font-medium">{sch.fundingType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#69768C]">Date limite</span>
                      <span className="font-medium tabular-nums">
                        {sch.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6ECF5] flex items-center gap-2">
                  <Link
                    to={`/bourses/${sch.id}`}
                    className="w-full py-2.5 px-4 bg-[#F8FAFD] hover:bg-[#3457D5] text-[#3457D5] hover:text-white border border-[#E6ECF5] hover:border-[#3457D5] rounded-xl text-xs font-semibold text-center transition-colors"
                  >
                    Voir la bourse
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 — COMMENT ÇA MARCHE EN 3 POINTS SIMPLES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6ECF5] rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-[#3457D5]/10 text-[#3457D5] text-xs font-bold">
            01 · Parcours clair
          </span>
          <h3 className="text-base font-bold text-[#203454]">
            3 niveaux distincts
          </h3>
          <p className="text-xs text-[#69768C] leading-relaxed">
            Ton diplôme déjà obtenu, ton niveau actuel et la formation visée sont séparés pour ne jamais fausser tes résultats.
          </p>
        </div>

        <div className="bg-white border border-[#E6ECF5] rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-[#DDF5EB] text-[#14533C] text-xs font-bold">
            02 · Éligibilité explicable
          </span>
          <h3 className="text-base font-bold text-[#203454]">
            Zéro boîte noire
          </h3>
          <p className="text-xs text-[#69768C] leading-relaxed">
            Vérifie instantanément quels critères sont remplis, manquants ou à vérifier avant de préparer ton dossier.
          </p>
        </div>

        <div className="bg-white border border-[#E6ECF5] rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-[#F5A17B]/20 text-[#9A421D] text-xs font-bold">
            03 · Mise en relation
          </span>
          <h3 className="text-base font-bold text-[#203454]">
            Confidentialité maîtrisée
          </h3>
          <p className="text-xs text-[#69768C] leading-relaxed">
            Ton profil est privé par défaut. Active ta visibilité uniquement si tu souhaites être invité par des organismes vérifiés.
          </p>
        </div>
      </section>
    </div>
  );
};

/**
 * 2. CATALOGUE PUBLIC DES BOURSES (/bourses & /etudiant/recherche)
 */
export const PublicCatalogPage: React.FC = () => {
  const {
    scholarships,
    currentStudent,
    toggleSavedScholarship,
    evaluateForCurrentStudent,
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [countryFilter, setCountryFilter] = useState(
    searchParams.get('country') || 'TOUS'
  );
  const [targetLevelFilter, setTargetLevelFilter] = useState(
    searchParams.get('level') || 'TOUS'
  );
  const [domainFilter, setDomainFilter] = useState(
    searchParams.get('domain') || 'TOUS'
  );
  const [fundingFilter, setFundingFilter] = useState('TOUS');
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [sortBy, setSortBy] = useState<'DEADLINE' | 'GRADE'>('DEADLINE');

  // Panneaux de filtres secondaires (« Plus de filtres ») et tiroir mobile
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // États UX : résultats disponibles, aucun résultat, chargement, erreur
  const [catalogViewStatus, setCatalogViewStatus] = useState<
    'READY' | 'LOADING' | 'ERROR'
  >('READY');

  useEffect(() => {
    const qParam = searchParams.get('q');
    const countryParam = searchParams.get('country');
    const levelParam = searchParams.get('level');
    const domainParam = searchParams.get('domain');
    if (qParam !== null) setKeyword(qParam);
    if (countryParam !== null) setCountryFilter(countryParam);
    if (levelParam !== null) setTargetLevelFilter(levelParam);
    if (domainParam !== null) setDomainFilter(domainParam);
  }, [searchParams]);

  const countries = useMemo(
    () => Array.from(new Set(scholarships.map((s) => s.hostCountry))),
    [scholarships]
  );

  // Évaluation de chaque bourse filtrée pour distinguer les bourses trouvées des bourses compatibles
  // Conformément à OpenAPI 1.1 : aucun brouillon (publicationStatus !== 'PUBLISHED' ou status === 'DRAFT') n'est exposé publiquement.
  const evaluatedResults = useMemo(() => {
    const baseFiltered = scholarships
      .filter((s) => {
        if (s.status === 'DRAFT') return false;
        if (s.publicationStatus && s.publicationStatus !== 'PUBLISHED') {
          return false;
        }
        if (s.curationStatus === 'ARCHIVED') return false;
        if (!includeExpired && s.status === 'EXPIRED') return false;
        if (
          keyword.trim() !== '' &&
          !`${s.title} ${s.organizationName} ${s.hostCountry} ${s.description}`
            .toLowerCase()
            .includes(keyword.toLowerCase())
        ) {
          return false;
        }
        if (countryFilter !== 'TOUS' && s.hostCountry !== countryFilter) {
          return false;
        }
        if (
          targetLevelFilter !== 'TOUS' &&
          !s.criteria.targetStudyLevels.includes(targetLevelFilter as any)
        ) {
          return false;
        }
        if (
          domainFilter !== 'TOUS' &&
          !s.criteria.eligibleDomains.includes(domainFilter as any) &&
          !s.criteria.eligibleDomains.includes('Tous domaines')
        ) {
          return false;
        }
        if (fundingFilter !== 'TOUS' && s.fundingType !== fundingFilter) {
          return false;
        }
        return true;
      })
      .map((scholarship) => ({
        scholarship,
        report: evaluateForCurrentStudent(scholarship),
      }));

    const afterCompatibilityFilter = onlyCompatible
      ? baseFiltered.filter(
          (item) => item.report.verdict === 'POTENTIALLY_COMPATIBLE'
        )
      : baseFiltered;

    return afterCompatibilityFilter.sort((a, b) => {
      if (sortBy === 'DEADLINE') {
        return a.scholarship.deadline.localeCompare(b.scholarship.deadline);
      }
      return (
        (a.scholarship.criteria.minGradeOut20 || 0) -
        (b.scholarship.criteria.minGradeOut20 || 0)
      );
    });
  }, [
    scholarships,
    keyword,
    countryFilter,
    targetLevelFilter,
    domainFilter,
    fundingFilter,
    onlyCompatible,
    includeExpired,
    sortBy,
    currentStudent,
  ]);

  const compatibleCountInResults = useMemo(
    () =>
      evaluatedResults.filter(
        (item) => item.report.verdict === 'POTENTIALLY_COMPATIBLE'
      ).length,
    [evaluatedResults]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (targetLevelFilter !== 'TOUS') count++;
    if (domainFilter !== 'TOUS') count++;
    if (countryFilter !== 'TOUS') count++;
    if (fundingFilter !== 'TOUS') count++;
    if (onlyCompatible) count++;
    if (includeExpired) count++;
    return count;
  }, [
    targetLevelFilter,
    domainFilter,
    countryFilter,
    fundingFilter,
    onlyCompatible,
    includeExpired,
  ]);

  const resetAllFilters = () => {
    setKeyword('');
    setCountryFilter('TOUS');
    setTargetLevelFilter('TOUS');
    setDomainFilter('TOUS');
    setFundingFilter('TOUS');
    setOnlyCompatible(false);
    setIncludeExpired(false);
    setSortBy('DEADLINE');
    setCatalogViewStatus('READY');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* En-tête épuré */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
          Explore les bourses
        </h1>
        <p className="text-sm sm:text-base text-[#69768C] mt-1">
          Découvre les opportunités qui correspondent à ton parcours.
        </p>
      </div>

      {/* Zone de recherche principale et filtres rapides */}
      <div className="bg-white border border-[#E6ECF5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Barre de recherche + Bouton Filtres sur mobile + Plus de filtres / Réinitialiser */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-[#69768C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="catalog-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Recherche une bourse, une formation ou un pays…"
              aria-label="Recherche une bourse, une formation ou un pays"
              className="w-full pl-10 pr-4 py-3 text-sm bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] placeholder:text-[#69768C] focus:outline-none focus:border-[#3457D5] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton dédié aux filtres sur smartphone */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="sm:hidden flex-1 py-3 px-4 text-xs font-semibold text-[#203454] bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#3457D5] text-white text-[11px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Bouton Plus de filtres sur tablette/desktop */}
            <button
              type="button"
              onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shrink-0 ${
                moreFiltersOpen || onlyCompatible || includeExpired
                  ? 'bg-[#3457D5]/10 border-[#3457D5]/30 text-[#3457D5]'
                  : 'bg-[#F8FAFD] border-[#E6ECF5] text-[#253047] hover:text-[#203454]'
              }`}
            >
              <span>Plus de filtres</span>
            </button>

            <button
              type="button"
              onClick={resetAllFilters}
              className="py-3 px-4 text-xs font-semibold text-[#69768C] hover:text-[#203454] bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl cursor-pointer shrink-0"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* 4 Filtres principaux (Niveau d'études, Domaine, Pays, Financement) — Visibles directement sur tablette/desktop, ou dans le panneau mobile */}
        <div
          className={`${
            mobileFiltersOpen ? 'grid' : 'hidden sm:grid'
          } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1`}
        >
          <div>
            <label
              htmlFor="catalog-target-level"
              className="block text-[11px] font-semibold text-[#69768C] mb-1"
            >
              Niveau d&apos;études
            </label>
            <select
              id="catalog-target-level"
              value={targetLevelFilter}
              onChange={(e) => setTargetLevelFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="TOUS">Tous les niveaux</option>
              {ACADEMIC_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="catalog-domain"
              className="block text-[11px] font-semibold text-[#69768C] mb-1"
            >
              Domaine
            </label>
            <select
              id="catalog-domain"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="TOUS">Tous les domaines</option>
              {STUDY_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="catalog-country"
              className="block text-[11px] font-semibold text-[#69768C] mb-1"
            >
              Pays
            </label>
            <select
              id="catalog-country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="TOUS">Tous les pays</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="catalog-funding"
              className="block text-[11px] font-semibold text-[#69768C] mb-1"
            >
              Financement
            </label>
            <select
              id="catalog-funding"
              value={fundingFilter}
              onChange={(e) => setFundingFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-[#253047] focus:outline-none focus:border-[#3457D5]"
            >
              <option value="TOUS">Tous les financements</option>
              {FUNDING_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panneau « Plus de filtres » (ou inclus dans le tiroir mobile) */}
        {(moreFiltersOpen || mobileFiltersOpen) && (
          <div className="pt-3 border-t border-[#E6ECF5] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[#253047] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyCompatible}
                  onChange={(e) => setOnlyCompatible(e.target.checked)}
                  className="rounded border-[#E6ECF5]"
                />
                <span>Afficher uniquement les bourses compatibles avec mon profil</span>
              </label>

              <label className="flex items-center gap-2 text-[#69768C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExpired}
                  onChange={(e) => setIncludeExpired(e.target.checked)}
                  className="rounded border-[#E6ECF5]"
                />
                <span>Inclure les bourses expirées</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="catalog-sort" className="text-[#69768C]">
                Trier par :
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs text-[#253047]"
              >
                <option value="DEADLINE">Date limite la plus proche</option>
                <option value="GRADE">Moyenne minimale</option>
              </select>
            </div>
          </div>
        )}

        {/* Barre de synthèse des résultats : Bourses trouvées vs Bourses compatibles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6ECF5] text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[#253047] font-semibold">
              {evaluatedResults.length} bourse
              {evaluatedResults.length > 1 ? 's' : ''} trouvée
              {evaluatedResults.length > 1 ? 's' : ''}
            </span>
            <span className="text-[#E6ECF5]" aria-hidden="true">
              •
            </span>
            <button
              type="button"
              onClick={() => setOnlyCompatible(!onlyCompatible)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                onlyCompatible
                  ? 'bg-[#14533C] text-white'
                  : 'bg-[#DDF5EB] text-[#14533C] hover:bg-[#14533C]/15'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {compatibleCountInResults} compatible
                {compatibleCountInResults > 1 ? 's' : ''} avec ton profil
              </span>
            </button>
          </div>

          {!moreFiltersOpen && !mobileFiltersOpen && (
            <div className="hidden sm:flex items-center gap-2">
              <label htmlFor="catalog-sort-inline" className="text-[#69768C]">
                Tri :
              </label>
              <select
                id="catalog-sort-inline"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 bg-[#F8FAFD] border border-[#E6ECF5] rounded-lg text-xs text-[#253047]"
              >
                <option value="DEADLINE">Date limite</option>
                <option value="GRADE">Moyenne min.</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ÉTAT 1 : CHARGEMENT */}
      {catalogViewStatus === 'LOADING' && (
        <div
          role="status"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[1, 2, 3].map((placeholder) => (
            <div
              key={placeholder}
              className="bg-white border border-[#E6ECF5] rounded-2xl p-5 space-y-4 animate-pulse"
            >
              <div className="h-5 w-36 bg-[#F8FAFD] rounded-full" />
              <div className="h-5 w-4/5 bg-[#F8FAFD] rounded-lg" />
              <div className="h-4 w-1/2 bg-[#F8FAFD] rounded-lg" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-[#F8FAFD] rounded" />
                <div className="h-3 w-full bg-[#F8FAFD] rounded" />
              </div>
              <div className="h-9 w-full bg-[#F8FAFD] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* ÉTAT 2 : ERREUR */}
      {catalogViewStatus === 'ERROR' && (
        <Panel>
          <div className="py-8 text-center space-y-3">
            <p className="text-sm font-bold text-[#203454]">
              Impossible de charger les bourses pour le moment.
            </p>
            <p className="text-xs text-[#69768C]">
              Vérifie ta connexion ou réessaie dans quelques instants.
            </p>
            <div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCatalogViewStatus('READY')}
              >
                Réessayer
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* ÉTAT 3 : AUCUN RÉSULTAT */}
      {catalogViewStatus === 'READY' && evaluatedResults.length === 0 && (
        <Panel>
          <div className="py-10 text-center space-y-3">
            <p className="text-base font-bold text-[#203454]">
              Aucune bourse trouvée pour ces critères.
            </p>
            <p className="text-xs text-[#69768C] max-w-md mx-auto">
              Essaie de modifier le niveau d’études, le pays ou de réinitialiser tous les filtres pour découvrir d’autres opportunités.
            </p>
            <div className="pt-1">
              <Button variant="secondary" size="sm" onClick={resetAllFilters}>
                Réinitialiser tous les filtres
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* ÉTAT 4 : RÉSULTATS DISPONIBLES (Grille de cartes compactes : 1 col mobile/tablette étroite, 2 écran moyen, 3 grand écran) */}
      {catalogViewStatus === 'READY' && evaluatedResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {evaluatedResults.map(({ scholarship: sch, report }) => {
            const isSaved = currentStudent.savedScholarshipIds.includes(sch.id);
            const isIncompatible = report.verdict === 'INCOMPATIBLE';

            return (
              <article
                key={sch.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 min-w-0 ${
                  isIncompatible
                    ? 'border-[#E6ECF5] opacity-95'
                    : 'border-[#E6ECF5] hover:border-[#3457D5]/40'
                }`}
              >
                <div className="space-y-3 min-w-0">
                  {/* Statut d'éligibilité + Bouton de favori */}
                  <div className="flex items-center justify-between gap-2">
                    <EligibilityVerdictIndicator verdict={report.verdict} />
                    <button
                      type="button"
                      onClick={() => toggleSavedScholarship(sch.id)}
                      aria-label={
                        isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'
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

                  {/* Intitulé de la bourse & Nom de l'organisme */}
                  <div>
                    <h2 className="text-base font-bold text-[#203454] leading-snug line-clamp-2">
                      <Link
                        to={`/bourses/${sch.id}`}
                        className="hover:text-[#3457D5] transition-colors"
                      >
                        {sch.title}
                      </Link>
                    </h2>
                    <p className="text-xs text-[#69768C] mt-1 truncate">
                      {sch.organizationName}
                    </p>
                  </div>

                  {/* Informations clés : Pays, Niveau financé, Type de financement, Date limite */}
                  <div className="pt-2.5 border-t border-[#E6ECF5] space-y-1.5 text-xs text-[#253047]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Pays</span>
                      <span className="font-semibold text-[#203454]">
                        {sch.hostCountry}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Niveau financé</span>
                      <span className="font-semibold text-[#3457D5]">
                        {sch.criteria.targetStudyLevels.join(' / ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C] shrink-0">
                        Financement
                      </span>
                      <span className="font-medium truncate text-right">
                        {sch.fundingType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#69768C]">Date limite</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          sch.status === 'EXPIRED'
                            ? 'text-[#B42318]'
                            : 'text-[#253047]'
                        }`}
                      >
                        {sch.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions : Voir mon éligibilité & Voir la bourse */}
                <div className="pt-3 border-t border-[#E6ECF5] flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/etudiant/eligibilite?scholarshipId=${sch.id}`)
                    }
                  >
                    Voir mon éligibilité
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/bourses/${sch.id}`)}
                  >
                    Voir la bourse
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * 3. DÉTAIL D'UNE BOURSE (/bourses/:id)
 */
export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    scholarships,
    currentStudent,
    toggleSavedScholarship,
    evaluateForCurrentStudent,
    submitApplication,
  } = useApp();
  const navigate = useNavigate();

  const scholarship =
    scholarships.find((s) => s.id === id) || scholarships[0];
  const report = evaluateForCurrentStudent(scholarship);
  const isSaved = currentStudent.savedScholarshipIds.includes(scholarship.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-xs text-[#69768C]">
        <Link to="/bourses" className="hover:text-[#203454] underline">
          Explore les bourses
        </Link>{' '}
        / <span>{scholarship.title}</span>
      </div>

      <PageHeader
        kicker={`${scholarship.organizationName} · ${scholarship.hostCountry}`}
        title={scholarship.title}
        subtitle={scholarship.description}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => toggleSavedScholarship(scholarship.id)}
            >
              <Bookmark className="w-4 h-4" />
              {isSaved ? 'Dans tes favoris' : 'Enregistrer'}
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/etudiant/eligibilite?scholarshipId=${scholarship.id}`)
              }
            >
              <FileCheck2 className="w-4 h-4" />
              Voir mon éligibilité
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne principale : Critères, Avantages, Pièces, et rubrique secondaire de traçabilité */}
        <div className="lg:col-span-8 space-y-6">
          <Panel
            title="Conditions d’éligibilité"
            subtitle="Critères principaux requis par l’organisme"
          >
            <dl className="divide-y divide-[#E6ECF5] text-xs">
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Nationalités éligibles
                </dt>
                <dd className="sm:col-span-2 font-semibold text-[#253047]">
                  {scholarship.criteria.eligibleNationalities.join(', ')}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Diplôme déjà obtenu requis
                </dt>
                <dd className="sm:col-span-2 font-semibold text-[#203454]">
                  {scholarship.criteria.requiredDiplomaObtained.join(' ou ')}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Niveau financé
                </dt>
                <dd className="sm:col-span-2 font-semibold text-[#3457D5]">
                  {scholarship.criteria.targetStudyLevels.join(', ')}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Domaines d’études
                </dt>
                <dd className="sm:col-span-2 text-[#253047]">
                  {scholarship.criteria.eligibleDomains.join(' · ')}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Moyenne minimale
                </dt>
                <dd className="sm:col-span-2 font-mono tabular-nums font-semibold text-[#253047]">
                  {scholarship.criteria.minGradeOut20
                    ? `${scholarship.criteria.minGradeOut20.toFixed(1)} / 20`
                    : 'Aucun seuil minimal fixe'}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Langue requise
                </dt>
                <dd className="sm:col-span-2 text-[#253047]">
                  {scholarship.criteria.requiredLanguage
                    ? `${scholarship.criteria.requiredLanguage} (Niveau minimum ${scholarship.criteria.minLanguageLevel}) — ${
                        scholarship.criteria.requiresLanguageCertification
                          ? 'Certification officielle requise'
                          : 'Sans certificat externe obligatoire'
                      }`
                    : 'Non spécifiée'}
                </dd>
              </div>
              <div className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#69768C] font-medium">
                  Date limite
                </dt>
                <dd className="sm:col-span-2 font-semibold tabular-nums text-[#203454]">
                  {scholarship.deadline}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Financement & Avantages">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl font-semibold text-[#203454]">
                {scholarship.fundingType} — {scholarship.financialSummary}
              </div>
              <ul className="space-y-2 text-[#253047]">
                {scholarship.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14533C] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title="Documents à préparer">
            <ul className="space-y-2 text-xs text-[#253047] list-disc pl-4">
              {scholarship.requiredDocuments.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </Panel>

          {/* Rubrique secondaire : Métadonnées techniques, dates de collecte et informations de curation */}
          <Panel
            title="Informations sur la source & vérification"
            subtitle="Détails techniques et traçabilité de l’annonce"
          >
            <div className="space-y-3 text-xs text-[#69768C]">
              <CurationReliabilityNote
                status={scholarship.curationStatus}
                lastVerifiedAt={scholarship.lastVerifiedAt}
                isDemoData={scholarship.isDemoData}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E6ECF5]">
                <div>
                  <span className="block text-[11px]">Référence programme</span>
                  <strong className="text-[#253047] font-mono">
                    {scholarship.code}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px]">Source déclarée</span>
                  <strong className="text-[#253047]">
                    {scholarship.sourceName}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px]">Date de collecte</span>
                  <strong className="text-[#253047] tabular-nums">
                    {scholarship.retrievedAt}
                  </strong>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Colonne latérale droite : Résumé d'éligibilité en direct */}
        <div className="lg:col-span-4 space-y-6">
          <Panel
            title="Ton éligibilité"
            subtitle={`Profil de ${currentStudent.firstName} ${currentStudent.lastName}`}
          >
            <div className="space-y-4">
              <EligibilityVerdictIndicator
                verdict={report.verdict}
                showDescription
              />

              <div className="text-xs text-[#253047] bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl p-3 leading-relaxed">
                {report.summaryExplanation}
              </div>

              <div className="space-y-2">
                {report.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-[#E6ECF5] last:border-b-0"
                  >
                    <span className="text-[#253047]">{item.label}</span>
                    <CriterionStatusText status={item.status} />
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/etudiant/eligibilite?scholarshipId=${scholarship.id}`
                    )
                  }
                >
                  Voir mon éligibilité
                </Button>
                {scholarship.status !== 'EXPIRED' && (
                  <Button
                    variant="copper"
                    className="w-full"
                    onClick={() => submitApplication(scholarship.id)}
                  >
                    Simuler ma candidature
                  </Button>
                )}
              </div>

              <p className="text-[11px] text-[#69768C] leading-relaxed">
                {report.legalDisclaimer}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. PAGE FONCTIONNEMENT DE SCHOLARFIND (/fonctionnement)
 */
export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <PageHeader
        kicker="MÉTHODOLOGIE & TRANSPARENCE ALGORITHMIQUE"
        title="Fonctionnement de SCHOLARFIND"
        subtitle="Une plateforme à double sens conçue autour de règles métier déterministes, de la vérification humaine des sources et du respect de la vie privée des étudiants."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel
          title="1. Pour les étudiants : quatre verrous contre l’incertitude"
          subtitle="Du bachelier au doctorant, en passant par les BTS, DUT, HND et Licences"
        >
          <ul className="space-y-3 text-xs text-[#253047] leading-relaxed">
            <li>
              <strong>Séparation des trois niveaux académiques :</strong> Le
              diplôme déjà obtenu, le niveau actuel et la formation recherchée sont
              stockés et évalués séparément.
            </li>
            <li>
              <strong>Quatre verdicts explicables :</strong> Chaque vérification
              aboutit à <em>Potentiellement compatible</em>, <em>À compléter</em>{' '}
              (si une donnée est absente), <em>À vérifier</em> (équivalence de
              diplôme ou annonce non encore auditée) ou <em>Incompatible</em>.
            </li>
            <li>
              <strong>Absence d’interprétation abusive :</strong> Une information
              manquante dans votre profil n’est jamais traitée comme un rejet, mais
              comme une invitation à compléter le champ concerné.
            </li>
            <li>
              <strong>Aucune fausse promesse :</strong> SCHOLARFIND n’affiche
              jamais « Bourse obtenue » ou « Admission garantie ».
            </li>
          </ul>
        </Panel>

        <Panel
          title="2. Pour les organismes financeurs : sourcing éthique"
          subtitle="Universités, ministères, ambassades, fondations, ONG et entreprises"
        >
          <ul className="space-y-3 text-xs text-[#253047] leading-relaxed">
            <li>
              <strong>Vérification institutionnelle préalable :</strong> Un
              organisme doit être vérifié par l’administrateur avant de pouvoir
              rechercher des profils étudiants.
            </li>
            <li>
              <strong>Recherche réservée aux profils volontaires :</strong> Par
              défaut, tous les profils étudiants sont privés. Seuls les candidats
              ayant activé leur visibilité institutionnelle apparaissent dans les
              résultats.
            </li>
            <li>
              <strong>Invitations sans divulgation automatique :</strong>{' '}
              L’organisme envoie une invitation à consulter son programme. Les
              coordonnées et le dossier ne sont partagés que si l’étudiant accepte
              l’invitation.
            </li>
          </ul>
        </Panel>
      </div>

      <Panel
        title="Protection des données personnelles (Loi camerounaise n° 2024/017 du 23 décembre 2024)"
        subtitle="Confidentialité dès la conception (Privacy by Design)"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#253047] leading-relaxed">
          <div>
            <div className="font-semibold text-[#203454] mb-1">
              Consentement révocable à tout moment
            </div>
            <p className="text-[#69768C]">
              L’étudiant active ou retire sa visibilité institutionnelle en un clic
              depuis ses paramètres de confidentialité, avec journalisation dans
              l’historique d’audit.
            </p>
          </div>
          <div>
            <div className="font-semibold text-[#203454] mb-1">
              Garanties supplémentaires pour les mineurs
            </div>
            <p className="text-[#69768C]">
              Les bacheliers mineurs disposent d’un verrouillage renforcé de la
              visibilité publique et d’une mention d’autorisation parentale.
            </p>
          </div>
          <div>
            <div className="font-semibold text-[#203454] mb-1">
              Neutralité et non-marchandisation
            </div>
            <p className="text-[#69768C]">
              Les données des étudiants ne sont jamais vendues. Aucun paiement
              étudiant ne permet d’améliorer artificiellement un score
              d’éligibilité.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};

/**
 * 5. RUBRIQUE « POUR LES ORGANISMES » (/organismes)
 */
export const OrganizationsDirectoryPage: React.FC = () => {
  const { organizations, scholarships, switchDemoRole } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHeader
        kicker="POUR LES ORGANISMES FINANCEURS & INSTITUTIONS"
        title="Publiez vos bourses et identifiez les candidats éligibles"
        subtitle="Universités, ministères, ambassades, fondations et entreprises : gérez vos appels à candidatures avec des critères d’éligibilité structurés et invitez des profils académiques vérifiés."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate('/tarification')}
            >
              Offres & Tarifs organismes
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/tableau-de-bord');
              }}
            >
              Accéder à l’Espace Organisme
            </Button>
          </>
        }
      />

      {/* Avantages clés pour les organismes + Accès direct à la tarification B2B */}
      <section className="bg-white border border-[#E6ECF5] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-1.5">
            <div className="text-xs font-bold text-[#3457D5]">
              01 · Critères structurés
            </div>
            <h3 className="text-sm font-bold text-[#203454]">
              Moins de dossiers hors-cible
            </h3>
            <p className="text-xs text-[#69768C] leading-relaxed">
              Paramétrez le diplôme déjà obtenu, le niveau financé, la moyenne minimale et les exigences linguistiques pour pré-qualifier les candidats.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-1.5">
            <div className="text-xs font-bold text-[#14533C]">
              02 · Sourcing respectueux
            </div>
            <h3 className="text-sm font-bold text-[#203454]">
              Invitations ciblées
            </h3>
            <p className="text-xs text-[#69768C] leading-relaxed">
              Recherchez parmi les étudiants ayant activé leur visibilité institutionnelle et invitez-les à déposer leur dossier.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-1.5">
            <div className="text-xs font-bold text-[#9A3412]">
              03 · Jury collaboratif
            </div>
            <h3 className="text-sm font-bold text-[#203454]">
              Sélection & traçabilité
            </h3>
            <p className="text-xs text-[#69768C] leading-relaxed">
              Évaluez les candidatures reçues avec votre équipe, attribuez des notes et enregistrez les décisions finales en toute transparence.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6ECF5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-[#203454]">
              Formules d’abonnement pour les organismes financeurs
            </div>
            <p className="text-xs text-[#69768C]">
              De l’accès découverte gratuit aux formules Campagne ponctuelle, Organisme Pro et Organisme Premium.
            </p>
          </div>
          <Link
            to="/tarification"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3457D5] hover:bg-[#203454] text-white text-xs font-semibold transition-colors shrink-0"
          >
            <span>Consulter les tarifs organismes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Annuaire des organismes partenaires en démonstration */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#203454]">
            Institutions & organismes partenaires (Démonstration)
          </h2>
          <p className="text-xs text-[#69768C]">
            Exemples de structures utilisant SCHOLARFIND pour diffuser et gérer leurs programmes de bourses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {organizations.map((org) => {
            const orgScholarships = scholarships.filter(
              (s) => s.organizationId === org.id
            );
            return (
              <Panel
                key={org.id}
                title={org.officialName}
                subtitle={`${org.type} · ${org.country}`}
              >
                <div className="space-y-4 text-xs">
                  <p className="text-[#69768C] leading-relaxed">
                    {org.description}
                  </p>
                  <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl space-y-1">
                    <div>
                      Statut d’accréditation :{' '}
                      <strong
                        className={
                          org.isVerified ? 'text-[#14533C]' : 'text-[#9A421D]'
                        }
                      >
                        {org.isVerified
                          ? 'Structure vérifiée'
                          : 'En attente de vérification'}
                      </strong>
                    </div>
                    <div>
                      Programmes publiés :{' '}
                      <strong className="font-mono tabular-nums">
                        {orgScholarships.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/**
 * 6. PAGE TARIFICATION DES ORGANISMES (/tarification — intégrée à la rubrique « Pour les organismes »)
 */
export const PricingPage: React.FC = () => {
  const { switchDemoRole, changeOrganizationPlan, currentOrganization } =
    useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="text-xs text-[#69768C]">
        <Link to="/organismes" className="hover:text-[#3457D5] underline">
          Pour les organismes
        </Link>{' '}
        / <span>Offres & Tarifs organismes</span>
      </div>

      <PageHeader
        kicker="POUR LES ORGANISMES · OFFRES INSTITUTIONNELLES"
        title="Tarifs & abonnements pour les organismes financeurs"
        subtitle="Choisissez la formule adaptée à vos campagnes d’attribution de bourses. L’ensemble des outils de recherche et d’éligibilité est 100 % gratuit pour les étudiants."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              switchDemoRole('ORGANIZATION');
              navigate('/organisme/abonnement');
            }}
          >
            Gérer mon abonnement organisme
          </Button>
        }
      />

      {/* Rappel discret du modèle B2B2C : gratuité totale pour les étudiants */}
      <div className="bg-[#DDF5EB]/60 border border-[#14533C]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#253047]">
        <div className="space-y-0.5">
          <div className="font-bold text-[#14533C]">
            Vous êtes étudiant ? SCHOLARFIND est 100 % gratuit pour vous.
          </div>
          <p className="text-[#253047]">
            Aucun abonnement payant n’est proposé aux étudiants. Ces formules s’adressent exclusivement aux organismes financeurs (universités, fondations, ministères, entreprises).
          </p>
        </div>
        <Link
          to="/bourses"
          className="px-3.5 py-2 rounded-xl bg-white border border-[#E6ECF5] text-xs font-semibold text-[#203454] hover:text-[#3457D5] shrink-0 text-center"
        >
          Explorer les bourses
        </Link>
      </div>

      {/* Grille des 4 formules destinées uniquement aux organismes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* 1. Organisme Découverte */}
        <Panel
          title="Organisme Découverte"
          subtitle="Accès institutionnel initial"
          className="flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="text-2xl font-bold text-[#203454] tabular-nums">
              Gratuit
            </div>
            <ul className="space-y-2 text-xs text-[#253047]">
              <li>· Création du profil institutionnel</li>
              <li>· Dépôt de demande de vérification</li>
              <li>· Publication d’une annonce soumise à curation</li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                changeOrganizationPlan(currentOrganization.id, 'ORG_DISCOVERY');
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/abonnement');
              }}
            >
              Simuler cette formule
            </Button>
          </div>
        </Panel>

        {/* 2. Campagne Ponctuelle */}
        <Panel
          title="Campagne ponctuelle"
          subtitle="Pour un appel annuel unique"
          className="flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#69768C]">À partir de</span>
              <div className="text-2xl font-bold text-[#203454] tabular-nums">
                75 000 FCFA
              </div>
              <span className="text-[11px] text-[#69768C]">
                Par campagne (sans abonnement)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-[#253047]">
              <li>· 1 campagne complète gérée</li>
              <li>· Paramétrage des critères d’éligibilité</li>
              <li>· Réception et tri des candidatures</li>
              <li>· Enregistrement des décisions</li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                changeOrganizationPlan(
                  currentOrganization.id,
                  'ORG_SINGLE_CAMPAIGN'
                );
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/abonnement');
              }}
            >
              Simuler une campagne
            </Button>
          </div>
        </Panel>

        {/* 3. Organisme Pro */}
        <Panel
          title="Organisme Pro"
          subtitle="Pour fondations & universités actives"
          className="flex flex-col justify-between border-[#3457D5]"
        >
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-[#3457D5] tabular-nums">
                50 000 FCFA
              </div>
              <span className="text-[11px] text-[#69768C]">
                Par mois (Simulation)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-[#253047]">
              <li>· Gestion de plusieurs campagnes</li>
              <li>· Recherche de candidats volontaires</li>
              <li>· Envoi d’invitations ciblées</li>
              <li>· Gestion complète des candidatures</li>
              <li>· Statistiques de suivi</li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                changeOrganizationPlan(currentOrganization.id, 'ORG_PRO');
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/abonnement');
              }}
            >
              Simuler Organisme Pro
            </Button>
          </div>
        </Panel>

        {/* 4. Organisme Premium */}
        <Panel
          title="Organisme Premium"
          subtitle="Programmes internationaux & jurys"
          className="flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-[#203454] tabular-nums">
                150 000 FCFA
              </div>
              <span className="text-[11px] text-[#69768C]">
                Par mois (Simulation)
              </span>
            </div>
            <ul className="space-y-2 text-xs text-[#253047]">
              <li>· Gestion avancée multi-campagnes</li>
              <li>· Collaboration entre évaluateurs</li>
              <li>· Permissions granulaires du jury</li>
              <li>· Rapports détaillés & audit</li>
              <li>· Fonctionnalités institutionnelles étendues</li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              variant="copper"
              size="sm"
              className="w-full"
              onClick={() => {
                changeOrganizationPlan(currentOrganization.id, 'ORG_PREMIUM');
                switchDemoRole('ORGANIZATION');
                navigate('/organisme/abonnement');
              }}
            >
              Simuler Organisme Premium
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
};

/**
 * 7. PAGES CONNEXION (/connexion) ET INSCRIPTION (/inscription) SIMULÉES
 */
export const AuthPage: React.FC<{ mode: 'LOGIN' | 'REGISTER' }> = ({
  mode,
}) => {
  const {
    users,
    switchDemoUser,
    switchDemoRole,
    registerStudentAccount,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('amina.ndongo@etudiant-demo.cm');
  const [password, setPassword] = useState('demo-scholarfind-2026');
  const [registerRole, setRegisterRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('Cameroun');
  const [residenceCountry, setResidenceCountry] = useState('Cameroun');
  const [error, setError] = useState('');

  const navigateForRole = (role: UserRole) => {
    if (role === 'STUDENT') navigate('/etudiant/tableau-de-bord');
    if (role === 'ORGANIZATION') navigate('/organisme/tableau-de-bord');
    if (role === 'CURATOR') navigate('/curateur/tableau-de-bord');
    if (role === 'ADMIN') navigate('/admin/tableau-de-bord');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre adresse e-mail et votre mot de passe.');
      return;
    }

    if (mode === 'LOGIN') {
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (matched) {
        switchDemoUser(matched.id);
        navigateForRole(matched.role);
      } else {
        switchDemoRole('STUDENT');
        navigate('/etudiant/tableau-de-bord');
      }
    } else {
      if (!fullName.trim()) {
        setError('Veuillez indiquer votre nom complet ou le nom de votre structure.');
        return;
      }
      if (registerRole === 'STUDENT') {
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || fullName.trim();
        const lastName = parts.slice(1).join(' ') || 'Étudiant';
        registerStudentAccount({
          firstName,
          lastName,
          email: email.trim(),
          nationality,
          residenceCountry,
        });
        navigate('/etudiant/profil');
        return;
      }
      switchDemoRole(registerRole);
      showToast(
        `Inscription simulée validée (${fullName}). Bienvenue dans votre espace.`
      );
      navigateForRole(registerRole);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        kicker="AUTHENTIFICATION SIMULÉE (PRÉPARATION INTÉGRATION JWT SPRING BOOT)"
        title={
          mode === 'LOGIN'
            ? 'Connexion à votre espace SCHOLARFIND'
            : 'Création de compte SCHOLARFIND'
        }
        subtitle="Cette interface simule l’authentification locale pour la démonstration. En production, la vérification des identifiants et les jetons d’accès seront gérés par le backend Java Spring Boot."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <Panel
            title={
              mode === 'LOGIN'
                ? 'Identifiants de session'
                : 'Informations du nouveau compte'
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] rounded font-medium">
                  {error}
                </div>
              )}

              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label
                      htmlFor="auth-role"
                      className="block font-medium text-[#253047] mb-1"
                    >
                      Type de compte *
                    </label>
                    <select
                      id="auth-role"
                      value={registerRole}
                      onChange={(e) =>
                        setRegisterRole(e.target.value as UserRole)
                      }
                      className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                    >
                      <option value="STUDENT">
                        Étudiant / Candidat à une bourse (Gratuit)
                      </option>
                      <option value="ORGANIZATION">
                        Organisme financeur (Université, Fondation, Ministère,
                        Entreprise)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="block font-medium text-[#253047] mb-1"
                    >
                      Nom et prénom (ou nom officiel de l’organisme) *
                    </label>
                    <input
                      id="auth-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jean-Michel Nkoa"
                      className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Adresse e-mail *
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block font-medium text-[#253047] mb-1"
                >
                  Mot de passe (simulation) *
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <Button type="submit" variant="primary">
                  {mode === 'LOGIN'
                    ? 'Se connecter (Simulation)'
                    : 'Créer mon compte (Simulation)'}
                </Button>
                {mode === 'LOGIN' ? (
                  <Link
                    to="/inscription"
                    className="text-xs font-semibold text-[#203454] underline"
                  >
                    Créer un nouveau compte
                  </Link>
                ) : (
                  <Link
                    to="/connexion"
                    className="text-xs font-semibold text-[#203454] underline"
                  >
                    Déjà inscrit ? Se connecter
                  </Link>
                )}
              </div>
            </form>
          </Panel>
        </div>

        {/* Colonne droite : Connexion rapide en 1 clic aux comptes de démonstration */}
        <div className="md:col-span-5">
          <Panel
            title="Comptes de démonstration prêts à l’emploi"
            subtitle="Cliquez sur un profil pour charger immédiatement ses données"
          >
            <div className="space-y-2.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchDemoUser(u.id);
                    navigateForRole(u.role);
                  }}
                  className="w-full text-left p-3 rounded border border-[#E6ECF5] bg-[#F8FAFD] hover:bg-[#3457D5]/10 hover:border-[#203454]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#203454]">
                    <span>{u.fullName}</span>
                    <span className="text-[11px] text-[#3457D5]">{u.role}</span>
                  </div>
                  <div className="text-[11px] text-[#69768C] mt-0.5">
                    {u.email}
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
