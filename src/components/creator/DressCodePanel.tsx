import { useSigilSelector } from '../../context/SigilContext';

export function DressCodePanel() {
  const dressCodeText = useSigilSelector((s) => s.design.dressCodeText);
  const colorPalette = useSigilSelector((s) => s.design.colorPalette) || [];

  if (!dressCodeText && colorPalette.length === 0) return null;

  return (
    <div className="section-dresscode" style={{
      textAlign: 'center',
      padding: '2.5rem 1.5rem',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      {dressCodeText && (
        <>
          <h3 style={{
            fontSize: '1.8rem',
            fontStyle: 'italic',
            margin: '0 0 0.25rem 0',
            fontWeight: 400,
            color: '#4c4844',
          }}>
            Dress Code
          </h3>
          <p style={{
            fontSize: '1.4rem',
            margin: '0 0 1.5rem 0',
            color: 'rgba(0,0,0,0.6)',
          }}>
            {dressCodeText}
          </p>
        </>
      )}

      {colorPalette.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{
            fontSize: '0.9rem',
            margin: 0,
            color: 'rgba(0,0,0,0.5)',
            maxWidth: '300px',
            lineHeight: 1.4,
          }}>
            Nos encantaría que pudieran asistir en la paleta de colores de nuestra boda:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {colorPalette.map((color, idx) => (
              <div
                key={idx}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
