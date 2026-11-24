import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adaptApiApplicationRecordToUi,
  adaptApiDuplicateToUi,
  adaptApiNotificationToUi,
  adaptApiOfficialSourceToUi,
  adaptApiScholarshipToUi,
  adaptApiStudentProfileToUi,
  adaptApiSubscriptionToUi,
  adaptStudentToAnonymizedCandidateDto,
  adaptUiApplicationStatusToApi,
  computeMissingPublicationFields,
  computeStudentProfileCompletion,
  isScholarshipPubliclyVisible,
  mapApiSourceReliabilityToUi,
  mapUiSourceReliabilityToApi,
} from './openapiAdapters';
import { INITIAL_SCHOLARSHIPS, INITIAL_STUDENT_PROFILES } from '../../data/mockData';

test('1. Source reliability adapter maps bidirectionally between OpenAPI 1.1 and UI enums', () => {
  assert.equal(mapApiSourceReliabilityToUi('FIABLE'), 'FIABLE_VERIFIEE');
  assert.equal(mapApiSourceReliabilityToUi('A_SURVEILLER'), 'A_CONTROLER');
  assert.equal(mapApiSourceReliabilityToUi('SUSPECTE'), 'SUSPENDUE');

  assert.equal(mapUiSourceReliabilityToApi('FIABLE_VERIFIEE'), 'FIABLE');
  assert.equal(mapUiSourceReliabilityToApi('A_CONTROLER'), 'A_SURVEILLER');
  assert.equal(mapUiSourceReliabilityToApi('SUSPENDUE'), 'SUSPECTE');

  const adapted = adaptApiOfficialSourceToUi({
    id: 'src-1',
    name: 'Campus France Cameroun',
    institutionType: 'Ambassade',
    country: 'France',
    officialUrl: 'https://www.cameroun.campusfrance.org',
    reliabilityStatus: 'FIABLE',
    lastCheckedAt: '2026-11-23',
    activeAnnouncementsCount: 4,
    notes: 'Portail officiel vérifié',
  });
  assert.equal(adapted.reliabilityStatus, 'FIABLE_VERIFIEE');
});

test('2. DuplicateCandidate adapter converts detectedReasons[] to UI reason string', () => {
  const uiDup = adaptApiDuplicateToUi({
    id: 'dup-1',
    primaryScholarshipId: 'sch-1',
    duplicateScholarshipId: 'sch-2',
    similarityScore: 88,
    detectedReasons: ['Même organisme émetteur', 'Date limite identique'],
    status: 'PENDING',
  });
  assert.equal(uiDup.reason, 'Même organisme émetteur · Date limite identique');
  assert.equal(uiDup.similarityScore, 88);
});

test('3. Subscription & Notification adapters preserve UI contracts', () => {
  const uiSub = adaptApiSubscriptionToUi({
    id: 'sub-1',
    organizationId: 'org-1',
    organizationName: 'Fondation Horizon',
    planId: 'ORG_PRO',
    planName: 'Organisme Pro',
    amountFcfa: 50000,
    billingCycle: 'Mensuel',
    status: 'EXPIRE',
    startedAt: '2026-01-01',
    nextRenewalAt: null,
  });
  assert.equal(uiSub.status, 'CLOTURE');
  assert.equal(uiSub.nextRenewalAt, undefined);

  const uiNotif = adaptApiNotificationToUi({
    id: 'n-1',
    userId: 'usr-stu-1',
    role: 'STUDENT',
    category: 'NEW_SCHOLARSHIP',
    title: 'Nouvelle bourse Master',
    message: 'Découvrez cette opportunité',
    createdAt: '2026-11-23',
    read: false,
    linkTo: '/bourses',
  });
  assert.equal(uiNotif.category, 'OPPORTUNITY');
});

