import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptPartnerStatusToOpenApiVerification,
  adaptPartnerUiTypeToOpenApi,
  enforcePublicRegistrationRole,
  evaluatePasswordStrength,
  getPartnerRequestStatusLabel,
  isPartnerSubmissionLocked,
  resolveDefaultWorkspacePathForRole,
} from './authAndPartnerLogic';

test('1. evaluatePasswordStrength evaluates weak, fair, good, and strong passwords accurately', () => {
  const empty = evaluatePasswordStrength('');
  assert.equal(empty.level, 'EMPTY');
  assert.equal(empty.isAcceptable, false);

  const shortWeak = evaluatePasswordStrength('abc123');
  assert.equal(shortWeak.level, 'WEAK');
  assert.equal(shortWeak.isAcceptable, false);

  const fair = evaluatePasswordStrength('scholarfind2026');
  assert.equal(fair.level, 'FAIR');
  assert.equal(fair.isAcceptable, true);

  const strong = evaluatePasswordStrength('ScholarFind#2026');
  assert.equal(strong.level, 'STRONG');
  assert.equal(strong.score, 4);
  assert.equal(strong.isAcceptable, true);
});

test('2. enforcePublicRegistrationRole strictly returns STUDENT and never privileges roles', () => {
  assert.equal(enforcePublicRegistrationRole(), 'STUDENT');
  assert.equal(resolveDefaultWorkspacePathForRole('STUDENT'), '/etudiant/tableau-de-bord');
  assert.equal(resolveDefaultWorkspacePathForRole('ORGANIZATION'), '/organisme/tableau-de-bord');
  assert.equal(resolveDefaultWorkspacePathForRole('CURATOR'), '/curateur/tableau-de-bord');
  assert.equal(resolveDefaultWorkspacePathForRole('ADMIN'), '/admin/tableau-de-bord');
});

test('3. isPartnerSubmissionLocked prevents multiple submissions while SUBMITTED, UNDER_REVIEW, or APPROVED', () => {
  assert.equal(isPartnerSubmissionLocked(undefined), false);
  assert.equal(isPartnerSubmissionLocked('DRAFT'), false);
  assert.equal(isPartnerSubmissionLocked('MORE_INFO_REQUIRED'), false);
  assert.equal(isPartnerSubmissionLocked('REJECTED'), false);

  assert.equal(isPartnerSubmissionLocked('SUBMITTED'), true);
  assert.equal(isPartnerSubmissionLocked('UNDER_REVIEW'), true);
  assert.equal(isPartnerSubmissionLocked('APPROVED'), true);
});

test('4. Partner organization adapters map UI types and statuses to OpenAPI 1.1 enums', () => {
  assert.equal(adaptPartnerUiTypeToOpenApi('Institution publique'), 'Ministère');
  assert.equal(adaptPartnerUiTypeToOpenApi('Autre'), 'Coopération internationale');
  assert.equal(adaptPartnerUiTypeToOpenApi('Université'), 'Université');

  assert.equal(adaptPartnerStatusToOpenApiVerification('SUBMITTED'), 'PENDING');
  assert.equal(adaptPartnerStatusToOpenApiVerification('UNDER_REVIEW'), 'PENDING');
  assert.equal(adaptPartnerStatusToOpenApiVerification('MORE_INFO_REQUIRED'), 'PENDING');
  assert.equal(adaptPartnerStatusToOpenApiVerification('APPROVED'), 'VERIFIED');
  assert.equal(adaptPartnerStatusToOpenApiVerification('REJECTED'), 'REJECTED');

  assert.equal(getPartnerRequestStatusLabel('MORE_INFO_REQUIRED'), 'Informations complémentaires requises');
});
