import React, { useState, useEffect } from 'react';
import { useSigil } from '../../context/SigilContext';
import { getTranslation } from '../../utils/i18n';

export function RecipientRsvpPanel() {
  const { state, submitRsvp } = useSigil();
  const { design, guest } = state;
  const t = getTranslation(design.language);
  const config = design.rsvpFormConfig || {
    requireMealPreference: false,
    requireDietaryRestrictions: false,
    allowPlusOnes: false,
    customNotesLabel: null,
  };

  const [rsvpStatus, setRsvpStatus] = useState<'YES' | 'NO' | null>(null);
  const [mealPref, setMealPref] = useState('');
  const [dietary, setDietary] = useState('');
  const [plusOne, setPlusOne] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [selectedDependents, setSelectedDependents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (guest.dependents) {
      const initial: Record<string, boolean> = {};
      guest.dependents.forEach((dep) => {
        initial[dep.id] = dep.included;
      });
      setSelectedDependents(initial);
    }
  }, [guest.dependents]);

  const handleDependentToggle = (id: string) => {
    setSelectedDependents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpStatus) return;

    const updatedDependents = guest.dependents
      ? guest.dependents.map((dep) => ({
          ...dep,
          included: !!selectedDependents[dep.id],
        }))
      : [];

    submitRsvp({
      tokenOrId: guest.routingToken,
      status: rsvpStatus === 'YES' ? 'RSVP_YES' : 'RSVP_NO',
      mealPref: rsvpStatus === 'YES' ? mealPref : undefined,
      dietary: rsvpStatus === 'YES' ? dietary : undefined,
      plusOne: rsvpStatus === 'YES' ? plusOne : undefined,
      notes: rsvpStatus === 'YES' ? notes : undefined,
      dependents: updatedDependents,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <aside className="left-panel" style={{ padding: '2rem', color: 'var(--rsvp-input-color, #ffffff)', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
          {t.thankYou}
        </h2>
        <p style={{ color: 'var(--rsvp-text-secondary, rgba(255, 255, 255, 0.7))', fontSize: '0.9rem' }}>
          {t.responseRecorded}
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '12px',
          borderRadius: '6px',
          background: rsvpStatus === 'YES' ? 'rgba(40, 199, 111, 0.15)' : 'rgba(234, 84, 85, 0.15)',
          border: `1px solid ${rsvpStatus === 'YES' ? '#28c76f' : '#ea5455'}`,
          width: '100%',
        }}>
          <strong>RSVP: {rsvpStatus === 'YES' ? t.attendingStatus : t.notAttendingStatus}</strong>
          {rsvpStatus === 'YES' && (
            <div style={{ textAlign: 'left', marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {config.requireMealPreference && mealPref && <div>🍽️ {t.mealLabel}: {mealPref}</div>}
              {config.requireDietaryRestrictions && dietary && <div>⚠️ {t.dietaryLabel}: {dietary}</div>}
              {config.allowPlusOnes && plusOne && <div>👥 {t.guestLabel}: {plusOne}</div>}
              {guest.dependents && guest.dependents.length > 0 && (
                <div>
                  👥 {t.familyAttendingLabel}: {guest.dependents.filter((d) => selectedDependents[d.id]).map((d) => d.name).join(', ') || t.noneText}
                </div>
              )}
              {config.customNotesLabel && notes && <div>📝 {t.noteLabel}: {notes}</div>}
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="left-panel" style={{ overflowY: 'auto' }}>
      <div className="lp-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="lp-header">
          <h1 className="lp-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--rsvp-input-color, #ffffff)' }}>
            {t.rsvpTitle}
          </h1>
          <p style={{ color: 'var(--rsvp-text-secondary, rgba(255, 255, 255, 0.5))', fontSize: '0.8rem' }}>
            For: {guest.guestName}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="lp-field">
            <span className="lp-field-label">{t.willAttend}</span>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                id="rsvp-yes-btn"
                onClick={() => setRsvpStatus('YES')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: rsvpStatus === 'YES' ? '#28c76f' : 'var(--rsvp-btn-border, rgba(255,255,255,0.1))',
                  background: rsvpStatus === 'YES' ? 'var(--rsvp-btn-yes-bg, rgba(40,199,111,0.2))' : 'var(--rsvp-btn-bg, rgba(255,255,255,0.02))',
                  color: rsvpStatus === 'YES' ? '#28c76f' : 'var(--rsvp-btn-color, rgba(255,255,255,0.7))',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {t.yesGladly}
              </button>
              <button
                type="button"
                id="rsvp-no-btn"
                onClick={() => setRsvpStatus('NO')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: rsvpStatus === 'NO' ? '#ea5455' : 'var(--rsvp-btn-border, rgba(255,255,255,0.1))',
                  background: rsvpStatus === 'NO' ? 'var(--rsvp-btn-no-bg, rgba(234,84,85,0.2))' : 'var(--rsvp-btn-bg, rgba(255,255,255,0.02))',
                  color: rsvpStatus === 'NO' ? '#ea5455' : 'var(--rsvp-btn-color, rgba(255,255,255,0.7))',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {t.noRegrettably}
              </button>
            </div>
          </div>

          {rsvpStatus === 'YES' && (
            <>
              {config.requireMealPreference && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="meal-preference">
                    {t.mealPreference}
                  </label>
                  <select
                    id="meal-preference"
                    value={mealPref}
                    onChange={(e) => setMealPref(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--rsvp-input-bg, rgba(255,255,255,0.05))',
                      border: '1px solid var(--rsvp-input-border, rgba(255,255,255,0.15))',
                      color: 'var(--rsvp-input-color, #ffffff)',
                      padding: '8px',
                      borderRadius: '4px',
                      outline: 'none',
                    }}
                  >
                    <option value="" disabled style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>{t.chooseMeal}</option>
                    <option value="Beef" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>{t.beefMeal}</option>
                    <option value="Fish" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>{t.salmonMeal}</option>
                    <option value="Vegetarian" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>{t.vegMeal}</option>
                  </select>
                </div>
              )}

              {config.requireDietaryRestrictions && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="dietary-restrictions">
                    {t.dietaryRestrictions}
                  </label>
                  <input
                    id="dietary-restrictions"
                    className="lp-input"
                    type="text"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder={t.dietaryPlaceholder}
                    autoComplete="off"
                    required
                  />
                </div>
              )}

              {config.allowPlusOnes && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="plus-one-name">
                    {t.plusOneName}
                  </label>
                  <input
                    id="plus-one-name"
                    className="lp-input"
                    type="text"
                    value={plusOne}
                    onChange={(e) => setPlusOne(e.target.value)}
                    placeholder={t.plusOnePlaceholder}
                    autoComplete="off"
                    required
                  />
                </div>
              )}

              {/* Dependents list checkboxes */}
              {guest.dependents && guest.dependents.length > 0 && (
                <div className="lp-field">
                  <span className="lp-field-label">{t.familyGuests}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.6rem' }}>
                    {guest.dependents.map((dep) => (
                      <label
                        key={dep.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          fontSize: '0.85rem',
                          color: 'var(--rsvp-input-color, #ffffff)',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedDependents[dep.id]}
                          onChange={() => handleDependentToggle(dep.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: 'var(--status-rsvp-yes)'
                          }}
                        />
                        {dep.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {config.customNotesLabel && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="custom-notes-input">
                    {config.customNotesLabel}
                  </label>
                  <input
                    id="custom-notes-input"
                    className="lp-input"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.customNotesPlaceholder}
                    autoComplete="off"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            id="rsvp-submit-btn"
            disabled={!rsvpStatus}
            style={{
              padding: '12px',
              background: rsvpStatus ? 'var(--rsvp-submit-active-bg, var(--status-pending))' : 'var(--rsvp-submit-inactive-bg, rgba(255,255,255,0.05))',
              border: 'none',
              borderRadius: '4px',
              color: rsvpStatus ? 'var(--rsvp-submit-active-color, #ffffff)' : 'var(--rsvp-submit-inactive-color, rgba(255,255,255,0.3))',
              cursor: rsvpStatus ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              marginTop: '1rem',
              transition: 'background 0.2s',
            }}
          >
            {t.submitRsvp}
          </button>
        </form>
      </div>
    </aside>
  );
}
