import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QrCardModal } from './QrCardModal';
import { useSigilStore } from '../../state/sigilStore';
import { createDesignFromTemplate } from '../../templates';
import type { InviteeRecord } from '../../types/sigil.types';

const mockInvitee: InviteeRecord = {
  id: 'guest-uuid-999',
  name: 'Lucía Fernández',
  guestType: 'INDIVIDUAL',
  status: 'PENDING',
  dependents: [],
  language: 'ES',
};

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
  });
});

describe('QrCardModal', () => {
  it('renders guest name and personalized QR card', () => {
    render(<QrCardModal invitee={mockInvitee} onClose={() => {}} />);

    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
    expect(screen.getByText(/tarjeta qr de invitación/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /imprimir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar enlace/i })).toBeInTheDocument();
  });

  it('calls onClose when close button (✕) is clicked', () => {
    const handleClose = vi.fn();
    render(<QrCardModal invitee={mockInvitee} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<QrCardModal invitee={mockInvitee} onClose={() => {}} />);

    const printBtn = screen.getByRole('button', { name: /imprimir/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('closes when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<QrCardModal invitee={mockInvitee} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