test('4. ApplicationStatus adapter preserves "Informations complémentaires demandées" round-trip', () => {
  const wire = adaptUiApplicationStatusToApi(
    'Informations complémentaires demandées',
    'Veuillez fournir le relevé L3.'
  );
  assert.equal(wire.status, 'En cours d’examen');
  assert.ok(wire.evaluatorNotes?.startsWith('[Complément demandé] '));

  const roundTripUi = adaptApiApplicationRecordToUi({
    id: 'app-1',
    referenceCode: 'DOS-2027-1001',
    scholarshipId: 'sch-1',
    scholarshipTitle: 'Bourse Master IA',
    organizationId: 'org-1',
    organizationName: 'Fondation',
    studentId: 'stu-1',
    studentName: 'Amina Ndongo',
    studentHighestDiploma: 'Licence',
    studentCurrentLevel: 'Licence',
    studentTargetLevel: 'Master',
    studentDomain: 'Informatique & Systèmes',
    studentGradeOut20: 15.6,
    studentNationality: 'Cameroun',
    submittedAt: '2026-11-20',
    updatedAt: '2026-11-23',
    status: wire.status,
    evaluatorNotes: wire.evaluatorNotes || '',
  });
  assert.equal(roundTripUi.status, 'Informations complémentaires demandées');
});

test('5. StudentProfile adapter never invents fake academic levels when fields are missing', () => {
  const incompleteProfile = adaptApiStudentProfileToUi({
    id: 'stu-new',
    userId: 'usr-new',
    firstName: 'Cédric',
    lastName: 'Mbarga',
    email: 'cedric@demo.cm',
    isMinor: false,
    nationality: 'Cameroun',
    residenceCountry: 'Cameroun',
    highestDiplomaObtained: null,
    currentStudyLevel: '',
    targetStudyLevel: null,
    studyDomain: null,
    averageGrade: null,
    gradingScale: 'SUR_20',
    languages: [],
    preferredDestinationCountries: [],
    preferredFundingTypes: [],
    institutionalVisibilityEnabled: false,
    allowAcademicScoreSharing: false,
    savedScholarshipIds: [],
    updatedAt: '2026-11-24',
  });

  assert.equal(incompleteProfile.highestDiplomaObtained, '');
  assert.equal(incompleteProfile.currentStudyLevel, '');
  assert.equal(incompleteProfile.targetStudyLevel, '');
  assert.equal(incompleteProfile.studyDomain, '');
  assert.equal(incompleteProfile.profileCompletion?.readyForEligibility, false);
  assert.ok((incompleteProfile.profileCompletion?.missingFields.length || 0) >= 4);
});

test('6. Publication status vs Curation status vs Availability distinction', () => {
  const sample = INITIAL_SCHOLARSHIPS[0];
  const draftScholarship = adaptApiScholarshipToUi({
    ...sample,
    publicationStatus: 'DRAFT',
    curationStatus: 'PENDING_REVIEW',
    status: 'DRAFT',
  });
  assert.equal(isScholarshipPubliclyVisible(draftScholarship), false);

  const publishedScholarship = adaptApiScholarshipToUi({
    ...sample,
    publicationStatus: 'PUBLISHED',
    curationStatus: 'VERIFIED',
    status: 'OPEN',
  });
  assert.equal(isScholarshipPubliclyVisible(publishedScholarship), true);

  const missing = computeMissingPublicationFields({
    title: 'Bourse Test',
    issuerOrganizationName: '',
  });
  assert.ok(missing.includes('Organisme émetteur'));
  assert.ok(missing.includes('URL de la source officielle'));
});

test('7. Anonymized talent pool adapter enforces opt-in consent and opaque candidatePublicId', () => {
  const privateStudent = {
    ...INITIAL_STUDENT_PROFILES[0],
    institutionalVisibilityEnabled: false,
  };
  assert.equal(adaptStudentToAnonymizedCandidateDto(privateStudent), null);

  const consentingStudent = {
    ...INITIAL_STUDENT_PROFILES[0],
    institutionalVisibilityEnabled: true,
    allowAcademicScoreSharing: false,
  };
  const dto = adaptStudentToAnonymizedCandidateDto(consentingStudent);
  assert.ok(dto !== null);
  assert.notEqual(dto.studentId, consentingStudent.id);
  assert.equal(dto.studentId, dto.candidatePublicId);
  assert.equal(dto.normalizedGradeOut20, null);

  const completion = computeStudentProfileCompletion(consentingStudent);
  assert.equal(completion.readyForEligibility, true);
});
