import { useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import type { EventType } from '../../types/sigil.types';
import type { TemplateLang } from '../../templates';
import { getPhrasing } from '../../utils/eventPhrasing';
import '../../styles/landing.css';

interface OnboardingWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; nameEn: string; nameEs: string; icon: string }[] = [
  { type: 'WEDDING', nameEn: 'Wedding', nameEs: 'Boda', icon: '💍' },
  { type: 'BIRTHDAY', nameEn: 'Birthday', nameEs: 'Cumpleaños', icon: '🎂' },
  { type: 'CORPORATE', nameEn: 'Corporate / Gala', nameEs: 'Corporativo / Gala', icon: '🏛️' },
  { type: 'BAPTISM', nameEn: 'Baptism', nameEs: 'Bautizo', icon: '🕊️' },
  { type: 'CUSTOM', nameEn: 'Custom Gathering', nameEs: 'Otro Evento', icon: '✨' },
];

export function OnboardingWizard({ onClose, onSuccess }: OnboardingWizardProps) {
  const register = useSigilStore((s) => s.register);
  const resetToDefaults = useSigilStore((s) => s.resetToDefaults);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const saveCurrentDesign = useSigilStore((s) => s.saveCurrentDesign);
  const setAppMode = useSigilStore((s) => s.setAppMode);

  // Stepper state: 1 = Account, 2 = Celebration Type, 3 = Details
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2: Event Type & Language
  const [selectedType, setSelectedType] = useState<EventType>('WEDDING');
  const [selectedLang, setSelectedLang] = useState<TemplateLang>('ES');

  // Step 3: Celebration Details
  const [eventTitle, setEventTitle] = useState('');
  const [countdownTarget, setCountdownTarget] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });

  // ── Step 1 Handler ────────────────────────────────────────────────────────
  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setAuthError('Password must be at least 12 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await register(email.trim(), password, name.trim() || undefined);
      if (ok) {
        setStep(2);
      } else {
        setAuthError('Registration could not be completed. Check credentials or try logging in.');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3 Final Submission ───────────────────────────────────────────────
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Reset store to chosen template & language
      resetToDefaults(selectedType, selectedLang);

      // 2. Resolve default title if empty
      const phrasing = getPhrasing(selectedType, selectedLang);
      const finalTitle = eventTitle.trim() || phrasing.typeLabel;

      // 3. Update title and countdown
      const newCanvasId = crypto.randomUUID();
      updateDesign({
        id: newCanvasId,
        title: finalTitle,
        countdownTarget: countdownTarget ? new Date(countdownTarget).toISOString() : new Date().toISOString(),
        language: selectedLang,
      });

      // 4. Save to backend database
      await saveCurrentDesign();

      // 5. Navigate to Studio
      setAppMode('CREATOR');
      onSuccess();
    } catch (err) {
      console.error('Failed to initialize first canvas:', err);
      // Even if remote save has an issue, enter creator canvas
      setAppMode('CREATOR');
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-overlay" onClick={onClose}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="onboarding-close-btn"
          onClick={onClose}
          aria-label="Close wizard"
        >
          &times;
        </button>

        {/* Stepper Indicators */}
        <div className="onboarding-stepper" aria-label="Step progress">
          <div className={`onboarding-step-dot ${step >= 1 ? 'onboarding-step-dot--active' : ''}`} />
          <div className={`onboarding-step-dot ${step >= 2 ? 'onboarding-step-dot--active' : ''}`} />
          <div className={`onboarding-step-dot ${step >= 3 ? 'onboarding-step-dot--active' : ''}`} />
        </div>

        {/* ── Step 1: Create Host Account ──────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="onboarding-header">
              <h2 className="onboarding-title">Create Host Account</h2>
              <p className="onboarding-subtitle">Step 1 of 3 · Set up your workspace to save designs</p>
            </div>

            {authError && (
              <div className="auth-error">
                {authError}
              </div>
            )}

            <form onSubmit={handleAccountSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-name">Full Name</label>
                <input
                  id="ob-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-email">Email Address</label>
                <input
                  id="ob-email"
                  type="email"
                  className="auth-input"
                  placeholder="host@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-password">Password</label>
                <input
                  id="ob-password"
                  type="password"
                  className="auth-input"
                  placeholder="Min. 12 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-confirm-password">Confirm Password</label>
                <input
                  id="ob-confirm-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Continue to Event Setup →'}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Choose Celebration Type & Language ─────────────────────── */}
        {step === 2 && (
          <div>
            <div className="onboarding-header">
              <h2 className="onboarding-title">What are you celebrating?</h2>
              <p className="onboarding-subtitle">Step 2 of 3 · Select a base invitation template</p>
            </div>

            <div className="onboarding-type-grid">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <div
                  key={opt.type}
                  className={`onboarding-type-card ${selectedType === opt.type ? 'onboarding-type-card--selected' : ''}`}
                  onClick={() => setSelectedType(opt.type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedType(opt.type);
                    }
                  }}
                >
                  <div className="onboarding-type-icon">{opt.icon}</div>
                  <div className="onboarding-type-name">
                    {selectedLang === 'ES' ? opt.nameEs : opt.nameEn}
                  </div>
                </div>
              ))}
            </div>

            {/* Language Selector */}
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: '#a08e7c', marginRight: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Invitation Language:
              </span>
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  style={{
                    padding: '4px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedLang === 'ES' ? '#dfb88e' : 'transparent',
                    color: selectedLang === 'ES' ? '#111' : '#a08e7c',
                    fontFamily: 'inherit',
                  }}
                  onClick={() => setSelectedLang('ES')}
                >
                  Español
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedLang === 'EN' ? '#dfb88e' : 'transparent',
                    color: selectedLang === 'EN' ? '#111' : '#a08e7c',
                    fontFamily: 'inherit',
                  }}
                  onClick={() => setSelectedLang('EN')}
                >
                  English
                </button>
              </div>
            </div>

            <div className="onboarding-actions">
              <button
                type="button"
                className="landing-btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="auth-button"
                style={{ flex: 2, margin: 0 }}
                onClick={() => setStep(3)}
              >
                Next Details →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Event Essentials ──────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="onboarding-header">
              <h2 className="onboarding-title">Celebration Essentials</h2>
              <p className="onboarding-subtitle">Step 3 of 3 · Personalize your title and target date</p>
            </div>

            <form onSubmit={handleFinalSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-title">
                  Event Title or Honorees
                </label>
                <input
                  id="ob-title"
                  type="text"
                  className="auth-input"
                  placeholder={
                    selectedType === 'WEDDING'
                      ? 'e.g. Elena & Marcus'
                      : selectedType === 'BIRTHDAY'
                      ? "e.g. Mateo's 30th Birthday"
                      : 'e.g. Annual Technology Summit'
                  }
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="ob-date">
                  Celebration Date
                </label>
                <input
                  id="ob-date"
                  type="date"
                  className="auth-input"
                  value={countdownTarget}
                  onChange={(e) => setCountdownTarget(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="onboarding-actions">
                <button
                  type="button"
                  className="landing-btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="auth-button"
                  style={{ flex: 2, margin: 0 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Preparing Studio...' : 'Launch Studio & Customize ✦'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
