import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import {
  AcademicLevel,
  CriterionEvaluationStatus,
  CurationStatus,
  EligibilityGlobalVerdict,
} from '../../types';

/**
 * 1. BOUTONS DU DESIGN SYSTEM « MODERN YOUTH EDUCATION — MINIMAL & FRIENDLY »
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'copper' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 cursor-pointer';

  const variants: Record<string, string> = {
    primary:
      'bg-[#3457D5] text-white hover:bg-[#203454] border border-[#3457D5] hover:border-[#203454]',
    secondary:
      'bg-white text-[#253047] border border-[#E6ECF5] hover:bg-[#F8FAFD] hover:border-[#3457D5]/40',
    copper:
      'bg-[#F5A17B] text-[#203454] hover:bg-[#f28e61] border border-[#F5A17B]',
    danger:
      'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-[#DC2626]',
    ghost: 'bg-transparent text-[#253047] hover:bg-[#3457D5]/10',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * 2. EN-TÊTE DE PAGE MODERNE & ÉPURÉ (DM Sans)
 */
interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  kicker,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="pb-4 mb-6 border-b border-[#E6ECF5] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1 max-w-3xl">
        {kicker && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3457D5]">
            {kicker}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-[#203454] tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#69768C] leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * 3. PANNEAU / CARTE MODERNE LÉGÈRE
 */
interface PanelProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  headerRight,
  children,
  className = '',
  noPadding = false,
}) => {
  return (
    <section
      className={`bg-white border border-[#E6ECF5] rounded-2xl ${className}`}
    >
      {(title || headerRight) && (
        <div className="px-5 py-4 border-b border-[#E6ECF5] flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-base font-bold text-[#203454]">{title}</h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#69768C] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
};

/**
 * 4. BANDEAU TRIPTYQUE ACADÉMIQUE LÉGER
 * Distingue clairement :
 * 1. Le diplôme déjà obtenu · 2. Le niveau d'études actuel · 3. Le niveau ou la formation recherchée
 */
interface AcademicTriptychProps {
  highestDiplomaObtained: AcademicLevel | '';
  highestDiplomaName?: string;
  currentStudyLevel: AcademicLevel | '';
  currentInstitution?: string;
  targetStudyLevel: AcademicLevel | '';
  studyDomain?: string;
  compact?: boolean;
}

export const AcademicTriptych: React.FC<AcademicTriptychProps> = ({
  highestDiplomaObtained,
  highestDiplomaName,
  currentStudyLevel,
  currentInstitution,
  targetStudyLevel,
  studyDomain,
  compact = false,
}) => {
  return (
    <div
      className={`bg-white border border-[#E6ECF5] rounded-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E6ECF5] ${
        compact ? 'p-3.5 gap-3' : 'p-4 gap-4'
      }`}
      aria-label="Synthèse des trois niveaux du parcours académique"
    >
      <div className="pr-2">
        <div className="text-[11px] text-[#69768C] font-semibold uppercase tracking-wide">
          1. Diplôme obtenu
        </div>
        <div className="text-sm font-bold text-[#203454] mt-0.5">
          {highestDiplomaObtained || 'Non renseigné'}
        </div>
        {highestDiplomaName && !compact && (
          <div className="text-xs text-[#69768C] mt-0.5 truncate">
            {highestDiplomaName}
          </div>
        )}
      </div>

      <div className="md:pl-4 pr-2 pt-2 md:pt-0">
        <div className="text-[11px] text-[#69768C] font-semibold uppercase tracking-wide">
          2. Niveau actuel
        </div>
        <div className="text-sm font-bold text-[#253047] mt-0.5">
          {currentStudyLevel || 'Non renseigné'}
        </div>
        {currentInstitution && !compact && (
          <div className="text-xs text-[#69768C] mt-0.5 truncate">
            {currentInstitution}
          </div>
        )}
      </div>

      <div className="md:pl-4 pt-2 md:pt-0">
        <div className="text-[11px] text-[#3457D5] font-semibold uppercase tracking-wide">
          3. Formation visée
        </div>
        <div className="text-sm font-bold text-[#3457D5] mt-0.5">
          {targetStudyLevel || 'Non renseigné'}
        </div>
        {studyDomain && !compact && (
          <div className="text-xs text-[#69768C] mt-0.5 truncate">
            {studyDomain}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 5. INDICATEUR DE VERDICT D'ÉLIGIBILITÉ EXPLICABLE
 */
export const EligibilityVerdictIndicator: React.FC<{
  verdict: EligibilityGlobalVerdict;
  showDescription?: boolean;
}> = ({ verdict, showDescription = false }) => {
  const configs: Record<
    EligibilityGlobalVerdict,
    {
      label: string;
      textColor: string;
      bgColor: string;
      Icon: React.ElementType;
      desc: string;
    }
  > = {
    POTENTIALLY_COMPATIBLE: {
      label: 'Potentiellement compatible',
      textColor: 'text-[#14533C]',
      bgColor: 'bg-[#DDF5EB]',
      Icon: CheckCircle2,
      desc: 'Critères obligatoires vérifiés automatiquement satisfaits.',
    },
    TO_COMPLETE: {
      label: 'À compléter',
      textColor: 'text-[#9A3412]',
      bgColor: 'bg-[#F5A17B]/25',
      Icon: Clock,
      desc: 'Une information manque dans ton profil pour conclure.',
    },
    TO_VERIFY: {
      label: 'À vérifier',
      textColor: 'text-[#3457D5]',
      bgColor: 'bg-[#3457D5]/10',
      Icon: HelpCircle,
      desc: 'Équivalence ou source à vérifier.',
    },
    INCOMPATIBLE: {
      label: 'Non compatible',
      textColor: 'text-[#B91C1C]',
      bgColor: 'bg-[#FEE2E2]',
      Icon: XCircle,
      desc: 'Un critère obligatoire ou la date limite n’est pas respecté.',
    },
  };

  const cfg = configs[verdict];
  const Icon = cfg.Icon;

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.textColor} ${cfg.bgColor} w-fit whitespace-nowrap`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{cfg.label}</span>
      </div>
      {showDescription && (
        <span className="text-xs text-[#69768C] mt-1">{cfg.desc}</span>
      )}
    </div>
  );
};

/**
 * 6. INDICATEUR DE STATUT PAR CRITÈRE INDIVIDUEL
 */
export const CriterionStatusText: React.FC<{
  status: CriterionEvaluationStatus;
}> = ({ status }) => {
  switch (status) {
    case 'SATISFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDF5EB] text-[#14533C]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Validé
        </span>
      );
    case 'MISSING_INFO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5A17B]/25 text-[#9A3412]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          À compléter
        </span>
      );
    case 'AMBIGUOUS_TO_VERIFY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3457D5]/10 text-[#3457D5]">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          À vérifier
        </span>
      );
    case 'NOT_SATISFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C]">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          Non satisfait
        </span>
      );
  }
};

/**
 * 7. INDICATEUR DE FIABILITÉ DE CURATION
 */
export const CurationReliabilityNote: React.FC<{
  status: CurationStatus;
  lastVerifiedAt: string | null;
  isDemoData?: boolean;
}> = ({ status, lastVerifiedAt }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[#69768C]">
      {status === 'VERIFIED' ? (
        <span className="inline-flex items-center gap-1 font-medium text-[#14533C]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          Offre vérifiée{lastVerifiedAt ? ` (${lastVerifiedAt})` : ''}
        </span>
      ) : status === 'PENDING_REVIEW' ? (
        <span className="inline-flex items-center gap-1 font-medium text-[#9A3412]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Vérification en cours
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-[#B91C1C]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Offre archivée
        </span>
      )}
    </div>
  );
};

/**
 * 8. MODALE ACCESSIBLE DU DESIGN SYSTEM
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#203454]/40 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white border border-[#E6ECF5] rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E6ECF5] flex items-start justify-between gap-4 bg-[#F8FAFD]">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-[#203454]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#69768C] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-1.5 text-[#69768C] hover:text-[#253047] rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 border-t border-[#E6ECF5] bg-[#F8FAFD] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 9. BANDEAU D'ÉTAT DE CONFIDENTIALITÉ (LOI CAMEROUNAISE N° 2024/017)
 */
export const PrivacyStatusNotice: React.FC<{
  visible: boolean;
  onManageClick?: () => void;
}> = ({ visible, onManageClick }) => {
  return (
    <div className="bg-white border border-[#E6ECF5] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 text-xs">
        <Lock className="w-4 h-4 text-[#3457D5] shrink-0" />
        <div>
          <span className="font-semibold text-[#253047]">
            Confidentialité du profil :{' '}
          </span>
          {visible ? (
            <span className="text-[#14533C] font-semibold">
              Visible aux organismes vérifiés
            </span>
          ) : (
            <span className="text-[#3457D5] font-semibold">
              Privé par défaut
            </span>
          )}
        </div>
      </div>
      {onManageClick && (
        <button
          type="button"
          onClick={onManageClick}
          className="text-xs font-semibold text-[#3457D5] hover:text-[#203454] cursor-pointer whitespace-nowrap"
        >
          Gérer →
        </button>
      )}
    </div>
  );
};

