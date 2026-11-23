import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Compass,
  CreditCard,
  Database,
  FileCheck2,
  FileSearch,
  FolderKanban,
  History,
  Home,
  LogOut,
  MailOpen,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badgeCount?: number;
  activePrefixes?: string[];
}

export const WorkspaceLayout: React.FC<{ workspaceRole: UserRole }> = ({
  workspaceRole,
}) => {
  const {
    currentUser,
    currentStudent,
    currentOrganization,
    users,
    scholarships,
    invitations,
    applications,
    notifications,
    duplicates,
    switchDemoUser,
    switchDemoRole,
    logoutUser,
    resetDemoData,
    toastMessage,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronise le rôle de démonstration si l'utilisateur navigue directement vers l'URL d'un espace
  useEffect(() => {
    if (currentUser.role !== workspaceRole) {
      switchDemoRole(workspaceRole);
    }
  }, [workspaceRole]);

  useEffect(() => {
    setAvatarDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAvatarDropdownOpen(false);
    logoutUser();
    navigate('/');
  };

  const studentPendingInvitations = invitations.filter(
    (i) => i.studentId === currentStudent.id && i.status === 'PENDING'
  ).length;

  const studentUnreadNotifs = notifications.filter(
    (n) => n.userId === currentUser.id && !n.read
  ).length;

  const studentActivitiesBadge =
    studentPendingInvitations + studentUnreadNotifs;

  const pendingCurationCount = scholarships.filter(
    (s) => s.curationStatus === 'PENDING_REVIEW'
  ).length;

  const pendingDuplicatesCount = duplicates.filter(
    (d) => d.status === 'PENDING'
  ).length;

  const orgApplicationsCount = applications.filter(
    (a) => a.organizationId === currentOrganization.id
  ).length;

  // Navigation structurée : 5 destinations principales pour l'espace étudiant
  const navItemsByRole: Record<
    UserRole,
    { sectionTitle: string; items: NavItem[] }[]
  > = {
    STUDENT: [
      {
        sectionTitle: 'Navigation',
        items: [
          {
            label: 'Accueil',
            to: '/etudiant/tableau-de-bord',
            icon: Home,
            activePrefixes: ['/etudiant/tableau-de-bord'],
          },
          {
            label: 'Explorer',
            to: '/etudiant/recherche',
            icon: Compass,
            activePrefixes: [
              '/etudiant/recherche',
              '/etudiant/bourses',
              '/bourses',
            ],
          },
          {
            label: 'Pour moi',
            to: '/etudiant/recommandations',
            icon: Sparkles,
            activePrefixes: [
              '/etudiant/recommandations',
              '/etudiant/eligibilite',
            ],
          },
          {
            label: 'Activités',
            to: '/etudiant/favoris',
            icon: Bookmark,
            badgeCount: studentActivitiesBadge,
            activePrefixes: [
              '/etudiant/favoris',
              '/etudiant/invitations',
              '/etudiant/notifications',
            ],
          },
          {
            label: 'Profil',
            to: '/etudiant/profil',
            icon: User,
            activePrefixes: [
              '/etudiant/profil',
              '/etudiant/confidentialite',
            ],
          },
        ],
      },
    ],
    ORGANIZATION: [
      {
        sectionTitle: 'Accueil',
        items: [
          {
            label: 'Tableau de bord',
            to: '/organisme/tableau-de-bord',
            icon: Home,
          },
        ],
      },
      {
        sectionTitle: 'Programmes',
        items: [
          {
            label: 'Mes programmes',
            to: '/organisme/programmes',
            icon: FolderKanban,
          },
          {
            label: 'Créer une campagne',
            to: '/organisme/creer-campagne',
            icon: FileCheck2,
          },
        ],
      },
      {
        sectionTitle: 'Candidats',
        items: [
          {
            label: 'Rechercher des profils',
            to: '/organisme/recherche-candidats',
            icon: Search,
          },
          {
            label: 'Invitations envoyées',
            to: '/organisme/invitations',
            icon: MailOpen,
          },
          {
            label: 'Candidatures reçues',
            to: '/organisme/candidatures',
            icon: Users,
            badgeCount: orgApplicationsCount,
          },
        ],
      },
      {
        sectionTitle: 'Sélection',
        items: [
          {
            label: 'Évaluations',
            to: '/organisme/evaluations',
            icon: UserCheck,
          },
          {
            label: 'Décisions',
            to: '/organisme/decisions',
            icon: CheckSquare,
          },
        ],
      },
      {
        sectionTitle: 'Organisation',
        items: [
          {
            label: 'Profil organisme',
            to: '/organisme/profil',
            icon: Building2,
          },
          {
            label: 'Statistiques',
            to: '/organisme/statistiques',
            icon: Database,
          },
          {
            label: 'Abonnement',
            to: '/organisme/abonnement',
            icon: CreditCard,
          },
        ],
      },
    ],
    CURATOR: [
      {
        sectionTitle: 'Accueil',
        items: [
          {
            label: 'Tableau de bord',
            to: '/curateur/tableau-de-bord',
            icon: Home,
          },
        ],
      },
      {
        sectionTitle: 'Vérification',
        items: [
          {
            label: 'Annonces à vérifier',
            to: '/curateur/annonces',
            icon: FileSearch,
            badgeCount: pendingCurationCount,
          },
          {
            label: 'Doublons détectés',
            to: '/curateur/doublons',
            icon: ShieldAlert,
            badgeCount: pendingDuplicatesCount,
          },
        ],
      },
      {
        sectionTitle: 'Sources & Suivi',
        items: [
          {
            label: 'Sources officielles',
            to: '/curateur/sources',
            icon: Database,
          },
          {
            label: 'Historique',
            to: '/curateur/historique',
            icon: History,
          },
        ],
      },
    ],
    ADMIN: [
      {
        sectionTitle: 'Accueil',
        items: [
          {
            label: 'Tableau de bord',
            to: '/admin/tableau-de-bord',
            icon: Home,
          },
        ],
      },
      {
        sectionTitle: 'Communauté',
        items: [
          {
            label: 'Utilisateurs',
            to: '/admin/utilisateurs',
            icon: Users,
          },
          {
            label: 'Organismes',
            to: '/admin/organismes',
            icon: Building2,
          },
        ],
      },
      {
        sectionTitle: 'Catalogue',
        items: [
          {
            label: 'Programmes',
            to: '/admin/programmes',
            icon: FolderKanban,
          },
          {
            label: 'Sources de données',
            to: '/admin/sources',
            icon: Database,
          },
        ],
      },
      {
        sectionTitle: 'Gestion',
        items: [
          {
            label: 'Abonnements',
            to: '/admin/abonnements',
            icon: CreditCard,
          },
          {
            label: 'Journaux d’audit',
            to: '/admin/audit',
            icon: History,
          },
          {
            label: 'Paramètres',
            to: '/admin/parametres',
            icon: Settings,
          },
        ],
      },
    ],
  };

  const roleLabels: Record<
    UserRole,
    { title: string; subtitle: string; initials: string }
  > = {
    STUDENT: {
      title: 'Espace Étudiant',
      subtitle: `${currentStudent.firstName} ${currentStudent.lastName}`,
      initials: `${currentStudent.firstName.charAt(0)}${currentStudent.lastName.charAt(0)}`,
    },
    ORGANIZATION: {
      title: 'Espace Organisme',
      subtitle: currentOrganization.officialName,
      initials: 'OR',
    },
    CURATOR: {
      title: 'Espace Curateur',
      subtitle: 'Contrôle qualité des bourses',
      initials: 'CU',
    },
    ADMIN: {
      title: 'Espace Administrateur',
      subtitle: 'Supervision plateforme',
      initials: 'AD',
    },
  };

  const mobileBottomNavByRole: Record<
    UserRole,
    {
      label: string;
      to: string;
      icon: React.ElementType;
      activePrefixes?: string[];
    }[]
  > = {
    STUDENT: [
      {
        label: 'Accueil',
        to: '/etudiant/tableau-de-bord',
        icon: Home,
        activePrefixes: ['/etudiant/tableau-de-bord'],
      },
      {
        label: 'Explorer',
        to: '/etudiant/recherche',
        icon: Compass,
        activePrefixes: [
          '/etudiant/recherche',
          '/etudiant/bourses',
          '/bourses',
        ],
      },
      {
        label: 'Pour moi',
        to: '/etudiant/recommandations',
        icon: Sparkles,
        activePrefixes: [
          '/etudiant/recommandations',
          '/etudiant/eligibilite',
        ],
      },
      {
        label: 'Activités',
        to: '/etudiant/favoris',
        icon: Bookmark,
        activePrefixes: [
          '/etudiant/favoris',
          '/etudiant/invitations',
          '/etudiant/notifications',
        ],
      },
      {
        label: 'Profil',
        to: '/etudiant/profil',
        icon: User,
        activePrefixes: [
          '/etudiant/profil',
          '/etudiant/confidentialite',
        ],
      },
    ],
    ORGANIZATION: [
      { label: 'Accueil', to: '/organisme/tableau-de-bord', icon: Home },
      { label: 'Programmes', to: '/organisme/programmes', icon: FolderKanban },
      {
        label: 'Candidats',
        to: '/organisme/recherche-candidats',
        icon: Search,
      },
      { label: 'Dossiers', to: '/organisme/candidatures', icon: Users },
      { label: 'Profil', to: '/organisme/profil', icon: Building2 },
    ],
    CURATOR: [
      { label: 'Accueil', to: '/curateur/tableau-de-bord', icon: Home },
      { label: 'Annonces', to: '/curateur/annonces', icon: FileSearch },
      { label: 'Sources', to: '/curateur/sources', icon: Database },
      { label: 'Doublons', to: '/curateur/doublons', icon: ShieldAlert },
      { label: 'Historique', to: '/curateur/historique', icon: History },
    ],
    ADMIN: [
      { label: 'Accueil', to: '/admin/tableau-de-bord', icon: Home },
      { label: 'Comptes', to: '/admin/utilisateurs', icon: Users },
      { label: 'Organismes', to: '/admin/organismes', icon: Building2 },
      { label: 'Bourses', to: '/admin/programmes', icon: FolderKanban },
      { label: 'Audit', to: '/admin/audit', icon: History },
    ],
  };

  const handleRoleSwitch = (role: UserRole, path: string) => {
    switchDemoRole(role);
    setMobileMenuOpen(false);
    setDemoMenuOpen(false);
    navigate(path);
  };

  const sections = navItemsByRole[workspaceRole];
  const mobileBottomItems = mobileBottomNavByRole[workspaceRole];

  const isNavItemActive = (item: { to: string; activePrefixes?: string[] }) => {
    if (item.activePrefixes && item.activePrefixes.length > 0) {
      return item.activePrefixes.some((prefix) =>
        location.pathname.startsWith(prefix)
      );
    }
    const [itemPath] = item.to.split('?');
    return location.pathname === itemPath;
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFD] text-[#253047]">
      {/* Barre latérale Desktop compacte (240px, affichée dès md >= 768px) */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-white border-r border-[#E6ECF5] z-30">
        {/* En-tête de marque */}
        <div className="h-15 px-5 border-b border-[#E6ECF5] flex items-center">
          <Link
            to="/"
            className="text-base font-bold text-[#203454] tracking-tight flex items-center gap-2.5"
          >
            <span className="w-7 h-7 rounded-lg bg-[#3457D5] text-white flex items-center justify-center text-xs font-bold shrink-0">
              SF
            </span>
            <span>SCHOLARFIND</span>
          </Link>
        </div>

        {/* Identité compacte de l'utilisateur / espace courant (cliquable pour l'étudiant) */}
        <Link
          to={workspaceRole === 'STUDENT' ? '/etudiant/profil' : '#'}
          className="px-4 py-3 border-b border-[#E6ECF5] flex items-center gap-3 hover:bg-[#F8FAFD] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#3457D5] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {roleLabels[workspaceRole].initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#253047] truncate">
              {roleLabels[workspaceRole].subtitle}
            </div>
            <div className="text-[11px] text-[#69768C] truncate">
              {workspaceRole === 'STUDENT' && currentStudent.targetStudyLevel
                ? `Objectif ${currentStudent.targetStudyLevel}`
                : roleLabels[workspaceRole].title}
            </div>
          </div>
        </Link>

        {/* Liens de navigation */}
        <nav
          aria-label={`Navigation ${roleLabels[workspaceRole].title}`}
          className="flex-1 overflow-y-auto px-3 py-4 space-y-4"
        >
          {sections.map((sec) => (
            <div key={sec.sectionTitle}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#69768C]">
                {sec.sectionTitle}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#3457D5] text-white font-semibold'
                          : 'text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span
                          className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-white text-[#3457D5]'
                              : 'bg-[#F5A17B]/20 text-[#203454]'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Menu compact réservé à la démonstration (replié par défaut) */}
        <div className="p-3 border-t border-[#E6ECF5] bg-[#F8FAFD]">
          <button
            type="button"
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#69768C] hover:text-[#253047] hover:bg-white transition-colors cursor-pointer"
          >
            <span>Menu démonstration</span>
            {demoMenuOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {demoMenuOpen && (
            <div className="mt-2 pt-2 border-t border-[#E6ECF5] space-y-2.5">
              {workspaceRole === 'STUDENT' && (
                <div>
                  <label
                    htmlFor="demo-student-switcher"
                    className="block text-[11px] font-medium text-[#69768C] mb-1"
                  >
                    Profil étudiant actif :
                  </label>
                  <select
                    id="demo-student-switcher"
                    value={currentUser.id}
                    onChange={(e) => switchDemoUser(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E6ECF5] rounded-lg px-2 py-1.5 text-[#253047] focus:outline-none focus:border-[#3457D5]"
                  >
                    {users
                      .filter((u) => u.role === 'STUDENT')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {workspaceRole === 'ORGANIZATION' && (
                <div>
                  <label
                    htmlFor="demo-org-switcher"
                    className="block text-[11px] font-medium text-[#69768C] mb-1"
                  >
                    Organisme actif :
                  </label>
                  <select
                    id="demo-org-switcher"
                    value={currentUser.id}
                    onChange={(e) => switchDemoUser(e.target.value)}
                    className="w-full text-xs bg-white border border-[#E6ECF5] rounded-lg px-2 py-1.5 text-[#253047]"
                  >
                    {users
                      .filter((u) => u.role === 'ORGANIZATION')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <div className="text-[11px] font-medium text-[#69768C] mb-1">
                  Changer d’espace :
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleSwitch('STUDENT', '/etudiant/tableau-de-bord')
                    }
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium text-left border cursor-pointer ${
                      workspaceRole === 'STUDENT'
                        ? 'bg-[#3457D5] text-white border-[#3457D5]'
                        : 'bg-white text-[#253047] border-[#E6ECF5]'
                    }`}
                  >
                    Étudiant
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleSwitch(
                        'ORGANIZATION',
                        '/organisme/tableau-de-bord'
                      )
                    }
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium text-left border cursor-pointer ${
                      workspaceRole === 'ORGANIZATION'
                        ? 'bg-[#3457D5] text-white border-[#3457D5]'
                        : 'bg-white text-[#253047] border-[#E6ECF5]'
                    }`}
                  >
                    Organisme
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleSwitch('CURATOR', '/curateur/tableau-de-bord')
                    }
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium text-left border cursor-pointer ${
                      workspaceRole === 'CURATOR'
                        ? 'bg-[#3457D5] text-white border-[#3457D5]'
                        : 'bg-white text-[#253047] border-[#E6ECF5]'
                    }`}
                  >
                    Curateur
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleSwitch('ADMIN', '/admin/tableau-de-bord')
                    }
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium text-left border cursor-pointer ${
                      workspaceRole === 'ADMIN'
                        ? 'bg-[#3457D5] text-white border-[#3457D5]'
                        : 'bg-white text-[#253047] border-[#E6ECF5]'
                    }`}
                  >
                    Administrateur
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={resetDemoData}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-[#69768C] hover:text-[#253047] bg-white border border-[#E6ECF5] rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser la démo
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Colonne principale */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0">
        {/* Barre supérieure épurée (sans badge Profil privé permanent + Avatar avec menu déroulant) */}
        <header className="h-14 sm:h-15 bg-white border-b border-[#E6ECF5] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/"
              className="md:hidden w-7 h-7 rounded-lg bg-[#3457D5] text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              SF
            </Link>
            <div className="text-xs text-[#69768C] truncate">
              <span className="font-semibold text-[#203454]">
                {roleLabels[workspaceRole].title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {workspaceRole === 'STUDENT' && (
              <Link
                to="/etudiant/notifications"
                aria-label="Notifications"
                className="relative p-2 rounded-full bg-[#F8FAFD] border border-[#E6ECF5] text-[#253047] hover:text-[#3457D5]"
              >
                <Bell className="w-4 h-4" />
                {studentUnreadNotifs > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#F5A17B] absolute top-1.5 right-1.5" />
                )}
              </Link>
            )}

            {workspaceRole === 'ORGANIZATION' && (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${
                  currentOrganization.isVerified
                    ? 'bg-[#DDF5EB] text-[#14533C]'
                    : 'bg-[#F5A17B]/25 text-[#9A3412]'
                }`}
              >
                {currentOrganization.isVerified
                  ? 'Organisme vérifié'
                  : 'Vérification en attente'}
              </span>
            )}

            {/* Bouton mobile uniquement pour le menu de démonstration */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu démonstration"
              className="md:hidden px-2.5 py-1.5 rounded-lg border border-[#E6ECF5] bg-[#F8FAFD] text-xs font-medium text-[#69768C] flex items-center gap-1"
            >
              <span>Démo</span>
              {mobileMenuOpen ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Avatar de l'utilisateur avec menu déroulant */}
            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                aria-label="Menu de mon profil"
                aria-expanded={avatarDropdownOpen}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-[#F8FAFD] hover:bg-[#E6ECF5]/60 border border-[#E6ECF5] transition-colors cursor-pointer"
              >
                <span className="w-7 h-7 rounded-full bg-[#3457D5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {roleLabels[workspaceRole].initials}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-[#203454] max-w-[120px] truncate">
                  {workspaceRole === 'STUDENT'
                    ? currentStudent.firstName
                    : roleLabels[workspaceRole].subtitle}
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
                      {roleLabels[workspaceRole].subtitle}
                    </div>
                    <div className="text-[11px] text-[#69768C] truncate">
                      {workspaceRole === 'STUDENT'
                        ? `${currentStudent.currentStudyLevel || 'Étudiant'} · Objectif ${currentStudent.targetStudyLevel || 'Bourse'}`
                        : roleLabels[workspaceRole].title}
                    </div>
                  </div>

                  {workspaceRole === 'STUDENT' ? (
                    <>
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
                    </>
                  ) : workspaceRole === 'ORGANIZATION' ? (
                    <>
                      <Link
                        to="/organisme/profil"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5] transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-[#3457D5]" />
                        <span>Profil organisme</span>
                      </Link>
                      <Link
                        to="/organisme/abonnement"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#253047] hover:bg-[#F8FAFD] hover:text-[#3457D5] transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-[#69768C]" />
                        <span>Abonnements & facturation</span>
                      </Link>
                    </>
                  ) : null}

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
        </header>

        {/* Tiroir mobile réservé au changement de profil/espace démo */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E6ECF5] px-4 py-3.5 space-y-3 z-30">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#69768C]">
              Menu démonstration
            </div>
            {workspaceRole === 'STUDENT' && (
              <div>
                <label
                  htmlFor="mobile-demo-student"
                  className="block text-[11px] text-[#69768C] mb-1"
                >
                  Profil étudiant actif :
                </label>
                <select
                  id="mobile-demo-student"
                  value={currentUser.id}
                  onChange={(e) => switchDemoUser(e.target.value)}
                  className="w-full text-xs bg-[#F8FAFD] border border-[#E6ECF5] rounded-lg px-2.5 py-2 text-[#253047]"
                >
                  {users
                    .filter((u) => u.role === 'STUDENT')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleRoleSwitch('STUDENT', '/etudiant/tableau-de-bord')
                }
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${
                  workspaceRole === 'STUDENT'
                    ? 'bg-[#3457D5] text-white border-[#3457D5]'
                    : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#253047]'
                }`}
              >
                Étudiant
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRoleSwitch('ORGANIZATION', '/organisme/tableau-de-bord')
                }
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${
                  workspaceRole === 'ORGANIZATION'
                    ? 'bg-[#3457D5] text-white border-[#3457D5]'
                    : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#253047]'
                }`}
              >
                Organisme
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRoleSwitch('CURATOR', '/curateur/tableau-de-bord')
                }
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${
                  workspaceRole === 'CURATOR'
                    ? 'bg-[#3457D5] text-white border-[#3457D5]'
                    : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#253047]'
                }`}
              >
                Curateur
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRoleSwitch('ADMIN', '/admin/tableau-de-bord')
                }
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${
                  workspaceRole === 'ADMIN'
                    ? 'bg-[#3457D5] text-white border-[#3457D5]'
                    : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#253047]'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Toast de confirmation */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-16 md:bottom-5 right-5 z-50 bg-[#203454] text-white px-4 py-3 rounded-xl text-xs font-medium max-w-md shadow-sm"
          >
            {toastMessage}
          </div>
        )}

        {/* Contenu principal exploitant pleinement l'espace horizontal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Navigation inférieure Mobile-First uniquement sur smartphone (< 768px) */}
        <nav
          aria-label="Navigation rapide mobile"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E6ECF5] px-1.5 py-1.5 flex items-center justify-around z-30"
        >
          {mobileBottomItems.map((navItem) => {
            const Icon = navItem.icon;
            const active = isNavItemActive(navItem);
            return (
              <Link
                key={navItem.to}
                to={navItem.to}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                  active
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
      </div>
    </div>
  );
};
