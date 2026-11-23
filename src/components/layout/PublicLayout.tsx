import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ChevronDown,
  Compass,
  Home,
  LogOut,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const PublicLayout: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    currentStudent,
    switchDemoRole,
    logoutUser,
    toastMessage,
  } = useApp();
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setAvatarDropdownOpen(false);
    setDemoDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickRoleEnter = (role: UserRole, path: string) => {
    switchDemoRole(role);
    setDemoDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setAvatarDropdownOpen(false);
    logoutUser();
    navigate('/');
  };

  const studentInitials = `${currentStudent.firstName.charAt(0)}${currentStudent.lastName.charAt(0)}`;
  const isOrganismesSection =
    location.pathname.startsWith('/organismes') ||
    location.pathname.startsWith('/tarification');

  // Affiche la barre inférieure mobile permanente pour l'étudiant connecté (ex: sur /bourses, /bourses/:id)
  const showStudentMobileBottomBar =
    isAuthenticated && currentUser.role === 'STUDENT';

  const studentBottomNavItems = [
    {
      label: 'Accueil',
      to: '/etudiant/tableau-de-bord',
      icon: Home,
      isActive: location.pathname === '/etudiant/tableau-de-bord',
    },
    {
      label: 'Explorer',
      to: '/etudiant/recherche',
      icon: Compass,
      isActive:
        location.pathname.startsWith('/bourses') ||
        location.pathname.startsWith('/etudiant/recherche') ||
        location.pathname.startsWith('/etudiant/bourses'),
    },
    {
      label: 'Pour moi',
      to: '/etudiant/recommandations',
      icon: Sparkles,
      isActive:
        location.pathname.startsWith('/etudiant/recommandations') ||
        location.pathname.startsWith('/etudiant/eligibilite'),
    },
    {
      label: 'Activités',
      to: '/etudiant/favoris',
      icon: Bookmark,
      isActive:
        location.pathname.startsWith('/etudiant/favoris') ||
        location.pathname.startsWith('/etudiant/invitations') ||
        location.pathname.startsWith('/etudiant/notifications'),
    },
    {
      label: 'Profil',
      to: '/etudiant/profil',
      icon: User,
      isActive:
        location.pathname.startsWith('/etudiant/profil') ||
        location.pathname.startsWith('/etudiant/confidentialite'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD] text-[#253047]">
      {/* En-tête public moderne et épuré */}
      <header className="bg-white border-b border-[#E6ECF5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 lg:gap-6">
          {/* Marque */}
          <Link
            to="/"
            className="text-base font-bold text-[#203454] tracking-tight flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-xl bg-[#3457D5] text-white flex items-center justify-center text-xs font-bold">
              SF
            </span>
            <span>SCHOLARFIND</span>
          </Link>

          {/* Navigation principale : Explorer les bourses, Comment ça marche, Pour les organismes, Mon espace */}
          <nav
            aria-label="Navigation principale publique"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#69768C]"
          >
            <NavLink
              to="/bourses"
              className={({ isActive }) =>
                `transition-colors whitespace-nowrap py-1 ${
                  isActive
                    ? 'text-[#3457D5] font-semibold'
                    : 'hover:text-[#203454]'
                }`
              }
            >
              Explorer les bourses
            </NavLink>
            <NavLink
              to="/fonctionnement"
              className={({ isActive }) =>
                `transition-colors whitespace-nowrap py-1 ${
                  isActive
                    ? 'text-[#3457D5] font-semibold'
                    : 'hover:text-[#203454]'
                }`
              }
            >
              Comment ça marche
            </NavLink>
            <NavLink
              to="/organismes"
              className={() =>
                `transition-colors whitespace-nowrap py-1 ${
                  isOrganismesSection
                    ? 'text-[#3457D5] font-semibold'
                    : 'hover:text-[#203454]'
                }`
              }
            >
              Pour les organismes
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/etudiant/tableau-de-bord"
                className={({ isActive }) =>
                  `transition-colors whitespace-nowrap py-1 ${
                    isActive
                      ? 'text-[#3457D5] font-semibold'
                      : 'hover:text-[#203454]'
                  }`
                }
              >
                Mon espace
              </NavLink>
            )}
          </nav>

          {/* Actions à droite : Menu démo discret + Avatar étudiant connecté OU Connexion / Inscription */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-3 py-2 text-xs font-medium text-[#69768C] hover:text-[#203454] bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Espaces démo</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E6ECF5] rounded-2xl p-2 shadow-sm z-40 space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-[#69768C] uppercase tracking-wider">
                    Changer d’espace
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRoleEnter(
                        'STUDENT',
                        '/etudiant/tableau-de-bord'
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      isAuthenticated && currentUser.role === 'STUDENT'
                        ? 'bg-[#3457D5] text-white'
                        : 'text-[#253047] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    Espace Étudiant
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRoleEnter(
                        'ORGANIZATION',
                        '/organisme/tableau-de-bord'
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      isAuthenticated && currentUser.role === 'ORGANIZATION'
                        ? 'bg-[#3457D5] text-white'
                        : 'text-[#253047] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    Espace Organisme
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRoleEnter(
                        'CURATOR',
                        '/curateur/tableau-de-bord'
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      isAuthenticated && currentUser.role === 'CURATOR'
                        ? 'bg-[#3457D5] text-white'
                        : 'text-[#253047] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    Espace Curateur
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRoleEnter('ADMIN', '/admin/tableau-de-bord')
                    }
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      isAuthenticated && currentUser.role === 'ADMIN'
                        ? 'bg-[#3457D5] text-white'
                        : 'text-[#253047] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    Espace Administrateur
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/etudiant/tableau-de-bord"
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#3457D5] bg-[#3457D5]/10 hover:bg-[#3457D5] hover:text-white rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Mon espace
                </Link>

                {/* Avatar étudiant avec menu déroulant */}
                <div className="relative" ref={avatarRef}>
                  <button
                    type="button"
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    aria-label="Menu de mon profil"
                    aria-expanded={avatarDropdownOpen}
                    className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-[#F8FAFD] hover:bg-[#E6ECF5]/60 border border-[#E6ECF5] transition-colors cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#3457D5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {studentInitials}
                    </span>
                    <span className="hidden lg:inline text-xs font-semibold text-[#203454] max-w-[110px] truncate">
                      {currentStudent.firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#69768C]" />
                  </button>

                  {avatarDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-white border border-[#E6ECF5] rounded-2xl p-2 shadow-sm z-40 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-[#E6ECF5] mb-1">
                        <div className="text-xs font-bold text-[#203454] truncate">
                          {currentStudent.firstName} {currentStudent.lastName}
                        </div>
                        <div className="text-[11px] text-[#69768C] truncate">
                          Objectif {currentStudent.targetStudyLevel || 'Bourse'} · {currentStudent.studyDomain}
                        </div>
                      </div>

                      <Link
                        to="/etudiant/profil"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#3457D5]" />
                        <span>Mon profil</span>
                      </Link>

                      <Link
                        to="/etudiant/profil?mode=edit&step=4"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5] transition-colors"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-[#69768C]" />
                        <span>Mes préférences</span>
                      </Link>

                      <Link
                        to="/etudiant/confidentialite"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#69768C]" />
                        <span>Paramètres</span>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-[#E6ECF5]">
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#B42318] hover:bg-[#B42318]/10 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Visiteur non connecté : Connexion et Inscription */
              <div className="flex items-center gap-2">
                <Link
                  to="/connexion"
                  className="px-3.5 py-2 text-xs font-semibold text-[#203454] hover:text-[#3457D5] bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl transition-colors whitespace-nowrap"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#3457D5] hover:bg-[#203454] rounded-xl transition-colors whitespace-nowrap"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation mobile sous l'en-tête */}
        <div className="md:hidden border-t border-[#E6ECF5] bg-[#F8FAFD] px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-[#69768C]">
          <Link
            to="/bourses"
            className="whitespace-nowrap hover:text-[#3457D5] inline-flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-[#3457D5]" />
            <span>Explorer les bourses</span>
          </Link>
          <Link
            to="/fonctionnement"
            className="whitespace-nowrap hover:text-[#3457D5]"
          >
            Comment ça marche
          </Link>
          <Link
            to="/organismes"
            className="whitespace-nowrap hover:text-[#3457D5]"
          >
            Pour les organismes
          </Link>
          {isAuthenticated ? (
            <Link
              to="/etudiant/tableau-de-bord"
              className="whitespace-nowrap text-[#3457D5] font-semibold"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              to="/connexion"
              className="whitespace-nowrap text-[#3457D5] font-semibold"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* Notification Toast globale */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-5 right-5 z-50 bg-[#203454] text-white px-4 py-3 rounded-xl text-xs font-medium max-w-md shadow-sm"
        >
          {toastMessage}
        </div>
      )}

      {/* Contenu principal */}
      <main className={`flex-1 ${showStudentMobileBottomBar ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>

      {/* Pied de page épuré */}
      <footer className={`bg-white border-t border-[#E6ECF5] mt-16 ${showStudentMobileBottomBar ? 'pb-16 md:pb-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E6ECF5]">
            <div className="space-y-2.5 md:col-span-2">
              <div className="text-base font-bold text-[#203454] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#3457D5] text-white flex items-center justify-center text-[11px] font-bold">
                  SF
                </span>
                <span>SCHOLARFIND</span>
              </div>
              <p className="text-xs text-[#69768C] max-w-md leading-relaxed">
                Plateforme de découverte et de vérification d’éligibilité aux
                bourses d’études (Baccalauréat, BTS, DUT, HND, Licence, Master,
                Doctorat et formation professionnelle).
              </p>
              <p className="text-xs text-[#69768C]">
                100 % gratuit pour les étudiants · Profil privé par défaut (Loi camerounaise n° 2024/017).
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#203454]">Navigation</div>
              <ul className="space-y-1.5 text-xs text-[#69768C]">
                <li>
                  <Link to="/bourses" className="hover:text-[#3457D5]">
                    Explorer les bourses
                  </Link>
                </li>
                <li>
                  <Link to="/fonctionnement" className="hover:text-[#3457D5]">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link to="/organismes" className="hover:text-[#3457D5]">
                    Pour les organismes
                  </Link>
                </li>
                <li>
                  <Link to="/tarification" className="hover:text-[#3457D5]">
                    Offres & Tarifs organismes
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#203454]">
                Mon compte & Espaces
              </div>
              <ul className="space-y-1.5 text-xs text-[#69768C]">
                <li>
                  <Link
                    to="/etudiant/tableau-de-bord"
                    className="hover:text-[#3457D5]"
                  >
                    Mon espace étudiant
                  </Link>
                </li>
                <li>
                  <Link
                    to="/etudiant/profil"
                    className="hover:text-[#3457D5]"
                  >
                    Mon profil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/organisme/tableau-de-bord"
                    className="hover:text-[#3457D5]"
                  >
                    Espace Organisme
                  </Link>
                </li>
                <li>
                  <Link
                    to="/curateur/tableau-de-bord"
                    className="hover:text-[#3457D5]"
                  >
                    Espace Curateur
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#69768C]">
            <div>© 2026 SCHOLARFIND — Plateforme de découverte de bourses.</div>
            <div>Données de démonstration interactives.</div>
          </div>
        </div>
      </footer>

      {/* Barre de navigation inférieure permanente sur smartphone pour l'étudiant (5 destinations) */}
      {showStudentMobileBottomBar && (
        <nav
          aria-label="Navigation rapide mobile"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E6ECF5] px-1.5 py-1.5 flex items-center justify-around z-30"
        >
          {studentBottomNavItems.map((navItem) => {
            const Icon = navItem.icon;
            return (
              <Link
                key={navItem.to}
                to={navItem.to}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                  navItem.isActive
                    ? 'text-[#3457D5] bg-[#3457D5]/10 font-semibold'
                    : 'text-[#69768C]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{navItem.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
