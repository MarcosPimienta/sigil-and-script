import { useSigil } from '../../context/SigilContext';
import type { ItineraryItem } from '../../types/sigil.types';

export function SectionEditor() {
  const { state, updateDesign, updateTextBlock } = useSigil();
  const design = state.design;

  const headlineBlock = design.textBlocks?.find((b) => b.id === 'tb-headline');
  const hostNames = headlineBlock ? headlineBlock.content : 'Oscar & Rocio';

  const handleFieldChange = (key: string, value: any) => {
    updateDesign({ [key]: value });
  };

  const handleItineraryChange = (idx: number, field: keyof ItineraryItem, val: string) => {
    const list = [...(design.itinerary || [])];
    list[idx] = { ...list[idx], [field]: val };
    handleFieldChange('itinerary', list);
  };

  const addItineraryItem = () => {
    const list = [...(design.itinerary || [])];
    list.push({
      id: `itin-${Date.now()}`,
      title: 'Nuevo Evento',
      locationName: 'Dirección o Lugar',
      time: '12:00',
      mapLink: '',
    });
    handleFieldChange('itinerary', list);
  };

  const removeItineraryItem = (idx: number) => {
    const list = [...(design.itinerary || [])];
    list.splice(idx, 1);
    handleFieldChange('itinerary', list);
  };

  return (
    <div className="section-editor-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Language Switch ── */}
      <div className="lp-field">
        <label className="lp-field-label">
          Idioma de la Invitación (Language)
        </label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            id="editor-lang-es-btn"
            className="lp-add-invitee-btn"
            style={{
              flex: 1,
              padding: '6px',
              background: (design.language || 'ES') === 'ES' ? 'var(--status-pending)' : 'transparent',
              color: (design.language || 'ES') === 'ES' ? '#ffffff' : 'var(--cr-panel-text-secondary)',
              border: '1px solid var(--cr-panel-border)',
              fontWeight: 600,
            }}
            onClick={() => handleFieldChange('language', 'ES')}
          >
            Español (SPA)
          </button>
          <button
            type="button"
            id="editor-lang-en-btn"
            className="lp-add-invitee-btn"
            style={{
              flex: 1,
              padding: '6px',
              background: design.language === 'EN' ? 'var(--status-pending)' : 'transparent',
              color: design.language === 'EN' ? '#ffffff' : 'var(--cr-panel-text-secondary)',
              border: '1px solid var(--cr-panel-border)',
              fontWeight: 600,
            }}
            onClick={() => handleFieldChange('language', 'EN')}
          >
            English (EN)
          </button>
        </div>
      </div>

      {/* ── Host Names ── */}
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="host-names-input">
          Nombres de los Novios (Host Names)
        </label>
        <input
          id="host-names-input"
          type="text"
          className="lp-input"
          placeholder="Ej: Oscar & Rocio"
          value={hostNames}
          onChange={(e) => updateTextBlock('tb-headline', { content: e.target.value })}
        />
      </div>

      {/* ── Countdown ── */}
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="countdown-input">
          Fecha y Hora de la Boda (Cuenta Regresiva)
        </label>
        <input
          id="countdown-input"
          type="datetime-local"
          className="lp-input"
          value={design.countdownTarget ? design.countdownTarget.substring(0, 16) : ''}
          onChange={(e) => handleFieldChange('countdownTarget', e.target.value)}
        />
      </div>

      {/* ── Dress Code ── */}
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="dresscode-input">
          Dress Code
        </label>
        <input
          id="dresscode-input"
          type="text"
          className="lp-input"
          placeholder="Ej: Formal, Gala, Semiformal"
          value={design.dressCodeText || ''}
          onChange={(e) => handleFieldChange('dressCodeText', e.target.value)}
        />
      </div>

      {/* ── Dress Code: Male ── */}
      <div className="lp-field">
        <label className="lp-field-label">Male Section</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <input
            type="text"
            className="lp-input"
            placeholder="Heading (e.g. Ellos)"
            value={design.dressCodeMaleHeading || ''}
            onChange={(e) => handleFieldChange('dressCodeMaleHeading', e.target.value)}
          />
          <input
            type="text"
            className="lp-input"
            placeholder="Text (e.g. Traje formal)"
            value={design.dressCodeMaleText || ''}
            onChange={(e) => handleFieldChange('dressCodeMaleText', e.target.value)}
          />
          <input
            type="text"
            className="lp-input"
            placeholder="Subtext (e.g. Favor de evitar...)"
            value={design.dressCodeMaleSubtext || ''}
            onChange={(e) => handleFieldChange('dressCodeMaleSubtext', e.target.value)}
          />
          <div>
            <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Avoid Colors</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(design.dressCodeMaleAvoidColors || []).map((color, idx) => (
                <div key={idx} style={{ position: 'relative', width: '28px', height: '28px' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...(design.dressCodeMaleAvoidColors || [])];
                      newColors[idx] = e.target.value;
                      handleFieldChange('dressCodeMaleAvoidColors', newColors);
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid var(--cr-panel-border)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Tiny X icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={() => {
                      const newColors = [...(design.dressCodeMaleAvoidColors || [])];
                      newColors.splice(idx, 1);
                      handleFieldChange('dressCodeMaleAvoidColors', newColors);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColors = [...(design.dressCodeMaleAvoidColors || []), '#000000'];
                  handleFieldChange('dressCodeMaleAvoidColors', newColors);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px dashed #ccc',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dress Code: Female ── */}
      <div className="lp-field">
        <label className="lp-field-label">Female Section</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <input
            type="text"
            className="lp-input"
            placeholder="Heading (e.g. Ellas)"
            value={design.dressCodeFemaleHeading || ''}
            onChange={(e) => handleFieldChange('dressCodeFemaleHeading', e.target.value)}
          />
          <input
            type="text"
            className="lp-input"
            placeholder="Text (e.g. Vestido largo)"
            value={design.dressCodeFemaleText || ''}
            onChange={(e) => handleFieldChange('dressCodeFemaleText', e.target.value)}
          />
          <input
            type="text"
            className="lp-input"
            placeholder="Subtext (e.g. Favor de evitar...)"
            value={design.dressCodeFemaleSubtext || ''}
            onChange={(e) => handleFieldChange('dressCodeFemaleSubtext', e.target.value)}
          />
          <div>
            <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Avoid Colors</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(design.dressCodeFemaleAvoidColors || []).map((color, idx) => (
                <div key={idx} style={{ position: 'relative', width: '28px', height: '28px' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...(design.dressCodeFemaleAvoidColors || [])];
                      newColors[idx] = e.target.value;
                      handleFieldChange('dressCodeFemaleAvoidColors', newColors);
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid var(--cr-panel-border)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Tiny X icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                      <line x1="4" y1="4" x2="20" y2="20" />
                      <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={() => {
                      const newColors = [...(design.dressCodeFemaleAvoidColors || [])];
                      newColors.splice(idx, 1);
                      handleFieldChange('dressCodeFemaleAvoidColors', newColors);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColors = [...(design.dressCodeFemaleAvoidColors || []), '#000000'];
                  handleFieldChange('dressCodeFemaleAvoidColors', newColors);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px dashed #ccc',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ── Registry ── */}
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-title-input">
          Título de Regalos
        </label>
        <input
          id="registry-title-input"
          type="text"
          className="lp-input"
          placeholder="Mesa de Regalos"
          value={design.registryTitle || ''}
          onChange={(e) => handleFieldChange('registryTitle', e.target.value)}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-text-input">
          Mensaje de Regalos
        </label>
        <textarea
          id="registry-text-input"
          className="lp-input"
          style={{ height: '70px', resize: 'vertical', padding: '6px 12px' }}
          value={design.registryText || ''}
          onChange={(e) => handleFieldChange('registryText', e.target.value)}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-link-input">
          Enlace a la Lista de Regalos (URL)
        </label>
        <input
          id="registry-link-input"
          type="url"
          className="lp-input"
          placeholder="https://..."
          value={design.registryLink || ''}
          onChange={(e) => handleFieldChange('registryLink', e.target.value)}
        />
      </div>

      {/* ── Itinerary Timeline ── */}
      <div className="lp-field" style={{ borderTop: '1px dashed var(--cr-panel-border)', paddingTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="lp-field-label" style={{ margin: 0 }}>Itinerario (Eventos)</span>
          <button
            type="button"
            onClick={addItineraryItem}
            className="lp-add-invitee-btn"
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
          >
            + Agregar Evento
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {(design.itinerary || []).map((item, idx) => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--cr-panel-border)',
                borderRadius: '6px',
                padding: '10px',
                background: 'var(--cr-panel-raised)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => removeItineraryItem(idx)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-rsvp-no)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                aria-label="Quitar evento"
              >
                ✕
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Título (Ej: Ceremonia)"
                  value={item.title}
                  className="lp-input"
                  style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                  onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)}
                  aria-label={`Título del evento ${idx + 1}`}
                />
                <input
                  type="text"
                  placeholder="Hora (Ej: 18:00)"
                  value={item.time}
                  className="lp-input"
                  style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                  onChange={(e) => handleItineraryChange(idx, 'time', e.target.value)}
                  aria-label={`Hora del evento ${idx + 1}`}
                />
                <textarea
                  placeholder="Ubicación / Dirección"
                  value={item.locationName}
                  className="lp-input"
                  style={{ padding: '4px 8px', fontSize: '0.85rem', height: '50px', resize: 'vertical' }}
                  onChange={(e) => handleItineraryChange(idx, 'locationName', e.target.value)}
                  aria-label={`Ubicación del evento ${idx + 1}`}
                />
                <input
                  type="url"
                  placeholder="Enlace de Google Maps (opcional)"
                  value={item.mapLink || ''}
                  className="lp-input"
                  style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                  onChange={(e) => handleItineraryChange(idx, 'mapLink', e.target.value)}
                  aria-label={`Enlace de mapa del evento ${idx + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
