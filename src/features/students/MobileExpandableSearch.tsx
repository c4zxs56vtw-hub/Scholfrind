import React, { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ACADEMIC_LEVELS, STUDY_DOMAINS } from '../../data/mockData';

export interface MobileExpandableSearchProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  quickLevel: string;
  onQuickLevelChange: (val: string) => void;
  quickDomain: string;
  onQuickDomainChange: (val: string) => void;
  quickCountry: string;
  onQuickCountryChange: (val: string) => void;
  availableCountries: string[];
  onSubmitSearch: (e: React.FormEvent) => void;
}

/**
 * Barre de recherche mobile rétractable et animée (uniquement pour écrans < 768px / md:hidden)
 * - État initial : bouton compact (min 44x44px) avec icône Search (#3457D5), placé en haut à côté du titre.
 * - État actif : déploiement fluide (220ms, motion-reduce:transition-none) du panneau de recherche avec auto-focus,
 *   bouton Filtres à la demande (Niveau d'études, Domaine de formation, Pays de destination), bouton Rechercher et fermeture.
 * - Ne ferme jamais automatiquement la recherche pendant la saisie ou lorsque le champ contient du texte.
 * - Se referme uniquement sur clic du bouton de fermeture, clic extérieur lorsque le champ est vide et sans filtre actif,
 *   ou lors de la navigation après soumission.
 */
