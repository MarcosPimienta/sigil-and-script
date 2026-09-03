import { useSigilSelector } from '../../context/SigilContext';
import { getPhrasing } from '../../utils/eventPhrasing';
import { EventIcon } from '../icons/eventIcons';

// Simple X-out circle component for "avoid colors"
const AvoidColorCircle = ({ color }: { color: string }) => (
  <div
    style={{
      position: 'relative',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: color,
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  </div>
);

export function DressCodePanel() {
  const guestLang = useSigilSelector((s) => s.guest?.language);
  const design = useSigilSelector((s) => s.design);
  const lang = guestLang || design.language;
  const phrasing = getPhrasing(design.eventType, lang);

  const dressCode = design.dressCode;
  const groups = dressCode?.groups ?? [];
  if (!dressCode || (!dressCode.intro && groups.length === 0)) return null;

  const columns = Math.min(Math.max(groups.length, 1), 3);

  return (
    <div className="section-dresscode" style={{
      textAlign: 'center',
      padding: '3rem 1.5rem',
      marginTop: '1.5rem',
      fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)",
    }}>
      {/* Main Heading */}
      {dressCode.intro && (
        <div style={{ marginBottom: groups.length ? '2.5rem' : 0 }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontStyle: 'italic',
            margin: '0 0 0.5rem 0',
            fontWeight: 400,
            color: '#4c4844',
          }}>
            {phrasing.dressCodeHeading}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            color: 'rgba(0,0,0,0.6)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {dressCode.intro}
          </p>
        </div>
      )}

      {groups.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '2rem',
        }}>
          {groups.map((group) => (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              {group.label && (
                <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', fontStyle: 'italic', fontWeight: 400, color: '#4c4844' }}>
                  {group.label}
                </h4>
              )}
              {group.icon && (
                <EventIcon
                  id={group.icon}
                  size={72}
                  strokeWidth={1}
                  style={{ color: '#4c4844', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                />
              )}
              {group.text && (
                <p style={{ fontSize: '1.6rem', margin: '1rem 0 0.25rem 0', fontStyle: 'italic', color: '#333' }}>
                  {group.text}
                </p>
              )}
              {group.subtext && (
                <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#666', fontStyle: 'italic', lineHeight: 1.3, maxWidth: '80%' }}>
                  {group.subtext}
                </p>
              )}
              {group.avoidColors && group.avoidColors.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
                  {group.avoidColors.map((color, idx) => (
                    <AvoidColorCircle key={idx} color={color} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
