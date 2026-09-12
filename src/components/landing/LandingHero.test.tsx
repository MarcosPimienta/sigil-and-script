import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingHero } from './LandingHero';

describe('LandingHero', () => {
  it('renders brand, headline, and call-to-action buttons', () => {
    const onStartDesigning = vi.fn();
    const onSignIn = vi.fn();

    render(<LandingHero onStartDesigning={onStartDesigning} onSignIn={onSignIn} />);

    expect(screen.getByText(/Handcrafted Digital Invitations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^start designing$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('triggers onStartDesigning when clicking Create Your First Invitation', () => {
    const onStartDesigning = vi.fn();
    const onSignIn = vi.fn();

    render(<LandingHero onStartDesigning={onStartDesigning} onSignIn={onSignIn} />);

    const cta = screen.getByRole('button', { name: /create your first invitation/i });
    fireEvent.click(cta);
    expect(onStartDesigning).toHaveBeenCalledTimes(1);
  });

  it('switches template previews when clicking showcase tabs', () => {
    render(<LandingHero onStartDesigning={() => {}} onSignIn={() => {}} />);

    // Default is Wedding
    expect(screen.getByText('Elena & Marcus')).toBeInTheDocument();

    // Click Birthday tab
    const birthdayTab = screen.getByRole('button', { name: /birthday \/ cumpleaños/i });
    fireEvent.click(birthdayTab);

    expect(screen.getByText("Sophia's 30th Soirée")).toBeInTheDocument();
  });
});
