import React from 'react';
import { useSigil } from '../../context/SigilContext';
import type { RsvpFormConfig } from '../../types/sigil.types';

export function FormConfiguratorPanel() {
  const { state, updateDesign } = useSigil();
  const config = state.design.rsvpFormConfig || {
    requireMealPreference: false,
    requireDietaryRestrictions: false,
    allowPlusOnes: false,
    customNotesLabel: null,
  };

  const handleToggle = (key: keyof Omit<RsvpFormConfig, 'customNotesLabel'>) => {
    const nextConfig = {
      ...config,
      [key]: !config[key],
    };
    updateDesign({ rsvpFormConfig: nextConfig });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateDesign({
      rsvpFormConfig: {
        ...config,
        customNotesLabel: val.trim() || null,
      },
    });
  };

  return (
    <section className="lp-section" aria-labelledby="section-form-config" style={{ marginTop: '1rem' }}>
      <p className="lp-section-label">
        RSVP Form Controls
      </p>

      <div className="lp-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--cr-text-secondary)', cursor: 'pointer' }}>
          <input
            id="cfg-meal"
            type="checkbox"
            checked={config.requireMealPreference}
            onChange={() => handleToggle('requireMealPreference')}
            style={{ accentColor: 'var(--cr-accent)' }}
          />
          Require Meal Preference
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--cr-text-secondary)', cursor: 'pointer' }}>
          <input
            id="cfg-dietary"
            type="checkbox"
            checked={config.requireDietaryRestrictions}
            onChange={() => handleToggle('requireDietaryRestrictions')}
            style={{ accentColor: 'var(--cr-accent)' }}
          />
          Dietary Restrictions Field
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--cr-text-secondary)', cursor: 'pointer' }}>
          <input
            id="cfg-plus-one"
            type="checkbox"
            checked={config.allowPlusOnes}
            onChange={() => handleToggle('allowPlusOnes')}
            style={{ accentColor: 'var(--cr-accent)' }}
          />
          Allow Plus-Ones
        </label>

        <div className="lp-field" style={{ marginTop: '0.5rem' }}>
          <label className="lp-field-label" htmlFor="custom-notes">
            Custom Notes Label (Empty to disable)
          </label>
          <input
            id="custom-notes"
            className="lp-input"
            type="text"
            value={config.customNotesLabel || ''}
            onChange={handleNotesChange}
            placeholder="e.g. Leave a note for the couple"
            autoComplete="off"
            style={{ fontSize: '0.8rem', padding: '6px' }}
          />
        </div>
      </div>
    </section>
  );
}
