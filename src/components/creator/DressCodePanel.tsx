import { useSigilSelector } from '../../context/SigilContext';
import { getTranslation } from '../../utils/i18n';

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

// Minimalist suit icon
const SuitIcon = () => (
  <svg width="70" height="90" viewBox="0 0 24 32" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
    <path d="M 12 4 L 15 11 L 21 9 L 19 28 L 13 28 L 13 18 L 12 22 L 11 18 L 11 28 L 5 28 L 3 9 L 9 11 Z" fill="#2c2c2c"/>
    <path d="M 10 4 L 12 9 L 14 4 Z" fill="#f5f5f5" stroke="none"/>
    <path d="M 12 9 L 12 22" stroke="#4a4a4a" strokeWidth="0.5"/>
  </svg>
);

// Minimalist dress icon
const DressIcon = () => (
  <svg width="70" height="90" viewBox="0 0 24 32" fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
    <path d="M 8.5 4 C 10.5 8, 13.5 8, 15.5 4 C 17 7, 16.5 12, 16.5 12 L 23 30 L 1 30 L 7.5 12 C 7.5 12, 7 7, 8.5 4 Z" fill="#364942"/>
  </svg>
);

export function DressCodePanel() {
  const design = useSigilSelector((s) => s.design);
  const lang = design.language;
  const t = getTranslation(lang);

  const hasMale = design.dressCodeMaleHeading || design.dressCodeMaleText;
  const hasFemale = design.dressCodeFemaleHeading || design.dressCodeFemaleText;

  if (!design.dressCodeText && !hasMale && !hasFemale) return null;

  return (
    <div className="section-dresscode" style={{
      textAlign: 'center',
      padding: '3rem 1.5rem',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      {/* Main Heading */}
      {design.dressCodeText && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{
            fontSize: '1.8rem',
            fontStyle: 'italic',
            margin: '0 0 0.5rem 0',
            fontWeight: 400,
            color: '#4c4844',
          }}>
            {t.dressCodeTitle}
          </h3>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            color: 'rgba(0,0,0,0.6)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {design.dressCodeText}
          </p>
        </div>
      )}

      {/* 2-Column Layout */}
      {(hasMale || hasFemale) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Male Column */}
          {hasMale && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', fontStyle: 'italic', fontWeight: 400, color: '#4c4844' }}>
                {design.dressCodeMaleHeading}
              </h4>
              <SuitIcon />
              <p style={{ fontSize: '1.6rem', margin: '1rem 0 0.25rem 0', fontStyle: 'italic', color: '#333' }}>
                {design.dressCodeMaleText}
              </p>
              <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#666', fontStyle: 'italic', lineHeight: 1.3, maxWidth: '80%' }}>
                {design.dressCodeMaleSubtext}
              </p>
              {design.dressCodeMaleAvoidColors && design.dressCodeMaleAvoidColors.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {design.dressCodeMaleAvoidColors.map((color, idx) => (
                    <AvoidColorCircle key={idx} color={color} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Female Column */}
          {hasFemale && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', fontStyle: 'italic', fontWeight: 400, color: '#4c4844' }}>
                {design.dressCodeFemaleHeading}
              </h4>
              <DressIcon />
              <p style={{ fontSize: '1.6rem', margin: '1rem 0 0.25rem 0', fontStyle: 'italic', color: '#333' }}>
                {design.dressCodeFemaleText}
              </p>
              <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#666', fontStyle: 'italic', lineHeight: 1.3, maxWidth: '80%' }}>
                {design.dressCodeFemaleSubtext}
              </p>
              {design.dressCodeFemaleAvoidColors && design.dressCodeFemaleAvoidColors.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {design.dressCodeFemaleAvoidColors.map((color, idx) => (
                    <AvoidColorCircle key={idx} color={color} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