export const MobileExpandableSearch: React.FC<MobileExpandableSearchProps> = ({
  searchQuery,
  onSearchQueryChange,
  quickLevel,
  onQuickLevelChange,
  quickDomain,
  onQuickDomainChange,
  quickCountry,
  onQuickCountryChange,
  availableCountries,
  onSubmitSearch,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFiltersCount =
    (quickLevel !== 'TOUS' ? 1 : 0) +
    (quickDomain !== 'TOUS' ? 1 : 0) +
    (quickCountry !== 'TOUS' ? 1 : 0);

  // Place automatiquement le curseur dans le champ à l'ouverture
  useEffect(() => {
    if (isExpanded) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [isExpanded]);

  // Fermeture au toucher à l'extérieur uniquement si le champ est vide, inactif et sans filtre sélectionné
  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        const isInputEmpty = searchQuery.trim() === '';
        const isInputFocused = document.activeElement === inputRef.current;

        if (isInputEmpty && !isInputFocused && activeFiltersCount === 0) {
          setIsExpanded(false);
          setIsFiltersOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, [isExpanded, searchQuery, activeFiltersCount]);

  const handleOpenSearch = () => {
    setIsExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsExpanded(false);
    setIsFiltersOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    onSubmitSearch(e);
    setIsExpanded(false);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    onQuickLevelChange('TOUS');
    onQuickDomainChange('TOUS');
    onQuickCountryChange('TOUS');
  };

  return (
    <div ref={containerRef} className="md:hidden w-full">
      {/* En-tête mobile supérieur : Titre + Bouton compact de recherche (loupe) */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-sans font-bold text-[#203454] tracking-tight leading-snug">
          Trouvons la bourse qui te correspond.
        </h1>

        <button
          type="button"
          onClick={isExpanded ? handleCloseSearch : handleOpenSearch}
          aria-label="Rechercher une bourse"
          aria-expanded={isExpanded}
          aria-controls="mobile-expandable-search-panel"
          className={`relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ease-out motion-reduce:transition-none shadow-xs ${
            isExpanded
              ? 'bg-[#3457D5] text-white border-[#3457D5] scale-95'
              : 'bg-white text-[#3457D5] border-[#E6ECF5] hover:bg-[#F8FAFD] active:scale-95'
          }`}
        >
          <Search className="w-5 h-5" />
          {!isExpanded &&
            (searchQuery.trim() !== '' || activeFiltersCount > 0) && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3457D5] ring-2 ring-white"
              />
            )}
        </button>
      </div>

      {/* Panneau de recherche déployable avec animation fluide (220ms) */}
      <div
        id="mobile-expandable-search-panel"
        role="region"
        aria-label="Recherche principale de bourses sur mobile"
        aria-hidden={!isExpanded}
        className={`grid transition-all duration-200 ease-out motion-reduce:transition-none ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100 mt-3'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-white border border-[#E6ECF5] rounded-2xl p-3.5 shadow-xs">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Ligne de saisie animée + bouton de fermeture */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search
                    aria-hidden="true"
                    className="w-4 h-4 text-[#3457D5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="Recherche une bourse, une formation ou un pays…"
                    aria-label="Recherche une bourse, une formation ou un pays"
                    tabIndex={isExpanded ? 0 : -1}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-sm text-[#253047] placeholder:text-[#69768C] focus:outline-none focus:bg-white focus:border-[#3457D5] transition-colors duration-200 motion-reduce:transition-none"
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onSearchQueryChange('');
                        inputRef.current?.focus();
                      }}
                      aria-label="Effacer le texte de recherche"
                      tabIndex={isExpanded ? 0 : -1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#69768C] hover:text-[#203454] rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCloseSearch}
                  aria-label="Fermer la recherche"
                  tabIndex={isExpanded ? 0 : -1}
                  className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#E6ECF5]/60 border border-[#E6ECF5] text-[#69768C] hover:text-[#203454] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Barre d'actions : Bouton secondaire « Filtres » à la demande + Bouton principal « Rechercher » */}
              <div className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen((prev) => !prev)}
                  aria-expanded={isFiltersOpen}
                  aria-controls="mobile-search-filters-drawer"
                  tabIndex={isExpanded ? 0 : -1}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                    isFiltersOpen || activeFiltersCount > 0
                      ? 'bg-[#3457D5]/10 border-[#3457D5]/30 text-[#3457D5]'
                      : 'bg-[#F8FAFD] border-[#E6ECF5] text-[#253047] hover:border-[#3457D5]/40'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#3457D5] text-white text-[10px] font-bold tabular-nums">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <button
                  type="submit"
                  tabIndex={isExpanded ? 0 : -1}
                  className="flex-1 min-h-[44px] px-5 py-2.5 bg-[#3457D5] hover:bg-[#203454] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Rechercher
                </button>
              </div>

              {/* Zone dépliable des 3 filtres à la demande */}
              <div
                id="mobile-search-filters-drawer"
                aria-hidden={!isFiltersOpen}
                className={`grid transition-all duration-200 ease-out motion-reduce:transition-none ${
                  isFiltersOpen
                    ? 'grid-rows-[1fr] opacity-100 pt-2 border-t border-[#E6ECF5]'
                    : 'grid-rows-[0fr] opacity-0 pt-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#69768C]">
                    <span>Affiner la recherche</span>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        tabIndex={isExpanded && isFiltersOpen ? 0 : -1}
                        className="text-[#3457D5] hover:underline cursor-pointer"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label
                        htmlFor="mobile-filter-level"
                        className="block text-[11px] font-medium text-[#69768C] mb-1"
                      >
                        Niveau d’études
                      </label>
                      <select
                        id="mobile-filter-level"
                        aria-label="Filtrer par niveau d'études (mobile)"
                        value={quickLevel}
                        onChange={(e) => onQuickLevelChange(e.target.value)}
                        tabIndex={isExpanded && isFiltersOpen ? 0 : -1}
                        className="w-full px-3 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
                      >
                        <option value="TOUS">Niveau d’études (Tous)</option>
                        {ACADEMIC_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mobile-filter-domain"
                        className="block text-[11px] font-medium text-[#69768C] mb-1"
                      >
                        Domaine de formation
                      </label>
                      <select
                        id="mobile-filter-domain"
                        aria-label="Filtrer par domaine de formation (mobile)"
                        value={quickDomain}
                        onChange={(e) => onQuickDomainChange(e.target.value)}
                        tabIndex={isExpanded && isFiltersOpen ? 0 : -1}
                        className="w-full px-3 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
                      >
                        <option value="TOUS">Domaine (Tous)</option>
                        {STUDY_DOMAINS.map((dom) => (
                          <option key={dom} value={dom}>
                            {dom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mobile-filter-country"
                        className="block text-[11px] font-medium text-[#69768C] mb-1"
                      >
                        Pays de destination
                      </label>
                      <select
                        id="mobile-filter-country"
                        aria-label="Filtrer par pays de destination (mobile)"
                        value={quickCountry}
                        onChange={(e) => onQuickCountryChange(e.target.value)}
                        tabIndex={isExpanded && isFiltersOpen ? 0 : -1}
                        className="w-full px-3 py-2.5 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl text-xs font-medium text-[#253047] focus:outline-none focus:border-[#3457D5]"
                      >
                        <option value="TOUS">Pays (Toutes destinations)</option>
                        {availableCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
