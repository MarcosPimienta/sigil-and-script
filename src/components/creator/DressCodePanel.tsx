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
  <img 
    src="/icons/suit.svg" 
    alt="Traje" 
    style={{ height: '90px', width: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} 
  />
);

// Minimalist dress icon
const DressIcon = () => (
  <img 
    src="/icons/longdress.svg" 
    alt="Vestido" 
    style={{ height: '90px', width: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} 
  />
);

export function DressCodePanel() {
  const guestLang = useSigilSelector((s) => s.guest?.language);
  const design = useSigilSelector((s) => s.design);
  const lang = guestLang || design.language;
  const t = getTranslation(lang);

  const hasMale = design.dressCodeMaleHeading || design.dressCodeMaleText;
  const hasFemale = design.dressCodeFemaleHeading || design.dressCodeFemaleText;

  if (!design.dressCodeText && !hasMale && !hasFemale) return null;

  const isEn = lang === 'EN';

  const maleHeading = (design.dressCodeMaleHeading && design.dressCodeMaleHeading !== 'Ellos')
    ? design.dressCodeMaleHeading
    : (isEn ? 'Gentlemen' : 'Ellos');

  const maleText = (design.dressCodeMaleText && design.dressCodeMaleText !== 'Traje formal')
    ? design.dressCodeMaleText
    : (isEn ? 'Formal Suit' : 'Traje formal');

  const maleSubtext = (design.dressCodeMaleSubtext && design.dressCodeMaleSubtext !== 'Favor de evitar color azul marino')
    ? design.dressCodeMaleSubtext
    : (isEn ? 'Please avoid navy blue' : 'Favor de evitar color azul marino');

  const femaleHeading = (design.dressCodeFemaleHeading && design.dressCodeFemaleHeading !== 'Ellas')
    ? design.dressCodeFemaleHeading
    : (isEn ? 'Ladies' : 'Ellas');

  const femaleText = (design.dressCodeFemaleText && design.dressCodeFemaleText !== 'Vestido largo')
    ? design.dressCodeFemaleText
    : (isEn ? 'Evening Gown' : 'Vestido largo');

  const femaleSubtext = (design.dressCodeFemaleSubtext && design.dressCodeFemaleSubtext !== 'Favor de evitar colores blanco, beige o colores pasteles')
    ? design.dressCodeFemaleSubtext
    : (isEn ? 'Please avoid white, beige, or pastel colors' : 'Favor de evitar colores blanco, beige o colores pasteles');

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
        }}>
          {/* Male Column */}
          {hasMale && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', fontStyle: 'italic', fontWeight: 400, color: '#4c4844' }}>
                {maleHeading}
              </h4>
              <SuitIcon />
              <p style={{ fontSize: '1.6rem', margin: '1rem 0 0.25rem 0', fontStyle: 'italic', color: '#333' }}>
                {maleText}
              </p>
              <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#666', fontStyle: 'italic', lineHeight: 1.3, maxWidth: '80%' }}>
                {maleSubtext}
              </p>
              {design.dressCodeMaleAvoidColors && design.dressCodeMaleAvoidColors.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
                  {design.dressCodeMaleAvoidColors.map((color, idx) => (
                    <AvoidColorCircle key={idx} color={color} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Female Column */}
          {hasFemale && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', fontStyle: 'italic', fontWeight: 400, color: '#4c4844' }}>
                {femaleHeading}
              </h4>
              <DressIcon />
              <p style={{ fontSize: '1.6rem', margin: '1rem 0 0.25rem 0', fontStyle: 'italic', color: '#333' }}>
                {femaleText}
              </p>
              <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#666', fontStyle: 'italic', lineHeight: 1.3, maxWidth: '80%' }}>
                {femaleSubtext}
              </p>
              {design.dressCodeFemaleAvoidColors && design.dressCodeFemaleAvoidColors.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
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
