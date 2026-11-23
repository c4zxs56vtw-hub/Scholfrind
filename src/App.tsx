/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import {
  AuthPage,
  HomePage,
  HowItWorksPage,
  OrganizationsDirectoryPage,
  PricingPage,
  PublicCatalogPage,
  ScholarshipDetailPage,
} from './features/public/PublicPages';
import {
  StudentDashboardPage,
  StudentEligibilityPage,
  StudentFavoritesPage,
  StudentInvitationsPage,
  StudentNotificationsPage,
  StudentPrivacyPage,
  StudentProfilePage,
  StudentRecommendationsPage,
} from './features/students/StudentPages';
import {
  CreateCampaignPage,
  OrganizationApplicationsPage,
  OrganizationBillingPage,
  OrganizationCandidateSearchPage,
  OrganizationDashboardPage,
  OrganizationDecisionsPage,
  OrganizationEvaluationsPage,
  OrganizationInvitationsSentPage,
  OrganizationProfilePage,
  OrganizationProgramsPage,
  OrganizationStatisticsPage,
} from './features/organizations/OrganizationPages';
import {
  CuratorAnnouncementsPage,
  CuratorDashboardPage,
  CuratorDuplicatesPage,
  CuratorHistoryPage,
  CuratorSourcesPage,
} from './features/curation/CuratorPages';
import {
  AdminAuditLogsPage,
  AdminDashboardPage,
  AdminOrganizationsPage,
  AdminProgramsPage,
  AdminSettingsPage,
  AdminSubscriptionsPage,
  AdminUsersPage,
} from './features/administration/AdminPages';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. PAGES PUBLIQUES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/bourses" element={<PublicCatalogPage />} />
            <Route path="/bourses/:id" element={<ScholarshipDetailPage />} />
            <Route path="/fonctionnement" element={<HowItWorksPage />} />
            <Route
              path="/organismes"
              element={<OrganizationsDirectoryPage />}
            />
            <Route path="/tarification" element={<PricingPage />} />
            <Route
              path="/connexion"
              element={<AuthPage mode="LOGIN" />}
            />
            <Route
              path="/inscription"
              element={<AuthPage mode="REGISTER" />}
            />
          </Route>

          {/* 2. ESPACE ÉTUDIANT */}
          <Route element={<WorkspaceLayout workspaceRole="STUDENT" />}>
            <Route
              path="/etudiant"
              element={<Navigate to="/etudiant/tableau-de-bord" replace />}
            />
            <Route
              path="/etudiant/tableau-de-bord"
              element={<StudentDashboardPage />}
            />
            <Route path="/etudiant/profil" element={<StudentProfilePage />} />
            <Route
              path="/etudiant/recherche"
              element={<PublicCatalogPage />}
            />
            <Route
              path="/etudiant/bourses/:id"
              element={<ScholarshipDetailPage />}
            />
            <Route
              path="/etudiant/eligibilite"
              element={<StudentEligibilityPage />}
            />
            <Route
              path="/etudiant/recommandations"
              element={<StudentRecommendationsPage />}
            />
            <Route
              path="/etudiant/favoris"
              element={<StudentFavoritesPage />}
            />
            <Route
              path="/etudiant/invitations"
              element={<StudentInvitationsPage />}
            />
            <Route
              path="/etudiant/notifications"
              element={<StudentNotificationsPage />}
            />
            <Route
              path="/etudiant/confidentialite"
              element={<StudentPrivacyPage />}
            />
          </Route>

          {/* 3. ESPACE ORGANISME FINANCEUR */}
          <Route element={<WorkspaceLayout workspaceRole="ORGANIZATION" />}>
            <Route
              path="/organisme"
              element={<Navigate to="/organisme/tableau-de-bord" replace />}
            />
            <Route
              path="/organisme/tableau-de-bord"
              element={<OrganizationDashboardPage />}
            />
            <Route
              path="/organisme/profil"
              element={<OrganizationProfilePage />}
            />
            <Route
              path="/organisme/programmes"
              element={<OrganizationProgramsPage />}
            />
            <Route
              path="/organisme/creer-campagne"
              element={<CreateCampaignPage />}
            />
            <Route
              path="/organisme/recherche-candidats"
              element={<OrganizationCandidateSearchPage />}
            />
            <Route
              path="/organisme/invitations"
              element={<OrganizationInvitationsSentPage />}
            />
            <Route
              path="/organisme/candidatures"
              element={<OrganizationApplicationsPage />}
            />
            <Route
              path="/organisme/evaluations"
              element={<OrganizationEvaluationsPage />}
            />
            <Route
              path="/organisme/decisions"
              element={<OrganizationDecisionsPage />}
            />
            <Route
              path="/organisme/statistiques"
              element={<OrganizationStatisticsPage />}
            />
            <Route
              path="/organisme/abonnement"
              element={<OrganizationBillingPage />}
            />
          </Route>

          {/* 4. ESPACE CURATEUR ACADÉMIQUE */}
          <Route element={<WorkspaceLayout workspaceRole="CURATOR" />}>
            <Route
              path="/curateur"
              element={<Navigate to="/curateur/tableau-de-bord" replace />}
            />
            <Route
              path="/curateur/tableau-de-bord"
              element={<CuratorDashboardPage />}
            />
            <Route
              path="/curateur/annonces"
              element={<CuratorAnnouncementsPage />}
            />
            <Route
              path="/curateur/sources"
              element={<CuratorSourcesPage />}
            />
            <Route
              path="/curateur/doublons"
              element={<CuratorDuplicatesPage />}
            />
            <Route
              path="/curateur/historique"
              element={<CuratorHistoryPage />}
            />
          </Route>

          {/* 5. ESPACE ADMINISTRATEUR */}
          <Route element={<WorkspaceLayout workspaceRole="ADMIN" />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/tableau-de-bord" replace />}
            />
            <Route
              path="/admin/tableau-de-bord"
              element={<AdminDashboardPage />}
            />
            <Route
              path="/admin/utilisateurs"
              element={<AdminUsersPage />}
            />
            <Route
              path="/admin/organismes"
              element={<AdminOrganizationsPage />}
            />
            <Route
              path="/admin/programmes"
              element={<AdminProgramsPage />}
            />
            <Route
              path="/admin/sources"
              element={<CuratorSourcesPage />}
            />
            <Route
              path="/admin/abonnements"
              element={<AdminSubscriptionsPage />}
            />
            <Route
              path="/admin/audit"
              element={<AdminAuditLogsPage />}
            />
            <Route
              path="/admin/parametres"
              element={<AdminSettingsPage />}
            />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
