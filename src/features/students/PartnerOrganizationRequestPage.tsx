import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Info,
  Lock,
  Mail,
  Megaphone,
  Phone,
  Plus,
  Repeat,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PartnerOrganizationRequest,
  PartnerOrganizationUiType,
  PartnerRequestStatus,
  PartnerSupportingDocument,
} from '../../types';
import {
  getPartnerRequestStatusLabel,
  isPartnerSubmissionLocked,
} from '../auth/authAndPartnerLogic';
import { ProfilSubNav } from './StudentPages';
import { Modal } from '../../components/ui/DesignSystem';

const PARTNER_ORG_TYPES: PartnerOrganizationUiType[] = [
  'Entreprise',
  'Université',
  'Fondation',
  'ONG',
  'Institution publique',
  'Autre',
];

const PARTNER_BENEFITS = [
  {
    icon: Megaphone,
    title: 'Publier des offres de bourses',
    description:
      'Diffusez vos programmes d’excellence auprès d’étudiants qualifiés après validation documentaire.',
  },
  {
    icon: Search,
    title: 'Rechercher des candidats qualifiés',
    description:
      'Explorez le vivier de candidats volontaires pseudonymisés compatibles avec vos critères académiques.',
  },
  {
    icon: Users,
    title: 'Organiser des campagnes de recrutement',
    description:
      'Structurez vos campagnes annuelles, quotas, dates limites et comités d’évaluateurs.',
  },
  {
    icon: FileCheck2,
    title: 'Gérer les opportunités proposées',
    description:
      'Suivez les candidatures reçues, les invitations envoyées et les décisions d’attribution.',
  },
  {
    icon: Sparkles,
    title: 'Accéder aux fonctionnalités dédiées aux organismes',
    description:
      'Basculez en un clic entre votre espace personnel et votre espace organisme partenaire vérifié.',
  },
];

export const PartnerRequestStatusBadge: React.FC<{
  status: PartnerRequestStatus;
}> = ({ status }) => {
  const styles: Record<PartnerRequestStatus, string> = {
    DRAFT: 'bg-[#F1F5FB] text-[#5A6E8C] border-[#DCE6F7]',
    SUBMITTED: 'bg-[#EBF0FF] text-[#3457D5] border-[#C5D6FF]',
    UNDER_REVIEW: 'bg-[#FFF4E5] text-[#B25E12] border-[#F5D0A9]',
    MORE_INFO_REQUIRED: 'bg-[#FFF0E6] text-[#9A3412] border-[#F5A17B]',
    APPROVED: 'bg-[#DDF5EB] text-[#14533C] border-[#A7E3C9]',
    REJECTED: 'bg-[#FCE8E8] text-[#9E2A2A] border-[#F5C2C2]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${styles[status]}`}
      data-testid={`partner-status-badge-${status}`}
    >
      {status === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === 'REJECTED' && <XCircle className="h-3.5 w-3.5" />}
      {(status === 'SUBMITTED' || status === 'UNDER_REVIEW') && (
        <Clock className="h-3.5 w-3.5" />
      )}
      {status === 'MORE_INFO_REQUIRED' && <AlertCircle className="h-3.5 w-3.5" />}
      {status === 'DRAFT' && <FileText className="h-3.5 w-3.5" />}
      <span>{getPartnerRequestStatusLabel(status)}</span>
    </span>
  );
};

