import {
  AcademicLevel,
  CriterionEvaluationItem,
  EligibilityGlobalVerdict,
  EligibilityReport,
  GradingScale,
  LanguageLevel,
  Scholarship,
  StudentProfile,
} from '../../types';

const LANGUAGE_RANK: Record<LanguageLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
  Natif: 7,
};

/**
 * Normalise une moyenne académique sur 20 pour permettre des comparaisons déterministes.
 */
export function normalizeGradeTo20(grade: number | null, scale: GradingScale): number | null {
  if (grade === null || Number.isNaN(grade) || grade < 0) return null;
  if (scale === 'SUR_20') return Math.min(20, Math.round(grade * 100) / 100);
  if (scale === 'GPA_4') return Math.min(20, Math.round((grade / 4) * 20 * 100) / 100);
  if (scale === 'POURCENTAGE_100') return Math.min(20, Math.round((grade / 100) * 20 * 100) / 100);
  return grade;
}

/**
 * Vérifie si un diplôme obtenu nécessite une vérification manuelle d'équivalence
 * par rapport aux diplômes requis (ex: BTS / DUT / HND face à une exigence Licence, ou inversement).
 */
function isAmbiguousAcademicEquivalence(
  studentDiploma: AcademicLevel | '',
  requiredDiplomas: AcademicLevel[]
): boolean {
  if (!studentDiploma) return false;
  if (requiredDiplomas.includes(studentDiploma)) return false;

  const shortCycleDiplomas: AcademicLevel[] = ['BTS', 'DUT', 'HND'];
  const requiresLicenceOrShortCycle =
    requiredDiplomas.includes('Licence') ||
    requiredDiplomas.some((d) => shortCycleDiplomas.includes(d));

  // Un candidat avec BTS/DUT/HND postulant à un programme demandant Licence (ou passerelle)
  // ne doit jamais se voir supposer une équivalence automatique : le statut doit être "À vérifier".
  if (shortCycleDiplomas.includes(studentDiploma) && requiresLicenceOrShortCycle) {
    return true;
  }

  if (studentDiploma === 'Formation professionnelle' && requiredDiplomas.includes('Formation complémentaire')) {
    return true;
  }

  return false;
}

/**
 * Moteur déterministe d'évaluation d'éligibilité SCHOLARFIND.
 * Simule fidèlement la logique métier du futur backend Java Spring Boot.
 *
 * Règles métier strictes :
 * 1. Une information absente ne doit jamais être interprétée comme une condition non satisfaite (-> À compléter).
 * 2. Une équivalence académique incertaine ne doit jamais être supposée automatiquement (-> À vérifier).
 * 3. Une bourse expirée est immédiatement signalée comme Incompatible.
 * 4. Une annonce non vérifiée par un curateur plafonne le résultat positif à "À vérifier".
 * 5. Le résultat positif s'intitule toujours "Potentiellement compatible" (jamais de garantie d'obtention).
 */
