import { useSigilSelector } from '../../context/SigilContext';

const CornerFlourish = () => (
  <svg width="45" height="45" viewBox="0 0 45 45" style={{ pointerEvents: 'none' }}>
    <path d="M 12 45 L 12 12 L 45 12" stroke="rgba(255,255,255,0.7)" fill="none" strokeWidth="1.2" />
    <path d="M 12 30 C 12 20 20 12 30 12" stroke="rgba(255,255,255,0.7)" fill="none" strokeWidth="0.8" />
    <path d="M 12 38 C 12 24 24 12 38 12" stroke="rgba(255,255,255,0.5)" fill="none" strokeWidth="0.8" />
    <path d="M 18 18 C 22 14 26 18 22 22 C 18 26 14 22 18 18 Z" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
    <path d="M 24 24 C 28 20 32 24 28 28 C 24 32 20 28 24 24 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
    <circle cx="32" cy="18" r="1.5" fill="rgba(255,255,255,0.8)" />
    <circle cx="18" cy="32" r="1.5" fill="rgba(255,255,255,0.8)" />
    <circle cx="38" cy="26" r="1" fill="rgba(255,255,255,0.6)" />
    <circle cx="26" cy="38" r="1" fill="rgba(255,255,255,0.6)" />
  </svg>
);

const ChurchIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    style={{ margin: '0.2rem 0 0.4rem 0' }}
    aria-hidden="true"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="
      M 11.5 0.5 H 12.5 V 3.5 H 11.5 Z
      M 10 1.5 H 14 V 2.5 H 10 Z
      M 12 3.5 L 9 7 H 15 Z
      M 9.5 7 H 14.5 V 13 H 9.5 Z
      M 9.5 13 L 3 17.5 H 4 V 23.5 H 20 V 17.5 H 21 L 14.5 13 Z
      
      M 11.2 11.5 H 12.8 V 9.8 A 0.8 0.8 0 0 0 11.2 9.8 Z
      M 6.2 21.5 H 7.8 V 19.8 A 0.8 0.8 0 0 0 6.2 19.8 Z
      M 16.2 21.5 H 17.8 V 19.8 A 0.8 0.8 0 0 0 16.2 19.8 Z
      M 10 23.5 H 14 V 17.5 H 10 Z
    " fill="currentColor" />
    <path d="M 11.95 17.5 H 12.05 V 23.5 H 11.95 Z" fill="currentColor" />
    <path d="M 11.5 20 H 11.7 V 21 H 11.5 Z" fill="currentColor" />
    <path d="M 12.3 20 H 12.5 V 21 H 12.3 Z" fill="currentColor" />
  </svg>
);

export function ItineraryTimeline() {
  const itinerary = useSigilSelector((s) => s.design.itinerary) || [];

  if (itinerary.length === 0) return null;

  return (
    <div className="section-itinerary" style={{
      position: 'relative',
      padding: '2.8rem 2.2rem',
      background: 'var(--envelope-color, #c8b998)',
      borderRadius: '8px',
      color: '#ffffff',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      filter: 'brightness(0.95)',
      boxSizing: 'border-box',
    }}>
      {/* Absolute Ornamented Border Frame */}
      <div style={{
        position: 'absolute',
        inset: '12px',
        border: '0.8px solid rgba(255, 255, 255, 0.35)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {/* Top Left */}
        <div style={{ position: 'absolute', top: 0, left: 0 }}><CornerFlourish /></div>
        {/* Top Right */}
        <div style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}><CornerFlourish /></div>
        {/* Bottom Left */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scaleY(-1)' }}><CornerFlourish /></div>
        {/* Bottom Right */}
        <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'scale(-1)' }}><CornerFlourish /></div>
      </div>

      {/* Main Content inside the frame */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h3 style={{
          fontSize: '2.5rem',
          fontFamily: "'Pinyon Script', cursive",
          textAlign: 'center',
          margin: '0.5rem 0 1.5rem 0',
          fontWeight: 400,
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.15)'
        }}>
          Itinerario
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', width: '100%', alignItems: 'center' }}>
          {itinerary.map((item) => (
            <div
              key={item.id}
              className="itinerary-item-block"
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              {/* Cursive Title */}
              <h4 style={{ 
                fontSize: '2rem', 
                fontFamily: "'Pinyon Script', cursive", 
                margin: 0, 
                fontWeight: 400,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {item.title}
              </h4>

              {/* Church Icon below Ceremonia Religiosa */}
              {item.title.toLowerCase().includes('ceremonia') && item.title.toLowerCase().includes('religiosa') && (
                <ChurchIcon />
              )}
              
              {/* Address / Location details */}
              <p style={{ 
                margin: 0, 
                fontSize: '0.85rem', 
                opacity: 0.9, 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.4,
                letterSpacing: '0.02em',
                fontFamily: "'Cormorant Garamond', serif",
              }}>
                {item.locationName}
              </p>

              {/* Map Button */}
              {item.mapLink && (
                <a
                  href={item.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    border: '0.8px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '20px',
                    padding: '3px 14px',
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    textDecoration: 'none',
                    marginTop: '0.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    transition: 'background 0.2s, border-color 0.2s',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  Ver ubicación
                </a>
              )}

              {/* Hour */}
              <div style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                opacity: 0.85,
                marginTop: '0.2rem',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                HORA: {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
