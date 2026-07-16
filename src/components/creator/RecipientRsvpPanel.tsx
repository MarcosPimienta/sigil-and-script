import React, { useState } from 'react';
import { useSigil } from '../../context/SigilContext';

export function RecipientRsvpPanel() {
  const { state } = useSigil();
  const { design, guest } = state;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpStatus) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <aside className="left-panel" style={{ padding: '2rem', color: 'var(--rsvp-input-color, #ffffff)', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
          Thank You!
        </h2>
        <p style={{ color: 'var(--rsvp-text-secondary, rgba(255, 255, 255, 0.7))', fontSize: '0.9rem' }}>
          Your response has been recorded successfully.
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '12px',
          borderRadius: '6px',
          background: rsvpStatus === 'YES' ? 'rgba(40, 199, 111, 0.15)' : 'rgba(234, 84, 85, 0.15)',
          border: `1px solid ${rsvpStatus === 'YES' ? '#28c76f' : '#ea5455'}`,
          width: '100%',
        }}>
          <strong>RSVP: {rsvpStatus === 'YES' ? 'Attending' : 'Not Attending'}</strong>
          {rsvpStatus === 'YES' && (
            <div style={{ textAlign: 'left', marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {config.requireMealPreference && mealPref && <div>🍽️ Meal: {mealPref}</div>}
              {config.requireDietaryRestrictions && dietary && <div>⚠️ Dietary: {dietary}</div>}
              {config.allowPlusOnes && plusOne && <div>👥 Guest: {plusOne}</div>}
              {config.customNotesLabel && notes && <div>📝 Note: {notes}</div>}
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
            RSVP Response
          </h1>
          <p style={{ color: 'var(--rsvp-text-secondary, rgba(255, 255, 255, 0.5))', fontSize: '0.8rem' }}>
            For: {guest.guestName}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="lp-field">
            <span className="lp-field-label">Will you attend?</span>
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
                Yes, gladly
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
                No, regrettably
              </button>
            </div>
          </div>

          {rsvpStatus === 'YES' && (
            <>
              {config.requireMealPreference && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="meal-preference">
                    Meal Preference
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
                    <option value="" disabled style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>Choose a meal</option>
                    <option value="Beef" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>Prime Beef Tenderloin</option>
                    <option value="Fish" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>Atlantic Salmon</option>
                    <option value="Vegetarian" style={{ background: 'var(--rsvp-select-option-bg, #222)' }}>Truffle Wild Mushroom Risotto</option>
                  </select>
                </div>
              )}

              {config.requireDietaryRestrictions && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="dietary-restrictions">
                    Dietary Restrictions
                  </label>
                  <input
                    id="dietary-restrictions"
                    className="lp-input"
                    type="text"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="e.g. Gluten-free, nut allergies"
                    autoComplete="off"
                    required
                  />
                </div>
              )}

              {config.allowPlusOnes && (
                <div className="lp-field">
                  <label className="lp-field-label" htmlFor="plus-one-name">
                    Plus-One Guest Name
                  </label>
                  <input
                    id="plus-one-name"
                    className="lp-input"
                    type="text"
                    value={plusOne}
                    onChange={(e) => setPlusOne(e.target.value)}
                    placeholder="First and last name"
                    autoComplete="off"
                    required
                  />
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
                    placeholder="Type your response..."
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
            Submit RSVP
          </button>
        </form>
      </div>
    </aside>
  );
}
