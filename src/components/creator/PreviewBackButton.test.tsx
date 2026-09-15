import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewBackButton } from './PreviewBackButton';

describe('PreviewBackButton', () => {
  it('renders with Spanish label by default', () => {
    const onExit = vi.fn();
    render(<PreviewBackButton onExit={onExit} />);

    const button = screen.getByRole('button', { name: /volver al estudio/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Volver al Estudio');
    expect(button).toHaveAttribute('id', 'btn-preview-back-to-studio');
  });

  it('renders with English label when language is EN', () => {
    const onExit = vi.fn();
    render(<PreviewBackButton onExit={onExit} language="EN" />);

    const button = screen.getByRole('button', { name: /return to studio/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Return to Studio');
  });

  it('calls onExit when clicked', () => {
    const onExit = vi.fn();
    render(<PreviewBackButton onExit={onExit} />);

    const button = screen.getByRole('button', { name: /volver al estudio/i });
    fireEvent.click(button);

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