export const PartnerOrganizationRequestPage: React.FC = () => {
  const {
    currentUser,
    currentStudent,
    partnerRequests,
    savePartnerOrganizationRequestDraft,
    submitPartnerOrganizationRequest,
    switchAuthorizedWorkspace,
  } = useApp();
  const navigate = useNavigate();

  const existingRequest = useMemo(
    () =>
      (partnerRequests || []).find((r) => r.applicantUserId === currentUser.id),
    [partnerRequests, currentUser.id]
  );

  // Mode d'affichage :
  // - 'OVERVIEW' : présentation des avantages + bouton "Soumettre une demande" (ou suivi si demande existante)
  // - 'WIZARD'   : formulaire en 4 étapes
  // - 'TRACKING' : suivi détaillé de la demande soumise
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'WIZARD' | 'TRACKING'>(
    existingRequest && existingRequest.status !== 'DRAFT'
      ? 'TRACKING'
      : 'OVERVIEW'
  );
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionSuccessBanner, setSubmissionSuccessBanner] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PartnerSupportingDocument | null>(
    null
  );

  // États du formulaire en 4 étapes
  const [officialName, setOfficialName] = useState(
    existingRequest?.officialName || ''
  );
  const [organizationType, setOrganizationType] =
    useState<PartnerOrganizationUiType>(
      existingRequest?.organizationType || 'Fondation'
    );
  const [country, setCountry] = useState(
    existingRequest?.country || currentStudent.residenceCountry || 'Cameroun'
  );
  const [city, setCity] = useState(
    existingRequest?.city || currentStudent.city || 'Yaoundé'
  );
  const [address, setAddress] = useState(existingRequest?.address || '');
  const [website, setWebsite] = useState(existingRequest?.website || '');
  const [description, setDescription] = useState(
    existingRequest?.description || ''
  );

  const [professionalEmail, setProfessionalEmail] = useState(
    existingRequest?.professionalEmail || ''
  );
  const [professionalPhone, setProfessionalPhone] = useState(
    existingRequest?.professionalPhone || ''
  );
  const [representativeName, setRepresentativeName] = useState(
    existingRequest?.representativeName || currentUser.fullName
  );
  const [representativeRole, setRepresentativeRole] = useState(
    existingRequest?.representativeRole || ''
  );
  const [requestMotivation, setRequestMotivation] = useState(
    existingRequest?.requestMotivation || ''
  );

  const [legalRegistrationNumber, setLegalRegistrationNumber] = useState(
    existingRequest?.legalRegistrationNumber || ''
  );
  const [documents, setDocuments] = useState<PartnerSupportingDocument[]>(
    existingRequest?.documents || []
  );

  const hasOrganizationPermission = Boolean(
    currentUser.grantedRoles?.includes('ORGANIZATION')
  );
  const submissionLocked = isPartnerSubmissionLocked(existingRequest?.status);

  const buildPayload = (): Partial<PartnerOrganizationRequest> => ({
    officialName,
    organizationType,
    country,
    city,
    address,
    website,
    description,
    professionalEmail,
    professionalPhone,
    representativeName,
    representativeRole,
    requestMotivation,
    legalRegistrationNumber,
    documents,
  });

  const validateStep1 = (): boolean => {
    if (!officialName.trim()) {
      setErrorMsg('Veuillez renseigner le nom officiel de l’organisme.');
      return false;
    }
    if (!country.trim() || !city.trim() || !address.trim()) {
      setErrorMsg('Veuillez renseigner le pays, la ville et l’adresse officielle.');
      return false;
    }
    if (!website.trim() || !/^https?:\/\/.+/i.test(website.trim())) {
      setErrorMsg(
        'Veuillez saisir l’URL complète du site web officiel (commençant par https:// ou http://).'
      );
      return false;
    }
    if (description.trim().length < 20) {
      setErrorMsg(
        'Veuillez fournir une description de l’organisme (au moins 20 caractères).'
      );
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (
      !professionalEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(professionalEmail.trim())
    ) {
      setErrorMsg('Veuillez saisir une adresse email professionnelle valide.');
      return false;
    }
    if (!professionalPhone.trim() || professionalPhone.trim().length < 8) {
      setErrorMsg('Veuillez saisir un numéro de téléphone professionnel valide.');
      return false;
    }
    if (!representativeName.trim() || !representativeRole.trim()) {
      setErrorMsg('Veuillez indiquer le nom et la fonction du représentant.');
      return false;
    }
    if (requestMotivation.trim().length < 15) {
      setErrorMsg('Veuillez préciser le motif de la demande (au moins 15 caractères).');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    const hasLegalExistenceDoc = documents.some(
      (d) => d.category === 'LEGAL_EXISTENCE'
    );
    if (!hasLegalExistenceDoc) {
      setErrorMsg(
        'Veuillez téléverser au moins le document attestant l’existence légale de l’organisme.'
      );
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
  };

  const handleFileUpload = (
    category: PartnerSupportingDocument['category'],
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !/\.(pdf|png|jpg|jpeg)$/i.test(file.name)
    ) {
      setErrorMsg(
        'Format de fichier non autorisé. Veuillez téléverser un document PDF, PNG ou JPG.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('La taille du fichier ne doit pas dépasser 10 Mo.');
      return;
    }

    const newDoc: PartnerSupportingDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      sizeBytes: file.size,
      uploadedAt: '2026-11-24',
      confidentialPreviewSummary:
        category === 'LEGAL_EXISTENCE'
          ? `Document officiel attestant l’existence légale de « ${officialName || 'l’organisme'} » (${file.name}).`
          : category === 'REPRESENTATIVE_AUTHORIZATION'
          ? `Mandat / justificatif d’autorisation désignant ${representativeName || currentUser.fullName} (${file.name}).`
          : `Pièce justificative complémentaire transmise pour vérification (${file.name}).`,
    };

    // Permet de remplacer un document existant de la même catégorie (pour LEGAL_EXISTENCE ou REPRESENTATIVE_AUTHORIZATION)
    setDocuments((prev) => {
      if (category === 'ADDITIONAL_INFO') {
        return [...prev, newDoc];
      }
      return [...prev.filter((d) => d.category !== category), newDoc];
    });
    setErrorMsg(null);
    e.target.value = '';
  };

  const handleAttachSimulatedDocument = (
    category: PartnerSupportingDocument['category']
  ) => {
    const orgSlug = (officialName || 'Organisme_Partenaire')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .slice(0, 30);
    const simulatedDoc: PartnerSupportingDocument = {
      id: `doc-sim-${Date.now()}`,
      category,
      fileName:
        category === 'LEGAL_EXISTENCE'
          ? `Attestation_Existence_Legale_${orgSlug}_2026.pdf`
          : category === 'REPRESENTATIVE_AUTHORIZATION'
          ? `Mandat_Autorisation_Representant_${orgSlug}.pdf`
          : `Complement_Justificatif_${orgSlug}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 348200,
      uploadedAt: '2026-11-24',
      confidentialPreviewSummary:
        category === 'LEGAL_EXISTENCE'
          ? `Certificat d’enregistrement officiel attestant l’existence juridique de « ${officialName || 'l’organisme'} » (Numéro : ${legalRegistrationNumber || 'REG-2026-CM'}).`
          : category === 'REPRESENTATIVE_AUTHORIZATION'
          ? `Acte d’habilitation signé autorisant ${representativeName || currentUser.fullName} (${representativeRole || 'Représentant'}) à gérer l’espace organisme sur SCHOLARFIND.`
          : `Pièce justificative complémentaire jointe en réponse à la demande de l’administrateur.`,
    };

    setDocuments((prev) => {
      if (category === 'ADDITIONAL_INFO') {
        return [...prev, simulatedDoc];
      }
      return [...prev.filter((d) => d.category !== category), simulatedDoc];
    });
    setErrorMsg(null);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSaveDraft = () => {
    savePartnerOrganizationRequestDraft(buildPayload());
  };

  const handleFinalSubmit = () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    const res = submitPartnerOrganizationRequest(buildPayload());
    if (!res.success) {
      setErrorMsg(res.error || 'Soumission impossible.');
      return;
    }
    setSubmissionSuccessBanner(true);
    setViewMode('TRACKING');
  };

  const legalDoc = documents.find((d) => d.category === 'LEGAL_EXISTENCE');
  const repAuthDoc = documents.find(
    (d) => d.category === 'REPRESENTATIVE_AUTHORIZATION'
  );
  const additionalDocs = documents.filter(
    (d) => d.category === 'ADDITIONAL_INFO'
  );

  return (
    <div className="space-y-6">
      <ProfilSubNav />

      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EBF0FF] px-2.5 py-1 text-xs font-bold text-[#3457D5]">
            <Building2 className="h-3.5 w-3.5" /> Gouvernance des comptes partenaires
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
            Devenir un organisme partenaire
          </h1>
          <p className="text-sm text-[#69768C] mt-1">
            Demandez la création d’un espace organisme vérifié pour publier des bourses et organiser vos campagnes de recrutement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasOrganizationPermission && (
            <button
              type="button"
              onClick={() => {
                if (switchAuthorizedWorkspace('ORGANIZATION')) {
                  navigate('/organisme/tableau-de-bord');
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F8A5C] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#166945] transition-colors cursor-pointer"
              data-testid="switch-to-organization-workspace-btn"
            >
              <Repeat className="h-4 w-4" />
              Basculer vers l’Espace Organisme
            </button>
          )}
          {existingRequest && viewMode !== 'TRACKING' && (
            <button
              type="button"
              onClick={() => setViewMode('TRACKING')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F4] bg-white px-4 py-2.5 text-xs font-bold text-[#203454] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              Suivi de ma demande
            </button>
          )}
        </div>
      </div>

      {/* Bannière de confirmation après soumission */}
      {submissionSuccessBanner && (
        <div
          role="status"
          className="rounded-2xl border border-[#A7E3C9] bg-[#DDF5EB]/70 p-4 sm:p-5 flex items-start gap-3"
          data-testid="partner-request-submitted-confirmation"
        >
          <CheckCircle2 className="h-5 w-5 text-[#14533C] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#14533C]">
            <p className="font-bold">
              Votre demande de création de compte organisme partenaire a été soumise avec succès.
            </p>
            <p className="mt-1">
              Conformément aux règles de sécurité SCHOLARFIND, le rôle{' '}
              <code className="font-mono font-bold">ORGANIZATION</code> n’est jamais attribué automatiquement : un administrateur vérifie vos pièces justificatives avant d’activer votre espace partenaire.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE 1 : PRÉSENTATION DES AVANTAGES & ACCÈS AU FORMULAIRE
      ======================================================================== */}
      {viewMode === 'OVERVIEW' && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#E6ECF5] bg-white p-6 sm:p-8 shadow-xs">
            <div className="max-w-3xl">
              <h2 className="text-lg sm:text-xl font-bold text-[#203454]">
                Pourquoi créer un compte organisme partenaire sur SCHOLARFIND ?
              </h2>
              <p className="mt-1.5 text-sm text-[#69768C] leading-relaxed">
                Les universités, fondations, entreprises, ONG et institutions publiques disposent d’un espace dédié pour gérer leurs programmes de bourses tout en respectant la protection des données personnelles des étudiants.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PARTNER_BENEFITS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF0FF] text-[#3457D5] mb-3">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-[#203454]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#69768C] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-[#DCE6F7] bg-[#F8FAFD] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#3457D5] shrink-0 mt-0.5" />
                <div className="text-xs text-[#5A6E8C]">
                  <span className="font-bold text-[#203454] block">
                    Vérification administrative préalable obligatoire
                  </span>
                  Votre demande passe par 4 étapes simples (Informations organisme, Coordonnées professionnelles, Justificatifs légaux, Récapitulatif). Une fois approuvée par l’administrateur, vous pourrez basculer librement entre votre Espace Étudiant et votre Espace Organisme.
                </div>
              </div>

              <div className="shrink-0">
                {submissionLocked ? (
                  <button
                    type="button"
                    onClick={() => setViewMode('TRACKING')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#203454] px-5 py-3 text-xs font-bold text-white hover:bg-[#3457D5] transition-colors cursor-pointer"
                  >
                    Consulter ma demande en cours
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('WIZARD');
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] transition-colors cursor-pointer"
                    data-testid="start-partner-request-btn"
                  >
                    {existingRequest?.status === 'DRAFT'
                      ? 'Reprendre mon brouillon de demande'
                      : 'Soumettre une demande'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================
          MODE 2 : FORMULAIRE DE DEMANDE EN 4 ÉTAPES
      ======================================================================== */}
      {viewMode === 'WIZARD' && (
        <div className="rounded-3xl border border-[#E6ECF5] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Barre de progression des 4 étapes */}
          <div className="border-b border-[#E6ECF5] pb-5">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  existingRequest ? setViewMode('TRACKING') : setViewMode('OVERVIEW')
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A6E8C] hover:text-[#203454] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la présentation
              </button>
              <span className="text-xs font-bold text-[#3457D5]">
                Étape {step} sur 4
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { num: 1, label: '1. Organisme' },
                { num: 2, label: '2. Coordonnées pro' },
                { num: 3, label: '3. Justificatifs' },
                { num: 4, label: '4. Vérification' },
              ].map((item) => {
                const isActive = step === item.num;
                const isDone = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (item.num < step) {
                        setErrorMsg(null);
                        setStep(item.num as 1 | 2 | 3 | 4);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                      isActive
                        ? 'border-[#3457D5] bg-[#EBF0FF] text-[#3457D5]'
                        : isDone
                        ? 'border-[#A7E3C9] bg-[#DDF5EB]/50 text-[#14533C] cursor-pointer'
                        : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#69768C]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F8A5C]" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-extrabold">
                        {item.num}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3.5 text-xs text-[#9E2A2A]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ÉTAPE 1 : Informations sur l'organisme */}
          {step === 1 && (
            <div className="space-y-4" data-testid="partner-step-1">
              <div>
                <h2 className="text-lg font-bold text-[#203454]">
                  Étape 1 — Informations sur l’organisme
                </h2>
                <p className="text-xs text-[#69768C]">
                  Renseignez l’identité officielle et la localisation de l’institution que vous représentez.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="org-official-name"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Nom officiel de l’organisme *
                  </label>
                  <input
                    id="org-official-name"
                    type="text"
                    value={officialName}
                    onChange={(e) => setOfficialName(e.target.value)}
                    placeholder="Ex: Fondation Africaine pour l’Innovation Scientifique"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="org-type"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Type d’organisme *
                  </label>
                  <select
                    id="org-type"
                    value={organizationType}
                    onChange={(e) =>
                      setOrganizationType(
                        e.target.value as PartnerOrganizationUiType
                      )
                    }
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  >
                    {PARTNER_ORG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="org-country"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Pays *
                  </label>
                  <input
                    id="org-country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: Cameroun"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="org-city"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Ville *
                  </label>
                  <input
                    id="org-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Yaoundé"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="org-address"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Adresse postale / Siège *
                  </label>
                  <input
                    id="org-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Boulevard du 20 Mai, BP 1540"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="org-website"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Site web officiel *
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                    <input
                      id="org-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.exemple-fondation.org"
                      className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="org-description"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Description de l’organisme et de ses missions éducatives *
                </label>
                <textarea
                  id="org-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez brièvement les activités de l’organisme et les types de bourses ou soutiens proposés aux étudiants..."
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] p-3.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Informations professionnelles */}
          {step === 2 && (
            <div className="space-y-4" data-testid="partner-step-2">
              <div>
                <h2 className="text-lg font-bold text-[#203454]">
                  Étape 2 — Informations professionnelles du représentant
                </h2>
                <p className="text-xs text-[#69768C]">
                  Indiquez vos coordonnées institutionnelles et votre fonction au sein de l’organisme.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="org-pro-email"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Adresse email professionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                    <input
                      id="org-pro-email"
                      type="email"
                      value={professionalEmail}
                      onChange={(e) => setProfessionalEmail(e.target.value)}
                      placeholder="contact.bourses@organisme.org"
                      className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="org-pro-phone"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Numéro de téléphone professionnel *
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                    <input
                      id="org-pro-phone"
                      type="tel"
                      value={professionalPhone}
                      onChange={(e) => setProfessionalPhone(e.target.value)}
                      placeholder="+237 699 00 11 22"
                      className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="org-rep-name"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Nom complet du représentant *
                  </label>
                  <input
                    id="org-rep-name"
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="Nom et prénom du responsable"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="org-rep-role"
                    className="block text-xs font-bold text-[#203454] mb-1.5"
                  >
                    Fonction du représentant *
                  </label>
                  <input
                    id="org-rep-role"
                    type="text"
                    value={representativeRole}
                    onChange={(e) => setRepresentativeRole(e.target.value)}
                    placeholder="Ex: Directeur des Programmes Académiques"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="org-motivation"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Motif de la demande *
                </label>
                <textarea
                  id="org-motivation"
                  rows={3}
                  value={requestMotivation}
                  onChange={(e) => setRequestMotivation(e.target.value)}
                  placeholder="Précisez les programmes de bourses que vous envisagez de publier ou les campagnes de présélection prévues..."
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] p-3.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Justificatifs */}
          {step === 3 && (
            <div className="space-y-5" data-testid="partner-step-3">
              <div>
                <h2 className="text-lg font-bold text-[#203454]">
                  Étape 3 — Pièces justificatives & Enregistrement légal
                </h2>
                <p className="text-xs text-[#69768C]">
                  Les justificatifs téléversés sont stockés dans un espace privé accessible uniquement aux administrateurs habilités.
                </p>
              </div>

              <div>
                <label
                  htmlFor="org-legal-reg"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Numéro d’enregistrement légal / Arrêté / RCCM (si applicable)
                </label>
                <input
                  id="org-legal-reg"
                  type="text"
                  value={legalRegistrationNumber}
                  onChange={(e) => setLegalRegistrationNumber(e.target.value)}
                  placeholder="Ex: MINAT-FOND-2025-0412 ou RC/YAO/2024/B/109"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document 1 : Existence légale */}
                <div className="rounded-2xl border border-[#E2E8F4] bg-[#F8FAFD] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#203454] block">
                        1. Document attestant l’existence de l’organisme *
                      </span>
                      <span className="text-[11px] text-[#69768C]">
                        Décret, récépissé, extrait RCCM ou convention officielle (PDF, PNG, JPG — max 10 Mo)
                      </span>
                    </div>
                    {legalDoc && (
                      <CheckCircle2 className="h-5 w-5 text-[#1F8A5C] shrink-0" />
                    )}
                  </div>

                  {legalDoc ? (
                    <div className="rounded-xl border border-[#A7E3C9] bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#3457D5] shrink-0" />
                          <span className="truncate text-xs font-bold text-[#203454]">
                            {legalDoc.fileName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#69768C] shrink-0">
                          {Math.round(legalDoc.sizeBytes / 1024)} Ko
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(legalDoc)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#EBF0FF] px-2.5 py-1 text-[11px] font-bold text-[#3457D5] hover:bg-[#3457D5] hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> Aperçu
                        </button>
                        <label className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#203454] hover:border-[#3457D5] cursor-pointer">
                          <Upload className="h-3 w-3" /> Remplacer
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) =>
                              handleFileUpload('LEGAL_EXISTENCE', e)
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(legalDoc.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#F5C2C2] bg-[#FCE8E8]/50 px-2.5 py-1 text-[11px] font-semibold text-[#9E2A2A] hover:bg-[#FCE8E8] cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-xl bg-[#3457D5] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2845B5] transition-colors cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Téléverser un fichier
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) =>
                            handleFileUpload('LEGAL_EXISTENCE', e)
                          }
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleAttachSimulatedDocument('LEGAL_EXISTENCE')
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE6F7] bg-white px-3 py-2 text-xs font-semibold text-[#203454] hover:border-[#3457D5] hover:text-[#3457D5] cursor-pointer"
                        data-testid="attach-demo-legal-doc-btn"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Joindre un justificatif de démo
                      </button>
                    </div>
                  )}
                </div>

                {/* Document 2 : Autorisation du représentant */}
                <div className="rounded-2xl border border-[#E2E8F4] bg-[#F8FAFD] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#203454] block">
                        2. Justificatif d’autorisation du représentant (si nécessaire)
                      </span>
                      <span className="text-[11px] text-[#69768C]">
                        Mandat nominatif, arrêté de nomination ou attestation de fonction signée
                      </span>
                    </div>
                    {repAuthDoc && (
                      <CheckCircle2 className="h-5 w-5 text-[#1F8A5C] shrink-0" />
                    )}
                  </div>

                  {repAuthDoc ? (
                    <div className="rounded-xl border border-[#A7E3C9] bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#3457D5] shrink-0" />
                          <span className="truncate text-xs font-bold text-[#203454]">
                            {repAuthDoc.fileName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#69768C] shrink-0">
                          {Math.round(repAuthDoc.sizeBytes / 1024)} Ko
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(repAuthDoc)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#EBF0FF] px-2.5 py-1 text-[11px] font-bold text-[#3457D5] hover:bg-[#3457D5] hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> Aperçu
                        </button>
                        <label className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#203454] hover:border-[#3457D5] cursor-pointer">
                          <Upload className="h-3 w-3" /> Remplacer
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) =>
                              handleFileUpload(
                                'REPRESENTATIVE_AUTHORIZATION',
                                e
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(repAuthDoc.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#F5C2C2] bg-[#FCE8E8]/50 px-2.5 py-1 text-[11px] font-semibold text-[#9E2A2A] hover:bg-[#FCE8E8] cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#3457D5] px-3.5 py-2 text-xs font-bold text-[#3457D5] hover:bg-[#EBF0FF] transition-colors cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Téléverser un fichier
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) =>
                            handleFileUpload('REPRESENTATIVE_AUTHORIZATION', e)
                          }
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleAttachSimulatedDocument(
                            'REPRESENTATIVE_AUTHORIZATION'
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE6F7] bg-white px-3 py-2 text-xs font-semibold text-[#203454] hover:border-[#3457D5] hover:text-[#3457D5] cursor-pointer"
                        data-testid="attach-demo-rep-doc-btn"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Joindre un mandat de démo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] p-3.5 flex items-center gap-2.5 text-xs text-[#5A6E8C]">
                <Lock className="h-4 w-4 text-[#3457D5] shrink-0" />
                <span>
                  Stockage confidentiel : ces documents ne sont jamais exposés publiquement. Seuls le demandeur et les administrateurs SCHOLARFIND peuvent les consulter.
                </span>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : Vérification et soumission */}
          {step === 4 && (
            <div className="space-y-5" data-testid="partner-step-4">
              <div>
                <h2 className="text-lg font-bold text-[#203454]">
                  Étape 4 — Vérification et soumission
                </h2>
                <p className="text-xs text-[#69768C]">
                  Vérifiez le récapitulatif complet de votre demande avant de la transmettre à l’administration SCHOLARFIND.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Récap Étape 1 */}
                <div className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                      1. Identité de l’organisme
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3457D5] hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Modifier
                    </button>
                  </div>
                  <dl className="space-y-1 text-xs">
                    <div>
                      <dt className="text-[#69768C] inline">Nom officiel : </dt>
                      <dd className="font-bold text-[#203454] inline">
                        {officialName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#69768C] inline">Type : </dt>
                      <dd className="font-semibold text-[#203454] inline">
                        {organizationType}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#69768C] inline">Localisation : </dt>
                      <dd className="font-semibold text-[#203454] inline">
                        {address}, {city}, {country}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#69768C] inline">Site web : </dt>
                      <dd className="font-semibold text-[#3457D5] inline">
                        {website}
                      </dd>
                    </div>
                    <div className="pt-1">
                      <dt className="text-[#69768C] block">Description :</dt>
                      <dd className="text-[#203454] mt-0.5">{description}</dd>
                    </div>
                  </dl>
                </div>

                {/* Récap Étape 2 */}
                <div className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                      2. Représentant & Contact pro
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3457D5] hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> Modifier
                    </button>
                  </div>
                  <dl className="space-y-1 text-xs">
                    <div>
                      <dt className="text-[#69768C] inline">Représentant : </dt>
                      <dd className="font-bold text-[#203454] inline">
                        {representativeName} ({representativeRole})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#69768C] inline">Email pro : </dt>
                      <dd className="font-semibold text-[#203454] inline">
                        {professionalEmail}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#69768C] inline">Téléphone : </dt>
                      <dd className="font-semibold text-[#203454] inline">
                        {professionalPhone}
                      </dd>
                    </div>
                    <div className="pt-1">
                      <dt className="text-[#69768C] block">Motif de la demande :</dt>
                      <dd className="text-[#203454] mt-0.5">
                        {requestMotivation}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Récap Étape 3 */}
              <div className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                    3. Justificatifs joints ({documents.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3457D5] hover:underline cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" /> Modifier les pièces
                  </button>
                </div>
                <p className="text-xs text-[#69768C]">
                  Numéro d’enregistrement légal :{' '}
                  <span className="font-bold text-[#203454]">
                    {legalRegistrationNumber || 'Non renseigné'}
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-[#DCE6F7] bg-white px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="h-4 w-4 text-[#1F8A5C] shrink-0" />
                        <span className="truncate font-semibold text-[#203454]">
                          {doc.fileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-[#3457D5] font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Aperçu
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#DCE6F7] bg-[#EBF0FF]/40 p-3.5 text-xs text-[#203454] flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#3457D5] shrink-0 mt-0.5" />
                <span>
                  En soumettant cette demande, vous certifiez l’exactitude des informations transmises. Le rôle{' '}
                  <code className="font-mono font-bold">ORGANIZATION</code> ne sera activé sur votre compte qu’après examen et approbation explicite d’un administrateur.
                </span>
              </div>
            </div>
          )}

          {/* Pied de formulaire : Navigation entre étapes + Brouillon + Soumission */}
          <div className="border-t border-[#E6ECF5] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F4] bg-white px-4 py-2.5 text-xs font-bold text-[#203454] hover:border-[#3457D5] cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Étape précédente
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] px-4 py-2.5 text-xs font-bold text-[#5A6E8C] hover:text-[#203454] cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                Enregistrer en brouillon
              </button>
            </div>

            <div>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2845B5] transition-colors cursor-pointer"
                  data-testid="partner-next-step-btn"
                >
                  Continuer vers l’étape {step + 1}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F8A5C] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#166945] transition-colors cursor-pointer"
                  data-testid="partner-final-submit-btn"
                >
                  <Send className="h-4 w-4" />
                  Soumettre ma demande pour vérification
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE 3 : SUIVI DE LA DEMANDE (STATUTS, HISTORIQUE, PIÈCES COMPLÉMENTAIRES)
      ======================================================================== */}
      {viewMode === 'TRACKING' && existingRequest && (
        <div className="space-y-6" data-testid="partner-request-tracking">
          {/* Carte principale de statut */}
          <section className="rounded-3xl border border-[#E6ECF5] bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6ECF5] pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <PartnerRequestStatusBadge status={existingRequest.status} />
                  <span className="text-xs font-medium text-[#69768C]">
                    Réf. dossier :{' '}
                    <code className="font-mono font-bold text-[#203454]">
                      {existingRequest.id.toUpperCase()}
                    </code>
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-[#203454]">
                  {existingRequest.officialName}
                </h2>
                <p className="text-xs text-[#69768C] mt-0.5">
                  {existingRequest.organizationType} · {existingRequest.city},{' '}
                  {existingRequest.country} · Soumise le{' '}
                  {existingRequest.submittedAt
                    ? existingRequest.submittedAt.slice(0, 10)
                    : existingRequest.createdAt.slice(0, 10)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {(existingRequest.status === 'DRAFT' ||
                  existingRequest.status === 'MORE_INFO_REQUIRED') && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('WIZARD');
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3457D5] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2845B5] cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier / Compléter ma demande
                  </button>
                )}
                {submissionLocked && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] px-3.5 py-2 text-xs font-semibold text-[#5A6E8C]">
                    <Lock className="h-3.5 w-3.5 text-[#3457D5]" />
                    Dossier verrouillé (soumissions multiples bloquées)
                  </span>
                )}
              </div>
            </div>

            {/* Frise visuelle des étapes de traitement */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: '1. Brouillon / Saisie',
                  done: true,
                },
                {
                  label: '2. Demande soumise',
                  done: existingRequest.status !== 'DRAFT',
                },
                {
                  label: '3. Examen administrateur',
                  done:
                    existingRequest.status === 'UNDER_REVIEW' ||
                    existingRequest.status === 'MORE_INFO_REQUIRED' ||
                    existingRequest.status === 'APPROVED' ||
                    existingRequest.status === 'REJECTED',
                },
                {
                  label:
                    existingRequest.status === 'REJECTED'
                      ? '4. Décision : Refusée'
                      : '4. Décision : Approuvée',
                  done:
                    existingRequest.status === 'APPROVED' ||
                    existingRequest.status === 'REJECTED',
                },
              ].map((st, i) => (
                <div
                  key={i}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 ${
                    st.done
                      ? existingRequest.status === 'REJECTED' && i === 3
                        ? 'border-[#F5C2C2] bg-[#FCE8E8]/60 text-[#9E2A2A]'
                        : 'border-[#A7E3C9] bg-[#DDF5EB]/50 text-[#14533C]'
                      : 'border-[#E6ECF5] bg-[#F8FAFD] text-[#69768C]'
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      st.done ? 'text-[#1F8A5C]' : 'text-[#C5D1E5]'
                    }`}
                  />
                  <span className="truncate">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Alerte si informations complémentaires requises */}
            {existingRequest.status === 'MORE_INFO_REQUIRED' && (
              <div className="rounded-2xl border border-[#F5A17B] bg-[#FFF0E6] p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-[#9A3412] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#9A3412]">
                      Demande de pièces ou précisions complémentaires de l’administrateur
                    </h3>
                    <p className="mt-1 text-xs text-[#203454] leading-relaxed">
                      {existingRequest.adminFeedbackNote ||
                        'Veuillez vérifier et compléter vos pièces justificatives avant de soumettre à nouveau votre demande.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleAttachSimulatedDocument('ADDITIONAL_INFO');
                      submitPartnerOrganizationRequest({
                        ...existingRequest,
                        documents: [
                          ...existingRequest.documents,
                          {
                            id: `doc-comp-${Date.now()}`,
                            category: 'ADDITIONAL_INFO',
                            fileName: `Justificatif_Complementaire_${existingRequest.officialName
                              .replace(/[^a-zA-Z0-9]+/g, '_')
                              .slice(0, 25)}.pdf`,
                            mimeType: 'application/pdf',
                            sizeBytes: 264000,
                            uploadedAt: '2026-11-24',
                            confidentialPreviewSummary:
                              'Pièce justificative complémentaire transmise en réponse à la demande de l’administrateur.',
                          },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#9A3412] px-4 py-2 text-xs font-bold text-white hover:bg-[#7C2D12] cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Transmettre le justificatif demandé et re-soumettre
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('WIZARD');
                      setStep(3);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#9A3412] bg-white px-3.5 py-2 text-xs font-bold text-[#9A3412] hover:bg-[#FFF8F4] cursor-pointer"
                  >
                    Gérer mes fichiers à l’étape 3
                  </button>
                </div>
              </div>
            )}

            {/* Alerte si demande refusée */}
            {existingRequest.status === 'REJECTED' && (
              <div className="rounded-2xl border border-[#F5C2C2] bg-[#FCE8E8] p-4 sm:p-5 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-[#9E2A2A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#9E2A2A]">
                  <p className="font-bold text-sm">
                    Motif du refus communiqué par l’administration :
                  </p>
                  <p className="mt-1">
                    {existingRequest.rejectionReason ||
                      'Les pièces justificatives fournies n’ont pas permis de certifier l’habilitation légale de l’organisme.'}
                  </p>
                </div>
              </div>
            )}

            {/* Bannière si demande approuvée */}
            {existingRequest.status === 'APPROVED' && (
              <div className="rounded-2xl border border-[#A7E3C9] bg-[#DDF5EB]/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#14533C] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#14533C]">
                    <p className="font-bold text-sm">
                      Demande approuvée — Espace Organisme Partenaire activé
                    </p>
                    <p className="mt-0.5">
                      Votre compte dispose désormais des permissions{' '}
                      <code className="font-mono font-bold">STUDENT</code> et{' '}
                      <code className="font-mono font-bold">ORGANIZATION</code>. Vous pouvez basculer entre vos deux espaces à tout moment.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (switchAuthorizedWorkspace('ORGANIZATION')) {
                      navigate('/organisme/tableau-de-bord');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14533C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0E3F2D] shrink-0 cursor-pointer"
                >
                  <Repeat className="h-4 w-4" />
                  Ouvrir mon Espace Organisme
                </button>
              </div>
            )}

            {/* Informations transmises & Justificatifs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                  Informations transmises
                </h3>
                <dl className="space-y-1.5 text-xs">
                  <div>
                    <dt className="text-[#69768C] inline">Représentant : </dt>
                    <dd className="font-bold text-[#203454] inline">
                      {existingRequest.representativeName} (
                      {existingRequest.representativeRole})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#69768C] inline">Contact pro : </dt>
                    <dd className="font-semibold text-[#203454] inline">
                      {existingRequest.professionalEmail} ·{' '}
                      {existingRequest.professionalPhone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#69768C] inline">Site officiel : </dt>
                    <dd className="font-semibold text-[#3457D5] inline">
                      {existingRequest.website}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#69768C] inline">
                      N° d’enregistrement légal :{' '}
                    </dt>
                    <dd className="font-mono font-bold text-[#203454] inline">
                      {existingRequest.legalRegistrationNumber ||
                        'Non renseigné'}
                    </dd>
                  </div>
                  <div className="pt-1">
                    <dt className="text-[#69768C] block">Motif :</dt>
                    <dd className="text-[#203454] mt-0.5">
                      {existingRequest.requestMotivation}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-[#E6ECF5] bg-[#F8FAFD] p-4 space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                  Pièces justificatives ({existingRequest.documents.length})
                </h3>
                <div className="space-y-2">
                  {existingRequest.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-[#DCE6F7] bg-white px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[#3457D5] shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#203454]">
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] text-[#69768C]">
                            Téléversé le {doc.uploadedAt} ·{' '}
                            {Math.round(doc.sizeBytes / 1024)} Ko
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#EBF0FF] px-2.5 py-1 text-[11px] font-bold text-[#3457D5] hover:bg-[#3457D5] hover:text-white transition-colors shrink-0 cursor-pointer"
                      >
                        <Eye className="h-3 w-3" /> Aperçu
                      </button>
                    </div>
                  ))}
                  {additionalDocs.length > 0 && (
                    <p className="text-[11px] text-[#14533C] font-semibold">
                      {additionalDocs.length} pièce(s) complémentaire(s) jointe(s).
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Historique des décisions */}
            {existingRequest.decisionHistory.length > 0 && (
              <div className="border-t border-[#E6ECF5] pt-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#203454] mb-3">
                  Historique de suivi et décisions
                </h3>
                <div className="space-y-2">
                  {existingRequest.decisionHistory.map((h) => (
                    <div
                      key={h.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#E6ECF5] bg-[#F8FAFD] px-3.5 py-2.5 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#203454]">
                            {getPartnerRequestStatusLabel(h.newStatus)}
                          </span>
                          <span className="text-[11px] text-[#69768C]">
                            par {h.actorName}
                          </span>
                        </div>
                        <p className="text-[#5A6E8C]">{h.note}</p>
                      </div>
                      <span className="font-mono text-[11px] text-[#69768C] shrink-0">
                        {h.decidedAt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modale d'aperçu confidentiel d'une pièce justificative */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Aperçu confidentiel : ${previewDoc.fileName}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#203454]">
                  Catégorie du justificatif :
                </span>
                <span className="rounded bg-[#EBF0FF] px-2 py-0.5 font-bold text-[#3457D5]">
                  {previewDoc.category === 'LEGAL_EXISTENCE'
                    ? 'Existence légale de l’organisme'
                    : previewDoc.category === 'REPRESENTATIVE_AUTHORIZATION'
                    ? 'Autorisation du représentant'
                    : 'Pièce complémentaire'}
                </span>
              </div>
              <p className="text-[#69768C]">
                Type MIME : {previewDoc.mimeType} · Taille :{' '}
                {Math.round(previewDoc.sizeBytes / 1024)} Ko · Téléversé le{' '}
                {previewDoc.uploadedAt}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F4] bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14533C]">
                <ShieldCheck className="h-4 w-4 text-[#1F8A5C]" />
                Aperçu sécurisé du document (Stockage privé SCHOLARFIND)
              </div>
              <p className="text-xs text-[#203454] leading-relaxed">
                {previewDoc.confidentialPreviewSummary}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
