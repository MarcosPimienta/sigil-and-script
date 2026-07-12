import { useSigilSelector } from '../../context/SigilContext';

export function ItineraryTimeline() {
  const itinerary = useSigilSelector((s) => s.design.itinerary) || [];

  if (itinerary.length === 0) return null;

  return (
    <div className="section-itinerary" style={{
      padding: '2.5rem 1.5rem',
      background: 'var(--envelope-color, #c8b998)',
      borderRadius: '8px',
      color: '#ffffff',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      filter: 'brightness(0.95)',
    }}>
      <h3 style={{
        fontSize: '2rem',
        fontStyle: 'italic',
        textAlign: 'center',
        margin: '0 0 2rem 0',
        fontWeight: 400,
        letterSpacing: '0.04em',
      }}>
        Itinerario
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {itinerary.map((item) => (
          <div
            key={item.id}
            className="itinerary-card"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '6px',
              padding: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <h4 style={{ fontSize: '1.5rem', fontStyle: 'italic', margin: 0, fontWeight: 500 }}>
              {item.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {item.locationName}
            </p>
            {item.mapLink && (
              <a
                href={item.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  border: '1px solid currentColor',
                  borderRadius: '20px',
                  padding: '4px 16px',
                  fontSize: '0.85rem',
                  color: 'inherit',
                  textDecoration: 'none',
                  marginTop: '0.25rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                Ver ubicación
              </a>
            )}
            <div style={{
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              opacity: 0.8,
              marginTop: '0.5rem',
              textTransform: 'uppercase',
            }}>
              HORA: {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
