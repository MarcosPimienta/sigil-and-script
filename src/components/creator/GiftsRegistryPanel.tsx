import { useSigilSelector } from '../../context/SigilContext';
import { getTranslation } from '../../utils/i18n';

export function GiftsRegistryPanel() {
  const registryText = useSigilSelector((s) => s.design.registryText);
  const registryLink = useSigilSelector((s) => s.design.registryLink);
  const lang = useSigilSelector((s) => s.design.language);
  const t = getTranslation(lang);

  if (!registryText && !registryLink) return null;

  return (
    <div className="section-gifts" style={{
      textAlign: 'center',
      padding: '2.5rem 1.5rem',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <h3 style={{
        fontSize: '1.8rem',
        fontStyle: 'italic',
        margin: '0 0 0.5rem 0',
        fontWeight: 400,
        color: '#4c4844',
      }}>
        {t.registryTitle}
      </h3>
      {registryText && (
        <p style={{
          fontSize: '0.95rem',
          color: 'rgba(0,0,0,0.6)',
          lineHeight: 1.5,
          maxWidth: '320px',
          margin: '0 auto 1.25rem',
        }}>
          {registryText}
        </p>
      )}
      {registryLink && (
        <a
          href={registryLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            border: '1px solid #4c4844',
            borderRadius: '20px',
            padding: '6px 20px',
            fontSize: '0.85rem',
            color: '#4c4844',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4c4844';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#4c4844';
          }}
        >
          {t.viewRegistry}
        </a>
      )}
    </div>
  );
}

