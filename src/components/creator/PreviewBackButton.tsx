export interface PreviewBackButtonProps {
  onExit: () => void;
  language?: 'EN' | 'ES';
}

export function PreviewBackButton({ onExit, language = 'ES' }: PreviewBackButtonProps) {
  const isEn = language === 'EN';
  const label = isEn ? 'Return to Studio' : 'Volver al Estudio';

  return (
    <button
      id="btn-preview-back-to-studio"
      type="button"
      className="creator-preview-back-btn"
      onClick={onExit}
      aria-label={label}
    >
      <span className="creator-preview-back-icon" aria-hidden="true">←</span>
      <span className="creator-preview-back-text">{label}</span>
    </button>
  );
}
