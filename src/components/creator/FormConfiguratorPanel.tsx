import React, { useState } from 'react';
import { useSigil } from '../../context/SigilContext';
import type { RsvpFormConfig } from '../../types/sigil.types';
import { getPhrasing, fillHosts } from '../../utils/eventPhrasing';

export function FormConfiguratorPanel() {
  const { state, updateDesign } = useSigil();
  const config = state.design.rsvpFormConfig || {
    requireMealPreference: false,
    requireDietaryRestrictions: false,
    allowPlusOnes: false,
    customNotesLabel: null,
    mealOptions: [],
  };
  const mealOptions = config.mealOptions ?? [];
  const lang = state.design.language === 'EN' ? 'EN' : 'ES';
  const phrasing = getPhrasing(state.design.eventType, lang);
  const hostNames = state.design.textBlocks?.find((b) => b.id === 'tb-headline')?.content;
  const [newMeal, setNewMeal] = useState('');

  const setMealOptions = (next: string[]) =>
    updateDesign({ rsvpFormConfig: { ...config, mealOptions: next } });

  const addMeal = () => {
    const value = newMeal.trim();
    if (!value || mealOptions.includes(value)) return;
    setMealOptions([...mealOptions, value]);
    setNewMeal('');
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

        {config.requireMealPreference && (
          <div className="lp-field" style={{ marginLeft: '1.5rem' }}>
            <label className="lp-field-label" htmlFor="meal-option-input">
              Opciones de Menú (Meal options)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0' }}>
              {mealOptions.map((option) => (
                <span
                  key={option}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '3px 8px', borderRadius: '999px', fontSize: '0.78rem',
                    background: 'var(--cr-input-bg, #fff)',
                    border: '1px solid var(--cr-input-border, #e5e7eb)',
                    color: 'var(--cr-text, #18181b)',
                  }}
                >
                  {option}
                  <button
                    type="button"
                    aria-label={`Quitar ${option}`}
                    onClick={() => setMealOptions(mealOptions.filter((m) => m !== option))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-rsvp-no)', padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {mealOptions.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--cr-text-secondary, #71717a)' }}>
                  Sin opciones aún — agrega al menos una.
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                id="meal-option-input"
                className="lp-input"
                type="text"
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMeal();
                  }
                }}
                placeholder={lang === 'EN' ? 'e.g. Vegetarian' : 'Ej: Vegetariano'}
                style={{ fontSize: '0.8rem', padding: '6px' }}
              />
              <button type="button" className="lp-add-invitee-btn" onClick={addMeal} style={{ padding: '2px 10px', fontSize: '0.75rem' }}>
                +
              </button>
            </div>
          </div>
        )}

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
            placeholder={fillHosts(phrasing.notesPlaceholder, hostNames)}
            autoComplete="off"
            style={{ fontSize: '0.8rem', padding: '6px' }}
          />
        </div>
      </div>
    </section>
  );
}
