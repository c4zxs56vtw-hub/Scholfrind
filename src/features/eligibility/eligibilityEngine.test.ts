import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateScholarshipEligibility, normalizeGradeTo20 } from './eligibilityEngine';
import { Scholarship, StudentProfile } from '../../types';

const baseStudent: StudentProfile = {
  id: 'stu-test-1',
  userId: 'usr-test-1',
  firstName: 'Amina',
  lastName: 'Ndongo',
  email: 'amina.ndongo@etudiant-demo.cm',
  birthYear: 2003,
  isMinor: false,
  nationality: 'Cameroun',
  residenceCountry: 'Cameroun',
  city: 'Yaoundé',
  highestDiplomaObtained: 'Licence',
  highestDiplomaName: 'Licence en Génie Informatique',
  currentStudyLevel: 'Master',
  targetStudyLevel: 'Master',
  studyDomain: 'Informatique & Systèmes',
  currentInstitution: 'Université de Yaoundé I',
  academicYear: '2026-2027',
  averageGrade: 15.2,
  gradingScale: 'SUR_20',
  normalizedGradeOut20: 15.2,
  languages: [
    { language: 'Français', level: 'C2', certification: 'Langue officielle' },
    { language: 'Anglais', level: 'B2', certification: 'IELTS 6.5' },
  ],
  preferredDestinationCountries: ['France', 'Allemagne', 'Canada'],
  preferredFundingTypes: ['Bourse complète (Frais + Vie + Transport)'],
  institutionalVisibilityEnabled: false,
  allowAcademicScoreSharing: true,
  savedScholarshipIds: [],
  updatedAt: '2026-11-20',
};

const baseScholarship: Scholarship = {
  id: 'sch-test-1',
  code: 'DEMO-FR-2027-01',
  title: 'Bourse Excellence Numérique Cameroun-Europe (Démonstration)',
  organizationId: 'org-1',
  organizationName: 'Fondation Coopération Scientifique (Démo)',
  organizationType: 'Fondation',
  hostCountry: 'France',
  fundingType: 'Bourse complète (Frais + Vie + Transport)',
  financialSummary: '1 150 € / mois + billet A/R + couverture sociale',
  deadline: '2027-03-15',
  startDate: '2027-09-01',
  durationMonths: 24,
  slotsAvailable: 15,
  description: 'Programme fictif de démonstration.',
  benefits: ['Allocation mensuelle'],
  requiredDocuments: ['Relevés de notes'],
  criteria: {
    eligibleNationalities: ['Cameroun', 'Sénégal', 'Côte d’Ivoire'],
    requiredResidenceCountries: ['Cameroun', 'Sénégal', 'Côte d’Ivoire'],
    requiredDiplomaObtained: ['Licence'],
    targetStudyLevels: ['Master'],
    eligibleDomains: ['Informatique & Systèmes', 'Énergies Renouvelables & Mines'],
    minGradeOut20: 14.0,
    maxAge: 28,
    requiredLanguage: 'Anglais',
    minLanguageLevel: 'B2',
    requiresLanguageCertification: true,
    specificConditions: [],
    preferentialCriteria: [],
  },
  isDemoData: true,
  sourceName: 'Portail Officiel Fondation (Simulation)',
  sourceUrl: 'https://exemple-fondation-demo.org/bourses',
  retrievedAt: '2026-11-01',
  lastVerifiedAt: '2026-11-18',
  verifiedByCurator: 'Jean-Paul Mbarga',
  curationStatus: 'VERIFIED',
  status: 'OPEN',
  modificationHistory: [],
};

test('1. Profil entièrement compatible retourne POTENTIALLY_COMPATIBLE (« Potentiellement compatible »)', () => {
  const report = evaluateScholarshipEligibility(baseStudent, baseScholarship, '2026-11-23');
  assert.equal(report.verdict, 'POTENTIALLY_COMPATIBLE');
  assert.equal(report.verdictLabel, 'Potentiellement compatible');
  assert.equal(report.satisfiedCount, report.totalMandatoryCount);
});

test('2. Critère obligatoire non satisfait (moyenne insuffisante) retourne INCOMPATIBLE', () => {
  const lowGradeStudent: StudentProfile = {
    ...baseStudent,
    averageGrade: 11.5,
  };
  const report = evaluateScholarshipEligibility(lowGradeStudent, baseScholarship, '2026-11-23');
  assert.equal(report.verdict, 'INCOMPATIBLE');
  assert.equal(report.verdictLabel, 'Incompatible');
  const gradeItem = report.items.find((i) => i.id === 'crit-grade');
  assert.equal(gradeItem?.status, 'NOT_SATISFIED');
});

test('3. Information manquante (certification linguistique non renseignée) retourne TO_COMPLETE (« À compléter »)', () => {
  const missingCertStudent: StudentProfile = {
    ...baseStudent,
    languages: [
      { language: 'Français', level: 'C2' },
      { language: 'Anglais', level: 'B2', certification: '' }, // Certification absente
    ],
  };
  const report = evaluateScholarshipEligibility(missingCertStudent, baseScholarship, '2026-11-23');
  assert.equal(report.verdict, 'TO_COMPLETE');
  assert.equal(report.verdictLabel, 'À compléter');
  const langItem = report.items.find((i) => i.id === 'crit-language');
  assert.equal(langItem?.status, 'MISSING_INFO');
});

test('4. Condition académique ambiguë (BTS/HND face à une exigence Licence) retourne TO_VERIFY (« À vérifier »)', () => {
  const hndStudent: StudentProfile = {
    ...baseStudent,
    highestDiplomaObtained: 'HND',
    highestDiplomaName: 'Higher National Diploma in Software Engineering',
    currentStudyLevel: 'Licence',
  };
  const report = evaluateScholarshipEligibility(hndStudent, baseScholarship, '2026-11-23');
  assert.equal(report.verdict, 'TO_VERIFY');
  assert.equal(report.verdictLabel, 'À vérifier');
  const diplomaItem = report.items.find((i) => i.id === 'crit-diploma');
  assert.equal(diplomaItem?.status, 'AMBIGUOUS_TO_VERIFY');
});

test('5. Bourse expirée retourne toujours INCOMPATIBLE', () => {
  const expiredScholarship: Scholarship = {
    ...baseScholarship,
    deadline: '2026-05-01',
    status: 'EXPIRED',
  };
  const report = evaluateScholarshipEligibility(baseStudent, expiredScholarship, '2026-11-23');
  assert.equal(report.verdict, 'INCOMPATIBLE');
  const deadlineItem = report.items.find((i) => i.id === 'crit-deadline');
  assert.equal(deadlineItem?.status, 'NOT_SATISFIED');
});

test('6. Annonce non vérifiée par un curateur plafonne un profil compatible à TO_VERIFY (« À vérifier »)', () => {
  const unverifiedScholarship: Scholarship = {
    ...baseScholarship,
    curationStatus: 'PENDING_REVIEW',
  };
  const report = evaluateScholarshipEligibility(baseStudent, unverifiedScholarship, '2026-11-23');
  assert.equal(report.verdict, 'TO_VERIFY');
  assert.equal(report.verdictLabel, 'À vérifier');
  assert.equal(report.warnings.length > 0, true);
});

test('7. Normalisation des échelles de notation (GPA 4.0 et Pourcentage sur 100 vers /20)', () => {
  assert.equal(normalizeGradeTo20(3.5, 'GPA_4'), 17.5);
  assert.equal(normalizeGradeTo20(75, 'POURCENTAGE_100'), 15);
  assert.equal(normalizeGradeTo20(14.8, 'SUR_20'), 14.8);
});