export function evaluateScholarshipEligibility(
  student: StudentProfile,
  scholarship: Scholarship,
  referenceDate: string = '2026-11-23'
): EligibilityReport {
  const items: CriterionEvaluationItem[] = [];
  const warnings: string[] = [];

  // 0. Vérification de la date de validité de la bourse
  const isExpired = scholarship.status === 'EXPIRED' || scholarship.deadline < referenceDate;
  items.push({
    id: 'crit-deadline',
    label: 'Validité de la campagne',
    isMandatory: true,
    expectedValue: `Date limite : ${scholarship.deadline}`,
    studentValue: `Date d'évaluation : ${referenceDate}`,
    status: isExpired ? 'NOT_SATISFIED' : 'SATISFIED',
    explanation: isExpired
      ? 'La date limite de soumission de cette bourse est dépassée (campagne clôturée).'
      : 'La campagne de bourse est actuellement ouverte aux candidatures.',
  });

  // 1. Nationalité
  const natAllowed = scholarship.criteria.eligibleNationalities;
  const acceptsAllNat = natAllowed.includes('Toutes') || natAllowed.includes('Tous');
  if (!student.nationality || student.nationality.trim() === '') {
    items.push({
      id: 'crit-nationality',
      label: 'Nationalité éligible',
      isMandatory: true,
      expectedValue: acceptsAllNat ? 'Toutes nationalités éligibles' : natAllowed.join(', '),
      studentValue: 'Information manquante',
      status: 'MISSING_INFO',
      explanation: 'Veuillez renseigner votre nationalité dans votre profil académique.',
      missingFieldKey: 'nationality',
    });
  } else {
    const natMatch = acceptsAllNat || natAllowed.includes(student.nationality);
    items.push({
      id: 'crit-nationality',
      label: 'Nationalité éligible',
      isMandatory: true,
      expectedValue: acceptsAllNat ? 'Toutes nationalités éligibles' : natAllowed.join(', '),
      studentValue: student.nationality,
      status: natMatch ? 'SATISFIED' : 'NOT_SATISFIED',
      explanation: natMatch
        ? `Votre nationalité (${student.nationality}) figure parmi les pays éligibles au programme.`
        : `Ce programme est réservé aux ressortissants de : ${natAllowed.join(', ')}.`,
    });
  }

  // 2. Pays de résidence
  const resAllowed = scholarship.criteria.requiredResidenceCountries;
  const acceptsAllRes = resAllowed.includes('Tous') || resAllowed.includes('Toutes');
  if (!student.residenceCountry || student.residenceCountry.trim() === '') {
    items.push({
      id: 'crit-residence',
      label: 'Pays de résidence',
      isMandatory: true,
      expectedValue: acceptsAllRes ? 'Tout pays de résidence' : resAllowed.join(', '),
      studentValue: 'Information manquante',
      status: 'MISSING_INFO',
      explanation: 'Veuillez indiquer votre pays de résidence actuel.',
      missingFieldKey: 'residenceCountry',
    });
  } else {
    const resMatch = acceptsAllRes || resAllowed.includes(student.residenceCountry);
    items.push({
      id: 'crit-residence',
      label: 'Pays de résidence',
      isMandatory: true,
      expectedValue: acceptsAllRes ? 'Tout pays de résidence' : resAllowed.join(', '),
      studentValue: student.residenceCountry,
      status: resMatch ? 'SATISFIED' : 'NOT_SATISFIED',
      explanation: resMatch
        ? `Condition de résidence satisfaite (${student.residenceCountry}).`
        : `Le programme exige de résider dans l'un des pays suivants : ${resAllowed.join(', ')}.`,
    });
  }

  // 3. Diplôme déjà obtenu (Ne jamais confondre avec niveau actuel ou visé)
  const reqDiplomas = scholarship.criteria.requiredDiplomaObtained;
  if (!student.highestDiplomaObtained) {
    items.push({
      id: 'crit-diploma',
      label: 'Diplôme déjà obtenu exigé',
      isMandatory: true,
      expectedValue: reqDiplomas.join(' ou '),
      studentValue: 'Information manquante',
      status: 'MISSING_INFO',
      explanation: 'Veuillez préciser le dernier diplôme que vous avez déjà obtenu.',
      missingFieldKey: 'highestDiplomaObtained',
    });
  } else if (reqDiplomas.includes(student.highestDiplomaObtained)) {
    items.push({
      id: 'crit-diploma',
      label: 'Diplôme déjà obtenu exigé',
      isMandatory: true,
      expectedValue: reqDiplomas.join(' ou '),
      studentValue: `${student.highestDiplomaObtained}${student.highestDiplomaName ? ` (${student.highestDiplomaName})` : ''}`,
      status: 'SATISFIED',
      explanation: `Votre diplôme obtenu (${student.highestDiplomaObtained}) correspond directement aux prérequis officiels.`,
    });
  } else if (isAmbiguousAcademicEquivalence(student.highestDiplomaObtained, reqDiplomas)) {
    items.push({
      id: 'crit-diploma',
      label: 'Diplôme déjà obtenu exigé',
      isMandatory: true,
      expectedValue: reqDiplomas.join(' ou '),
      studentValue: `${student.highestDiplomaObtained} (Niveau actuel : ${student.currentStudyLevel || 'Non précisé'})`,
      status: 'AMBIGUOUS_TO_VERIFY',
      explanation: `Vous êtes titulaire d'un ${student.highestDiplomaObtained} alors que le programme mentionne ${reqDiplomas.join(' / ')}. Une commission pédagogique devra vérifier l'équivalence des crédits (ECTS/CAMES).`,
    });
  } else {
    items.push({
      id: 'crit-diploma',
      label: 'Diplôme déjà obtenu exigé',
      isMandatory: true,
      expectedValue: reqDiplomas.join(' ou '),
      studentValue: student.highestDiplomaObtained,
      status: 'NOT_SATISFIED',
      explanation: `Votre diplôme obtenu (${student.highestDiplomaObtained}) ne correspond pas aux diplômes exigés (${reqDiplomas.join(', ')}).`,
    });
  }

  // 4. Niveau ou formation recherchée
  const targetLevels = scholarship.criteria.targetStudyLevels;
  if (!student.targetStudyLevel) {
    items.push({
      id: 'crit-target-level',
      label: 'Niveau de formation visé',
      isMandatory: true,
      expectedValue: targetLevels.join(', '),
      studentValue: 'Information manquante',
      status: 'MISSING_INFO',
      explanation: 'Veuillez indiquer le niveau d’études ou la formation que vous souhaitez financer.',
      missingFieldKey: 'targetStudyLevel',
    });
  } else {
    const targetMatch = targetLevels.includes(student.targetStudyLevel);
    items.push({
      id: 'crit-target-level',
      label: 'Niveau de formation visé',
      isMandatory: true,
      expectedValue: targetLevels.join(', '),
      studentValue: student.targetStudyLevel,
      status: targetMatch ? 'SATISFIED' : 'NOT_SATISFIED',
      explanation: targetMatch
        ? `La formation recherchée (${student.targetStudyLevel}) est couverte par ce programme.`
        : `Cette bourse finance uniquement les niveaux : ${targetLevels.join(', ')} (vous recherchez : ${student.targetStudyLevel}).`,
    });
  }

  // 5. Domaine d'études / Filière
  const domains = scholarship.criteria.eligibleDomains;
  const acceptsAllDomains = domains.includes('Tous domaines');
  if (!student.studyDomain) {
    items.push({
      id: 'crit-domain',
      label: 'Filière / Domaine académique',
      isMandatory: true,
      expectedValue: acceptsAllDomains ? 'Tous domaines éligibles' : domains.join(', '),
      studentValue: 'Information manquante',
      status: 'MISSING_INFO',
      explanation: 'Veuillez sélectionner votre domaine d’études principal.',
      missingFieldKey: 'studyDomain',
    });
  } else {
    const domainMatch = acceptsAllDomains || domains.includes(student.studyDomain);
    items.push({
      id: 'crit-domain',
      label: 'Filière / Domaine académique',
      isMandatory: true,
      expectedValue: acceptsAllDomains ? 'Tous domaines éligibles' : domains.join(', '),
      studentValue: student.studyDomain,
      status: domainMatch ? 'SATISFIED' : 'NOT_SATISFIED',
      explanation: domainMatch
        ? `Votre domaine (${student.studyDomain}) est éligible.`
        : `Ce programme finance exclusivement : ${domains.join(', ')}.`,
    });
  }

  // 6. Moyenne académique minimale
  if (scholarship.criteria.minGradeOut20 !== null) {
    const minGrade = scholarship.criteria.minGradeOut20;
    const studentGrade20 = normalizeGradeTo20(student.averageGrade, student.gradingScale);
    if (studentGrade20 === null) {
      items.push({
        id: 'crit-grade',
        label: 'Moyenne académique minimale',
        isMandatory: true,
        expectedValue: `>= ${minGrade.toFixed(1)} / 20`,
        studentValue: 'Information manquante',
        status: 'MISSING_INFO',
        explanation: 'Veuillez renseigner votre moyenne académique pour vérifier ce seuil.',
        missingFieldKey: 'averageGrade',
      });
    } else {
      const gradeMatch = studentGrade20 >= minGrade;
      items.push({
        id: 'crit-grade',
        label: 'Moyenne académique minimale',
        isMandatory: true,
        expectedValue: `>= ${minGrade.toFixed(1)} / 20`,
        studentValue: `${studentGrade20.toFixed(2)} / 20`,
        status: gradeMatch ? 'SATISFIED' : 'NOT_SATISFIED',
        explanation: gradeMatch
          ? `Votre moyenne normalisée (${studentGrade20.toFixed(2)}/20) est supérieure ou égale au seuil exigé (${minGrade.toFixed(1)}/20).`
          : `Votre moyenne (${studentGrade20.toFixed(2)}/20) est inférieure au seuil obligatoire de ${minGrade.toFixed(1)}/20.`,
      });
    }
  }

  // 7. Compétences et certifications linguistiques
  if (scholarship.criteria.requiredLanguage) {
    const reqLang = scholarship.criteria.requiredLanguage;
    const minLevel = scholarship.criteria.minLanguageLevel || 'B2';
    const requiresCert = scholarship.criteria.requiresLanguageCertification;

    const studentLangSkill = student.languages.find((l) => l.language === reqLang);
    if (!studentLangSkill) {
      items.push({
        id: 'crit-language',
        label: `Compétence linguistique (${reqLang})`,
        isMandatory: true,
        expectedValue: `${reqLang} niveau ${minLevel}${requiresCert ? ' (Certification requise)' : ''}`,
        studentValue: 'Information manquante',
        status: 'MISSING_INFO',
        explanation: `Aucune compétence en ${reqLang} n'est déclarée dans votre profil.`,
        missingFieldKey: 'languages',
      });
    } else {
      const hasEnoughLevel = LANGUAGE_RANK[studentLangSkill.level] >= LANGUAGE_RANK[minLevel];
      if (!hasEnoughLevel) {
        items.push({
          id: 'crit-language',
          label: `Compétence linguistique (${reqLang})`,
          isMandatory: true,
          expectedValue: `${reqLang} niveau minimum ${minLevel}`,
          studentValue: `${reqLang} niveau ${studentLangSkill.level}`,
          status: 'NOT_SATISFIED',
          explanation: `Votre niveau déclaré en ${reqLang} (${studentLangSkill.level}) est inférieur au niveau ${minLevel} exigé.`,
        });
      } else if (requiresCert && (!studentLangSkill.certification || studentLangSkill.certification.trim() === '')) {
        items.push({
          id: 'crit-language',
          label: `Certification linguistique (${reqLang})`,
          isMandatory: true,
          expectedValue: `Niveau ${minLevel} avec justificatif officiel (IELTS, TOEFL, TCF, Goethe...)`,
          studentValue: `Niveau ${studentLangSkill.level} déclaré · Sans certification renseignée`,
          status: 'MISSING_INFO',
          explanation: `Votre niveau ${studentLangSkill.level} est suffisant, mais l'attestation officielle de langue est manquante dans votre profil.`,
          missingFieldKey: 'languages',
        });
      } else {
        items.push({
          id: 'crit-language',
          label: `Compétence linguistique (${reqLang})`,
          isMandatory: true,
          expectedValue: `${reqLang} niveau ${minLevel}${requiresCert ? ' certifié' : ''}`,
          studentValue: `${reqLang} (${studentLangSkill.level})${studentLangSkill.certification ? ` · ${studentLangSkill.certification}` : ''}`,
          status: 'SATISFIED',
          explanation: `Exigence linguistique en ${reqLang} satisfaite.`,
        });
      }
    }
  }

  // 8. Condition d'âge (lorsqu'une condition officielle le prévoit)
  if (scholarship.criteria.maxAge !== null) {
    const currentYear = parseInt(referenceDate.slice(0, 4), 10) || 2026;
    if (!student.birthYear) {
      items.push({
        id: 'crit-age',
        label: 'Limite d’âge réglementaire',
        isMandatory: true,
        expectedValue: `<= ${scholarship.criteria.maxAge} ans`,
        studentValue: 'Année de naissance non renseignée',
        status: 'MISSING_INFO',
        explanation: 'Veuillez renseigner votre année de naissance pour vérifier la condition d’âge.',
        missingFieldKey: 'birthYear',
      });
    } else {
      const age = currentYear - student.birthYear;
      const ageOk = age <= scholarship.criteria.maxAge;
      items.push({
        id: 'crit-age',
        label: 'Limite d’âge réglementaire',
        isMandatory: true,
        expectedValue: `<= ${scholarship.criteria.maxAge} ans`,
        studentValue: `${age} ans (né en ${student.birthYear})`,
        status: ageOk ? 'SATISFIED' : 'NOT_SATISFIED',
        explanation: ageOk
          ? `Votre âge (${age} ans) respecte le plafond réglementaire de ${scholarship.criteria.maxAge} ans.`
          : `Votre âge (${age} ans) dépasse la limite officielle de ${scholarship.criteria.maxAge} ans fixée par l'organisme.`,
      });
    }
  }

  // 9. Vérification du statut de curation de l'annonce
  if (scholarship.curationStatus !== 'VERIFIED') {
    warnings.push(
      "Cette annonce est actuellement en attente de validation définitive par un curateur SCHOLARFIND. Ses critères peuvent évoluer après contrôle de la source officielle."
    );
    items.push({
      id: 'crit-curation',
      label: 'Statut de vérification de la source',
      isMandatory: false,
      expectedValue: 'Annonce vérifiée par un curateur',
      studentValue: scholarship.curationStatus === 'PENDING_REVIEW' ? 'En attente de contrôle' : 'Annonce non vérifiée',
      status: 'AMBIGUOUS_TO_VERIFY',
      explanation: 'L’annonce n’ayant pas encore été certifiée par l’équipe de curation, une vérification directe sur le site officiel de l’organisme est indispensable.',
    });
  }

  // Calcul du verdict global déterministe
  const mandatoryItems = items.filter((i) => i.isMandatory);
  const satisfiedCount = mandatoryItems.filter((i) => i.status === 'SATISFIED').length;
  const hasNotSatisfied = mandatoryItems.some((i) => i.status === 'NOT_SATISFIED');
  const hasMissingInfo = mandatoryItems.some((i) => i.status === 'MISSING_INFO');
  const hasAmbiguous = items.some((i) => i.status === 'AMBIGUOUS_TO_VERIFY');

  let verdict: EligibilityGlobalVerdict;
  let verdictLabel: EligibilityReport['verdictLabel'];
  let summaryExplanation: string;

  if (hasNotSatisfied) {
    verdict = 'INCOMPATIBLE';
    verdictLabel = 'Incompatible';
    const blockingLabels = mandatoryItems
      .filter((i) => i.status === 'NOT_SATISFIED')
      .map((i) => i.label)
      .join(', ');
    summaryExplanation = `Votre profil ne remplit pas au moins une condition obligatoire rédhibitoire (${blockingLabels}).`;
  } else if (hasMissingInfo) {
    verdict = 'TO_COMPLETE';
    verdictLabel = 'À compléter';
    const missingLabels = mandatoryItems
      .filter((i) => i.status === 'MISSING_INFO')
      .map((i) => i.label)
      .join(', ');
    summaryExplanation = `Aucun critère bloquant n'a été détecté, mais certaines informations sont absentes de votre profil (${missingLabels}) et empêchent de conclure.`;
  } else if (hasAmbiguous || scholarship.curationStatus !== 'VERIFIED') {
    verdict = 'TO_VERIFY';
    verdictLabel = 'À vérifier';
    summaryExplanation =
      "Vos critères principaux sont encourageants, mais une équivalence académique ou le statut de vérification de l'annonce nécessite une vérification humaine complémentaire.";
  } else {
    verdict = 'POTENTIALLY_COMPATIBLE';
    verdictLabel = 'Potentiellement compatible';
    summaryExplanation = `Votre profil académique satisfait les ${satisfiedCount} critères obligatoires vérifiés automatiquement pour ce programme.`;
  }

  return {
    scholarshipId: scholarship.id,
    studentId: student.id,
    evaluatedAt: referenceDate,
    verdict,
    verdictLabel,
    summaryExplanation,
    legalDisclaimer:
      "Ce résultat repose sur une comparaison automatisée des critères déclarés. Un statut « Potentiellement compatible » ne constitue en aucun cas une garantie d'admission ou d'attribution de bourse : la décision souveraine appartient exclusivement au jury de l'organisme financeur.",
    satisfiedCount,
    totalMandatoryCount: mandatoryItems.length,
    items,
    warnings,
  };
}
