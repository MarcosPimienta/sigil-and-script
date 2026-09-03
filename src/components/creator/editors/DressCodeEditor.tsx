// ─────────────────────────────────────────────────────────────────────────────
// Dress code editor — any number of named groups (was a fixed male/female pair).
// ─────────────────────────────────────────────────────────────────────────────

import { useSigil } from '../../../context/SigilContext';
import type { DressCodeGroup, IconId } from '../../../types/sigil.types';
import { EventIcon } from '../../icons/eventIcons';

const GROUP_ICON_CHOICES: IconId[] = ['suit', 'dress', 'tie', 'badge', 'sparkle', 'dove', 'gift'];

function AvoidColorsEditor({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>
        Colores a evitar (Avoid colors)
      </span>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {colors.map((color, idx) => (
          <div key={idx} style={{ position: 'relative', width: '28px', height: '28px' }}>
            <input
              type="color"
              value={color}
              aria-label={`Color a evitar ${idx + 1}`}
              onChange={(e) => {
                const next = [...colors];
                next[idx] = e.target.value;
                onChange(next);
              }}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
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
              justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.5)" strokeWidth="2">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </div>
            <button
              type="button"
              aria-label={`Quitar color ${idx + 1}`}
              onClick={() => onChange(colors.filter((_, i) => i !== idx))}
              style={{
                position: 'absolute', top: '-6px', right: '-6px', width: '14px', height: '14px',
                borderRadius: '50%', background: '#ff4d4f', color: 'white', border: 'none',
                fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          aria-label="Agregar color a evitar"
          onClick={() => onChange([...colors, '#000000'])}
          style={{
            width: '28px', height: '28px', borderRadius: '50%', border: '1px dashed #ccc',
            background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#666',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function DressCodeEditor() {
  const { state, updateDesign } = useSigil();
  const dressCode = state.design.dressCode ?? { intro: '', groups: [] };
  const groups = dressCode.groups ?? [];

  const patch = (next: Partial<typeof dressCode>) =>
    updateDesign({ dressCode: { intro: dressCode.intro, groups, ...next } });

  const updateGroup = (id: string, changes: Partial<DressCodeGroup>) =>
    patch({ groups: groups.map((g) => (g.id === id ? { ...g, ...changes } : g)) });

  const addGroup = () =>
    patch({
      groups: [
        ...groups,
        {
          id: `dc-${Date.now().toString(36)}`,
          label: state.design.language === 'EN' ? 'Guests' : 'Invitados',
          text: '',
          icon: 'sparkle',
        },
      ],
    });

  const removeGroup = (id: string) => patch({ groups: groups.filter((g) => g.id !== id) });

  const moveGroup = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ groups: next });
  };

  return (
    <div className="lp-field" style={{ borderTop: '1px dashed var(--cr-panel-border)', paddingTop: '15px' }}>
      <label className="lp-field-label" htmlFor="dresscode-input">
        Código de Vestimenta (Dress Code)
      </label>
      <input
        id="dresscode-input"
        type="text"
        className="lp-input"
        placeholder="Ej: Formal, Gala, Semiformal"
        value={dressCode.intro || ''}
        onChange={(e) => patch({ intro: e.target.value })}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
        <span className="lp-field-label" style={{ margin: 0 }}>Grupos (Groups)</span>
        <button
          type="button"
          onClick={addGroup}
          className="lp-add-invitee-btn"
          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
        >
          + Agregar Grupo
        </button>
      </div>

      {groups.length === 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--cr-text-secondary, #71717a)', margin: 0 }}>
          Sin grupos: se muestra solo el código general. Agrega grupos para separar por ejemplo
          “Ellos” y “Ellas”, o “Invitados”.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {groups.map((group, idx) => (
          <div
            key={group.id}
            style={{
              border: '1px solid var(--cr-panel-border)',
              borderRadius: '6px',
              padding: '10px',
              background: 'var(--cr-panel-raised)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
              <button
                type="button"
                aria-label={`Subir grupo ${idx + 1}`}
                disabled={idx === 0}
                onClick={() => moveGroup(idx, -1)}
                style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, color: 'inherit' }}
              >
                ▲
              </button>
              <button
                type="button"
                aria-label={`Bajar grupo ${idx + 1}`}
                disabled={idx === groups.length - 1}
                onClick={() => moveGroup(idx, 1)}
                style={{ background: 'none', border: 'none', cursor: idx === groups.length - 1 ? 'default' : 'pointer', opacity: idx === groups.length - 1 ? 0.3 : 1, color: 'inherit' }}
              >
                ▼
              </button>
              <button
                type="button"
                aria-label={`Quitar grupo ${idx + 1}`}
                onClick={() => removeGroup(group.id)}
                style={{ background: 'none', border: 'none', color: 'var(--status-rsvp-no)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
              <input
                type="text"
                className="lp-input"
                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                placeholder="Nombre del grupo (Ej: Ellos)"
                aria-label={`Nombre del grupo ${idx + 1}`}
                value={group.label}
                onChange={(e) => updateGroup(group.id, { label: e.target.value })}
              />
              <input
                type="text"
                className="lp-input"
                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                placeholder="Vestimenta (Ej: Traje formal)"
                aria-label={`Vestimenta del grupo ${idx + 1}`}
                value={group.text}
                onChange={(e) => updateGroup(group.id, { text: e.target.value })}
              />
              <input
                type="text"
                className="lp-input"
                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                placeholder="Nota (Ej: Favor de evitar azul marino)"
                aria-label={`Nota del grupo ${idx + 1}`}
                value={group.subtext || ''}
                onChange={(e) => updateGroup(group.id, { subtext: e.target.value })}
              />

              <div>
                <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Icono</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {GROUP_ICON_CHOICES.map((iconId) => (
                    <button
                      key={iconId}
                      type="button"
                      aria-label={`Icono ${iconId} para el grupo ${idx + 1}`}
                      aria-pressed={group.icon === iconId}
                      onClick={() => updateGroup(group.id, { icon: iconId })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer',
                        background: 'var(--cr-input-bg, #fff)',
                        border: `1px solid ${group.icon === iconId ? 'var(--cr-accent, #d4af37)' : 'var(--cr-input-border, #e5e7eb)'}`,
                        color: 'var(--cr-text, #18181b)',
                      }}
                    >
                      <EventIcon id={iconId} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <AvoidColorsEditor
                colors={group.avoidColors || []}
                onChange={(next) => updateGroup(group.id, { avoidColors: next })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
