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

  const handleColorChange = (idx: number, hex: string) => {
    const palette = [...(design.colorPalette || [])];
    palette[idx] = hex;
    handleFieldChange('colorPalette', palette);
  };

  return (
    <div className="section-editor-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* ── Color Palette ── */}
      <div className="lp-field">
        <label className="lp-field-label">Paleta de Colores de la Boda</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {(design.colorPalette || []).map((color, idx) => (
            <div key={idx} style={{ position: 'relative', width: '32px', height: '32px' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
                aria-label={`Editar color ${idx + 1}`}
              />
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: color,
                border: '1.5px solid var(--cr-panel-border)',
                pointerEvents: 'none',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Registry ── */}
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
