import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authApiService } from '../../api/services/scholarfindServices';
import {
  evaluatePasswordStrength,
  PasswordStrengthReport,
  resolveDefaultWorkspacePathForRole,
} from './authAndPartnerLogic';

/**
 * En-tête minimaliste réutilisable pour les écrans d'authentification
 */
const AuthBrandHeader: React.FC = () => (
  <div className="mb-6 flex items-center justify-between">
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 text-[#203454] hover:opacity-90 transition-opacity"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3457D5] text-white shadow-sm">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div>
        <span className="text-lg font-extrabold tracking-tight text-[#203454]">
          SCHOLAR<span className="text-[#3457D5]">FIND</span>
        </span>
        <span className="block text-[11px] font-medium text-[#5A6E8C]">
          Bourses d’études & Orientation académique
        </span>
      </div>
    </Link>
    <Link
      to="/catalogue"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F4] bg-white px-3 py-1.5 text-xs font-semibold text-[#5A6E8C] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Catalogue public
    </Link>
  </div>
);

/**
 * Composant réutilisable d'indicateur de robustesse du mot de passe
 */
export const PasswordStrengthIndicator: React.FC<{
  report: PasswordStrengthReport;
}> = ({ report }) => {
  if (report.level === 'EMPTY') return null;

  const barColors: Record<number, string> = {
    1: 'bg-[#C93B3B]',
    2: 'bg-[#E58A3B]',
    3: 'bg-[#3457D5]',
    4: 'bg-[#1F8A5C]',
  };

  const textColors: Record<number, string> = {
    1: 'text-[#C93B3B]',
    2: 'text-[#B25E12]',
    3: 'text-[#3457D5]',
    4: 'text-[#1F8A5C]',
  };

  const activeColor = barColors[report.score] || 'bg-[#E2E8F4]';

  return (
    <div
      className="mt-2.5 rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] p-3"
      data-testid="password-strength-indicator"
    >
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-[#5A6E8C]">
          Robustesse du mot de passe :
        </span>
        <span className={`font-bold ${textColors[report.score] || 'text-[#5A6E8C]'}`}>
          {report.label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-2.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-colors ${
              report.score >= step ? activeColor : 'bg-[#E2E8F4]'
            }`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#5A6E8C]">
        <li className="flex items-center gap-1.5">
          <CheckCircle2
            className={`h-3.5 w-3.5 shrink-0 ${
              report.hasMinLength ? 'text-[#1F8A5C]' : 'text-[#C5D1E5]'
            }`}
          />
          <span className={report.hasMinLength ? 'text-[#203454] font-medium' : ''}>
            8 caractères minimum
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2
            className={`h-3.5 w-3.5 shrink-0 ${
              report.hasUpperAndLower ? 'text-[#1F8A5C]' : 'text-[#C5D1E5]'
            }`}
          />
          <span className={report.hasUpperAndLower ? 'text-[#203454] font-medium' : ''}>
            Majuscules et minuscules
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2
            className={`h-3.5 w-3.5 shrink-0 ${
              report.hasNumber ? 'text-[#1F8A5C]' : 'text-[#C5D1E5]'
            }`}
          />
          <span className={report.hasNumber ? 'text-[#203454] font-medium' : ''}>
            Au moins un chiffre
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2
            className={`h-3.5 w-3.5 shrink-0 ${
              report.hasSpecialChar ? 'text-[#1F8A5C]' : 'text-[#C5D1E5]'
            }`}
          />
          <span className={report.hasSpecialChar ? 'text-[#203454] font-medium' : ''}>
            Caractère spécial (!@#$...)
          </span>
        </li>
      </ul>
    </div>
  );
};

// ============================================================================
// 1. INTERFACE DE CONNEXION (/connexion)
// ============================================================================
export const LoginPage: React.FC = () => {
  const { users, authenticateUser, switchDemoUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('amina.ndongo@etudiant-demo.cm');
  const [password, setPassword] = useState('Scholar2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateFields = () => {
    const errs: { email?: string; password?: string } = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errs.email = 'Veuillez saisir votre adresse email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Le format de l’adresse email est invalide.';
    }

    if (!password) {
      errs.password = 'Veuillez saisir votre mot de passe.';
    } else if (password.length < 4) {
      errs.password = 'Le mot de passe est trop court.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validateFields()) return;

    setIsSubmitting(true);
    try {
      await authApiService
        .loginUser({ email: email.trim(), password })
        .catch(() => null);
      const res = await authenticateUser(email, password, rememberMe);
      if (!res.success || !res.user) {
        setErrorMsg(
          res.error ||
            'Impossible de vous authentifier. Vérifiez vos identifiants.'
        );
        setIsSubmitting(false);
        return;
      }

      // Redirection automatique basée exclusivement sur les permissions retournées
      const destination = resolveDefaultWorkspacePathForRole(res.user.role);
      navigate(destination);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSelect = (targetUserId: string) => {
    const user = users.find((u) => u.id === targetUserId);
    if (!user) return;
    setEmail(user.email);
    setPassword('Scholar2026!');
    setErrorMsg(null);
    setFieldErrors({});
  };

  const handleDirectDemoOpen = (targetUserId: string) => {
    const user = users.find((u) => u.id === targetUserId);
    if (!user) return;
    switchDemoUser(user.id);
    navigate(resolveDefaultWorkspacePathForRole(user.role));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <AuthBrandHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulaire de connexion principal */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F4] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EBF0FF] px-2.5 py-1 text-xs font-bold text-[#3457D5]">
              <Lock className="h-3.5 w-3.5" /> Authentification unifiée
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold text-[#203454]">
              Connexion à votre compte SCHOLARFIND
            </h1>
            <p className="mt-1 text-sm text-[#5A6E8C]">
              Saisissez vos identifiants. Votre espace de travail est déterminé automatiquement selon les permissions de votre compte.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3.5 text-xs text-[#9E2A2A]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Échec de connexion</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-[#203454] mb-1.5"
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="nom.prenom@universite.cm"
                  className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:bg-white focus:outline-none ${
                    fieldErrors.email
                      ? 'border-[#C93B3B] bg-[#FFF8F8]'
                      : 'border-[#E2E8F4] bg-[#F8FAFD] focus:border-[#3457D5]'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs font-medium text-[#C93B3B]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-[#203454]"
                >
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-[#3457D5] hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Votre mot de passe"
                  className={`w-full rounded-xl border pl-10 pr-11 py-2.5 text-sm text-[#203454] focus:bg-white focus:outline-none ${
                    fieldErrors.password
                      ? 'border-[#C93B3B] bg-[#FFF8F8]'
                      : 'border-[#E2E8F4] bg-[#F8FAFD] focus:border-[#3457D5]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#5A6E8C] hover:bg-[#EBF0FF] hover:text-[#3457D5] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs font-medium text-[#C93B3B]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#203454]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C5D1E5] text-[#3457D5] focus:ring-[#3457D5]"
                />
                Se souvenir de moi sur cet appareil
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Vérification des permissions...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#E2E8F4] pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-[#5A6E8C]">
              Vous n’avez pas encore de compte sur SCHOLARFIND ?
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#3457D5] bg-[#EBF0FF]/60 px-4 py-2 text-xs font-bold text-[#3457D5] hover:bg-[#3457D5] hover:text-white transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Créer un compte étudiant gratuit
            </Link>
          </div>
        </div>

        {/* Panneau d'information gouvernance & comptes de démonstration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#E2E8F4] bg-[#F8FAFD] p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#203454] mb-2">
              <ShieldCheck className="h-4 w-4 text-[#1F8A5C]" />
              Redirection pilotée par vos permissions
            </div>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              Aucun choix de rôle n’est demandé avant la connexion. Le backend identifie automatiquement votre profil (Étudiant, Organisme partenaire vérifié, Curateur ou Administrateur) et ouvre l’espace autorisé.
            </p>
            <div className="mt-3 rounded-xl border border-[#DCE6F7] bg-white p-3 text-[11px] text-[#5A6E8C]">
              <span className="font-bold text-[#203454] block mb-0.5">
                Vous représentez un organisme financeur ?
              </span>
              Créez d’abord un compte personnel ou connectez-vous, puis déposez une demande dans la rubrique{' '}
              <span className="font-semibold text-[#3457D5]">
                « Devenir un organisme partenaire »
              </span>{' '}
              de votre profil.
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#203454]">
                Comptes de démonstration préconfigurés
              </h2>
              <span className="rounded bg-[#EBF0FF] px-2 py-0.5 text-[10px] font-bold text-[#3457D5]">
                Sandbox
              </span>
            </div>
            <p className="text-[11px] text-[#5A6E8C] mb-3">
              Sélectionnez un compte pour pré-remplir le formulaire ou accéder directement à l’espace correspondant :
            </p>
            <div className="space-y-2">
              {[
                {
                  id: 'usr-stu-1',
                  badge: 'Étudiant (Profil complet)',
                  desc: 'Amina Ndam — Licence Informatique (15,4/20)',
                },
                {
                  id: 'usr-stu-2',
                  badge: 'Étudiant (Demande partenaire en cours)',
                  desc: 'Samuel Eto’o Ndi — Dossier Fondation Horizon',
                },
                {
                  id: 'usr-org-1',
                  badge: 'Organisme partenaire vérifié',
                  desc: 'Fondation Excellence Sciences Afrique',
                },
                {
                  id: 'usr-cur-1',
                  badge: 'Curateur documentaire',
                  desc: 'Dr. Hélène Mvondo — Vérification des sources',
                },
                {
                  id: 'usr-adm-1',
                  badge: 'Administrateur plateforme',
                  desc: 'Jean-Paul Mbarga — Gouvernance & Validation organismes',
                },
              ].map((item) => {
                const u = users.find((acc) => acc.id === item.id);
                if (!u) return null;
                const isSelected = email.trim().toLowerCase() === u.email.toLowerCase();
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-[#3457D5] bg-[#EBF0FF]/40'
                        : 'border-[#E2E8F4] bg-[#F8FAFD] hover:border-[#C5D1E5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-[#3457D5]">
                          {item.badge}
                        </span>
                        <p className="truncate text-xs font-bold text-[#203454]">
                          {item.desc}
                        </p>
                        <p className="truncate text-[11px] text-[#5A6E8C]">
                          {u.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickDemoSelect(item.id)}
                          className="rounded-lg border border-[#DCE6F7] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#203454] hover:border-[#3457D5] hover:text-[#3457D5]"
                        >
                          Pré-remplir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectDemoOpen(item.id)}
                          className="rounded-lg bg-[#203454] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#3457D5]"
                        >
                          Ouvrir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. INTERFACE D'INSCRIPTION PUBLIQUE UNIQUE (/inscription)
// ============================================================================
export const RegisterPage: React.FC = () => {
  const { registerPublicStudentAccount, verifyCurrentStudentEmail } = useApp();
  const navigate = useNavigate();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationStepEmail, setVerificationStepEmail] = useState<string | null>(
    null
  );
  const [resendConfirmation, setResendConfirmation] = useState(false);

  const strengthReport = evaluatePasswordStrength(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!lastName.trim() || !firstName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et votre prénom.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!strengthReport.isAcceptable) {
      setErrorMsg(
        'Votre mot de passe doit contenir au moins 8 caractères et combiner lettres, chiffres ou caractères spéciaux.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMsg(
        'Vous devez accepter les conditions générales d’utilisation et la politique de confidentialité.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await authApiService
        .registerPublicStudent({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        })
        .catch(() => null);

      const res = await registerPublicStudentAccount({
        firstName,
        lastName,
        email,
        password,
        acceptedTerms,
        acceptedPrivacy,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Impossible de finaliser l’inscription.');
        return;
      }

      // Afficher l'écran de vérification de l'adresse email
      setVerificationStepEmail(email.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEmailVerification = (redirectToPartnerRequest = false) => {
    verifyCurrentStudentEmail();
    navigate(
      redirectToPartnerRequest
        ? '/etudiant/devenir-partenaire'
        : '/etudiant/tableau-de-bord'
    );
  };

  // Écran de vérification de l'adresse email après inscription
  if (verificationStepEmail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <AuthBrandHeader />
        <div
          className="rounded-2xl border border-[#E2E8F4] bg-white p-6 sm:p-8 shadow-sm"
          data-testid="email-verification-screen"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF5EB] text-[#1F8A5C] mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EBF0FF] px-2.5 py-1 text-xs font-bold text-[#3457D5]">
            Vérification de votre adresse email
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold text-[#203454]">
            Confirmez votre adresse email
          </h1>
          <p className="mt-2 text-sm text-[#5A6E8C] leading-relaxed">
            Votre compte personnel a été créé avec le rôle{' '}
            <span className="font-bold text-[#203454]">STUDENT (Étudiant)</span>. Un
            email contenant un lien de confirmation a été envoyé à{' '}
            <span className="font-bold text-[#203454]">{verificationStepEmail}</span>.
          </p>

          <div className="mt-5 rounded-xl border border-[#DCE6F7] bg-[#F8FAFD] p-4 text-xs text-[#5A6E8C] space-y-2">
            <p className="font-bold text-[#203454]">
              Environnement de démonstration SCHOLARFIND :
            </p>
            <p>
              Lorsque le backend Java Spring Boot prend en charge la vérification par jeton SMTP, le clic sur le lien reçu active définitivement l’adresse email. Vous pouvez valider cette étape immédiatement ci-dessous :
            </p>
          </div>

          {resendConfirmation && (
            <div className="mt-4 rounded-xl border border-[#B8E6D4] bg-[#DDF5EB]/60 p-3 text-xs font-semibold text-[#156341]">
              Un nouveau lien de vérification a été envoyé à {verificationStepEmail}.
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleConfirmEmailVerification(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Valider mon email et accéder à mon espace
            </button>
            <button
              type="button"
              onClick={() => handleConfirmEmailVerification(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F4] bg-white px-4 py-3 text-xs font-bold text-[#203454] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#3457D5]" />
              Soumettre une demande organisme partenaire
            </button>
          </div>

          <div className="mt-5 border-t border-[#E2E8F4] pt-4 flex items-center justify-between text-xs text-[#5A6E8C]">
            <span>Vous n’avez pas reçu l’email ?</span>
            <button
              type="button"
              onClick={() => setResendConfirmation(true)}
              className="inline-flex items-center gap-1.5 font-bold text-[#3457D5] hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Renvoyer l’email de vérification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <AuthBrandHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulaire d'inscription publique unique */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F4] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#DDF5EB] px-2.5 py-1 text-xs font-bold text-[#156341]">
              <UserCheck className="h-3.5 w-3.5" /> Inscription publique unique — 100 % Gratuit
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold text-[#203454]">
              Créer votre compte SCHOLARFIND
            </h1>
            <p className="mt-1 text-sm text-[#5A6E8C]">
              Rejoignez SCHOLARFIND pour explorer les bourses vérifiées, évaluer votre éligibilité et suivre vos candidatures.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3.5 text-xs text-[#9E2A2A]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Vérifiez votre saisie</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-lastname"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Nom *
                </label>
                <input
                  id="reg-lastname"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Ndam"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-firstname"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Prénom *
                </label>
                <input
                  id="reg-firstname"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Amina"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold text-[#203454] mb-1.5"
              >
                Adresse email *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@universite.cm"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold text-[#203454] mb-1.5"
              >
                Mot de passe *
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-11 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#5A6E8C] hover:bg-[#EBF0FF] hover:text-[#3457D5]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <PasswordStrengthIndicator report={strengthReport} />
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs font-bold text-[#203454] mb-1.5"
              >
                Confirmation du mot de passe *
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ressaisissez votre mot de passe"
                  className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:bg-white focus:outline-none ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-[#C93B3B] bg-[#FFF8F8]'
                      : 'border-[#E2E8F4] bg-[#F8FAFD] focus:border-[#3457D5]'
                  }`}
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1 text-xs font-medium text-[#C93B3B]">
                  Les deux mots de passe ne correspondent pas.
                </p>
              )}
            </div>

            <div className="space-y-2.5 rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#203454]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#C5D1E5] text-[#3457D5] focus:ring-[#3457D5]"
                />
                <span>
                  J’accepte les{' '}
                  <span className="font-bold text-[#3457D5]">
                    conditions générales d’utilisation
                  </span>{' '}
                  de la plateforme SCHOLARFIND. *
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#203454]">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#C5D1E5] text-[#3457D5] focus:ring-[#3457D5]"
                />
                <span>
                  J’accepte la{' '}
                  <span className="font-bold text-[#3457D5]">
                    politique de confidentialité
                  </span>{' '}
                  (mon profil académique est créé en mode strictement privé par défaut, conformément à la Loi n° 2024/017). *
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création du compte en cours...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#E2E8F4] pt-5 flex items-center justify-between">
            <span className="text-xs text-[#5A6E8C]">
              Vous possédez déjà un compte ?
            </span>
            <Link
              to="/connexion"
              className="text-xs font-bold text-[#3457D5] hover:underline"
            >
              Se connecter →
            </Link>
          </div>
        </div>

        {/* Encadré de gouvernance des rôles et procédure Organisme Partenaire */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#E2E8F4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#203454] mb-2">
              <ShieldCheck className="h-4 w-4 text-[#3457D5]" />
              Règles de sécurité & Attribution des rôles
            </div>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              Tous les comptes créés via le formulaire public reçoivent exclusivement le rôle{' '}
              <span className="font-bold text-[#203454]">STUDENT</span> par le backend. Vous pourrez compléter votre parcours académique (diplôme obtenu, niveau actuel, niveau visé) à votre rythme depuis votre profil.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#5A6E8C]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1F8A5C] shrink-0 mt-0.5" />
                <span>
                  Accès 100 % gratuit à la recherche, aux recommandations et au moteur d’éligibilité.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1F8A5C] shrink-0 mt-0.5" />
                <span>
                  Aucune inscription publique directe n’est autorisée pour les rôles{' '}
                  <code className="font-mono text-[11px] text-[#203454]">ORGANIZATION</code>,{' '}
                  <code className="font-mono text-[11px] text-[#203454]">CURATOR</code> ou{' '}
                  <code className="font-mono text-[11px] text-[#203454]">ADMIN</code>.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#DCE6F7] bg-[#F8FAFD] p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#203454] mb-2">
              <Building2 className="h-4 w-4 text-[#3457D5]" />
              Devenir un organisme partenaire
            </div>
            <p className="text-xs text-[#5A6E8C] leading-relaxed">
              Les universités, fondations, entreprises, ONG et institutions publiques qui souhaitent publier des bourses ou présélectionner des candidats doivent :
            </p>
            <ol className="mt-2.5 space-y-1.5 text-xs text-[#203454] font-medium list-decimal list-inside">
              <li>Créer leur compte personnel ci-contre.</li>
              <li>
                Ouvrir la section{' '}
                <span className="font-bold text-[#3457D5]">
                  « Devenir un organisme partenaire »
                </span>{' '}
                dans leur profil.
              </li>
              <li>
                Soumettre les justificatifs légaux pour validation par un administrateur SCHOLARFIND.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. RÉCUPÉRATION DU MOT DE PASSE (/mot-de-passe-oublie & /reinitialiser-mot-de-passe)
// ============================================================================
export const ForgotPasswordPage: React.FC<{
  initialStep?: 'REQUEST' | 'RESET';
}> = ({ initialStep = 'REQUEST' }) => {
  const [searchParams] = useSearchParams();
  const hasTokenInUrl = Boolean(searchParams.get('token'));

  const [step, setStep] = useState<
    'REQUEST_FORM' | 'LINK_SENT' | 'NEW_PASSWORD_FORM' | 'RESET_CONFIRMED'
  >(initialStep === 'RESET' || hasTokenInUrl ? 'NEW_PASSWORD_FORM' : 'REQUEST_FORM');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const strengthReport = evaluatePasswordStrength(newPassword);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Veuillez saisir une adresse email au format valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApiService.requestPasswordReset(cleanEmail).catch(() => null);
      // Sécurité : toujours afficher l'écran générique sans révéler si l'email existe
      setStep('LINK_SENT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!strengthReport.isAcceptable) {
      setErrorMsg(
        'Veuillez choisir un mot de passe d’au moins 8 caractères respectant les critères de robustesse.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = searchParams.get('token') || 'demo-reset-token-2026';
      await authApiService.resetPassword(token, newPassword).catch(() => null);
      setStep('RESET_CONFIRMED');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <AuthBrandHeader />

      <div className="rounded-2xl border border-[#E2E8F4] bg-white p-6 sm:p-8 shadow-sm">
        {/* ÉTAPE 1 : Demande de réinitialisation */}
        {step === 'REQUEST_FORM' && (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EBF0FF] px-2.5 py-1 text-xs font-bold text-[#3457D5]">
              <KeyRound className="h-3.5 w-3.5" /> Récupération de compte
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold text-[#203454]">
              Mot de passe oublié ?
            </h1>
            <p className="mt-1 text-sm text-[#5A6E8C]">
              Saisissez l’adresse email associée à votre compte pour recevoir un lien sécurisé de réinitialisation.
            </p>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3 text-xs text-[#9E2A2A]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestSubmit} noValidate className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@universite.cm"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi de la demande...
                  </>
                ) : (
                  <>
                    Envoyer le lien de réinitialisation
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-[#E2E8F4] pt-4 flex items-center justify-between text-xs">
              <Link
                to="/connexion"
                className="inline-flex items-center gap-1.5 font-bold text-[#5A6E8C] hover:text-[#203454]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>
              <Link
                to="/inscription"
                className="font-bold text-[#3457D5] hover:underline"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Confirmation de l'envoi du lien (anti-énumération) */}
        {step === 'LINK_SENT' && (
          <div data-testid="password-reset-link-sent">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF5EB] text-[#1F8A5C] mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#203454]">
              Demande de réinitialisation prise en compte
            </h1>
            <p className="mt-2 text-sm text-[#5A6E8C] leading-relaxed">
              Si un compte SCHOLARFIND correspond à l’adresse saisie, un email contenant un lien temporaire de réinitialisation vient d’être envoyé.
            </p>
            <div className="mt-4 rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] p-3.5 text-xs text-[#5A6E8C]">
              <span className="font-bold text-[#203454] block mb-1">
                Protection de la confidentialité :
              </span>
              Conformément aux bonnes pratiques de sécurité et au contrat OpenAPI 1.1 (
              <code className="font-mono text-[11px]">POST /auth/password/forgot</code>), cette page ne divulgue jamais publiquement si une adresse email est enregistrée ou non.
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => setStep('NEW_PASSWORD_FORM')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#2845B5] transition-colors"
              >
                <KeyRound className="h-4 w-4" />
                Saisir un nouveau mot de passe (ouvrir le lien de réinitialisation)
              </button>
              <Link
                to="/connexion"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F4] bg-white px-4 py-2.5 text-xs font-bold text-[#5A6E8C] hover:text-[#203454]"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Saisie d'un nouveau mot de passe */}
        {step === 'NEW_PASSWORD_FORM' && (
          <div data-testid="new-password-form">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EBF0FF] px-2.5 py-1 text-xs font-bold text-[#3457D5]">
              <Lock className="h-3.5 w-3.5" /> Nouveau mot de passe
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold text-[#203454]">
              Définir votre nouveau mot de passe
            </h1>
            <p className="mt-1 text-sm text-[#5A6E8C]">
              Choisissez un mot de passe robuste que vous n’avez pas utilisé précédemment.
            </p>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-[#F5C2C2] bg-[#FCE8E8] p-3 text-xs text-[#9E2A2A]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={handleResetPasswordSubmit}
              noValidate
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="reset-new-password"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6E8C]" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] pl-10 pr-11 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#5A6E8C] hover:bg-[#EBF0FF] hover:text-[#3457D5]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator report={strengthReport} />
              </div>

              <div>
                <label
                  htmlFor="reset-confirm-password"
                  className="block text-xs font-bold text-[#203454] mb-1.5"
                >
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ressaisissez le nouveau mot de passe"
                  className="w-full rounded-xl border border-[#E2E8F4] bg-[#F8FAFD] px-3.5 py-2.5 text-sm text-[#203454] focus:border-[#3457D5] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour du mot de passe...
                  </>
                ) : (
                  <>
                    Enregistrer le nouveau mot de passe
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ÉTAPE 4 : Confirmation de la réinitialisation */}
        {step === 'RESET_CONFIRMED' && (
          <div data-testid="password-reset-confirmed">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF5EB] text-[#1F8A5C] mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#203454]">
              Mot de passe réinitialisé avec succès
            </h1>
            <p className="mt-2 text-sm text-[#5A6E8C] leading-relaxed">
              Votre nouveau mot de passe a été pris en compte. Vous pouvez maintenant vous connecter à votre compte SCHOLARFIND.
            </p>
            <div className="mt-6">
              <Link
                to="/connexion"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3457D5] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#2845B5] transition-colors"
              >
                Se connecter avec mon nouveau mot de passe
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
