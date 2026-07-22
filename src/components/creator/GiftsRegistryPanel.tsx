import { useSigilSelector } from '../../context/SigilContext';
import { getTranslation } from '../../utils/i18n';

const RegistryFlourish = ({ color = 'rgba(120, 100, 80, 0.4)' }: { color?: string }) => (
  <svg width="35" height="35" viewBox="0 0 50 50" style={{ pointerEvents: 'none' }}>
    <path d="M 5 50 L 5 5 L 50 5" fill="none" stroke={color} strokeWidth="1.5" />
    <path d="M 12 50 L 12 12 L 50 12" fill="none" stroke={color} strokeWidth="0.8" />
    <path d="M 5 18 C 15 18 18 15 18 5" fill="none" stroke={color} strokeWidth="1" />
    <circle cx="25" cy="25" r="2" fill={color} />
    <circle cx="32" cy="18" r="1.5" fill={color} />
    <circle cx="18" cy="32" r="1.5" fill={color} />
  </svg>
);

export function GiftsRegistryPanel() {
  const registryTitle = useSigilSelector((s) => s.design.registryTitle);
  const registryText = useSigilSelector((s) => s.design.registryText);
  const registryLink = useSigilSelector((s) => s.design.registryLink);
  const registryImage = useSigilSelector((s) => s.design.registryImage);
  const registryImageScale = useSigilSelector((s) => s.design.registryImageScale);
  const registrySymbol = useSigilSelector((s) => s.design.registrySymbol);
  const lang = useSigilSelector((s) => s.design.language);
  const t = getTranslation(lang);

  if (!registryText && !registryLink && !registryImage) return null;

  const imageMaxDimension = `${Math.round(120 * ((registryImageScale ?? 100) / 100))}px`;

  return (
    <div className="section-gifts" style={{
      position: 'relative',
      textAlign: 'center',
      padding: '3rem 1.5rem',
      background: 'transparent',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      {/* Inner ornamented border frame with unique registry flourishes */}
      <div
        style={{
          position: 'absolute',
          inset: '10px',
          border: '4px solid rgba(120, 100, 80, 0.6)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: '-2px', left: '-2px' }}><RegistryFlourish /></div>
        <div style={{ position: 'absolute', top: '-2px', right: '-2px', transform: 'scaleX(-1)' }}><RegistryFlourish /></div>
        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', transform: 'scaleY(-1)' }}><RegistryFlourish /></div>
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', transform: 'scale(-1)' }}><RegistryFlourish /></div>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h3 style={{
          fontSize: '1.8rem',
          fontStyle: 'italic',
          margin: '0 0 0.5rem 0',
          fontWeight: 400,
          color: '#4c4844',
        }}>
          {registryTitle || t.registryTitle}
        </h3>
        {registryText && (
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: 1.5,
            maxWidth: '320px',
            margin: '0 auto 1.25rem',
            fontStyle: 'italic',
            textAlign: 'justify',
            textAlignLast: 'center' // Make the last line centered for better aesthetics
          }}>
            {registryText}
          </p>
        )}
        
        {/* Render the optional registry image */}
        {registryImage && (
          <div style={{
            marginBottom: registrySymbol ? '0.5rem' : '1.25rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
            <img 
              src={registryImage} 
              alt="Registry decorative image" 
              style={{
                maxWidth: imageMaxDimension,
                maxHeight: imageMaxDimension,
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>
        )}

        {/* Decorative symbol at the bottom of the text */}
        {registrySymbol && (
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(120, 100, 80, 0.6)',
            margin: '0 auto 1.25rem',
            textAlign: 'center',
            letterSpacing: '4px'
          }}>
            {registrySymbol}
          </div>
        )}

        {registryLink && (
          <a
            href={registryLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              border: '2px solid rgba(120, 100, 80, 0.7)',
              borderRadius: '2px',
              padding: '8px 24px',
              fontSize: '0.9rem',
              color: '#4c4844',
              textDecoration: 'none',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              background: 'rgba(255, 255, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4c4844';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.color = '#4c4844';
            }}
          >
            {t.viewRegistry}
          </a>
        )}
      </div>
    </div>
  );
}

