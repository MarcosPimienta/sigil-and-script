import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventTypePicker } from './EventTypePicker';

const onSelect = vi.fn();
const onCancel = vi.fn();

beforeEach(() => {
  onSelect.mockClear();
  onCancel.mockClear();
});

describe('EventTypePicker', () => {
  it('lists the five templates in Spanish by default', () => {
    render(<EventTypePicker onSelect={onSelect} onCancel={onCancel} />);
    for (const label of ['Boda', 'Cumpleaños', 'Bautizo', 'Corporativo', 'Otro evento']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('switches the copy to English', () => {
    render(<EventTypePicker onSelect={onSelect} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create invitation/i })).toBeInTheDocument();
  });

  it('creates with the chosen type and language', () => {
    render(<EventTypePicker onSelect={onSelect} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.click(screen.getByText('Birthday'));
    fireEvent.click(screen.getByRole('button', { name: /create invitation/i }));
    expect(onSelect).toHaveBeenCalledWith('BIRTHDAY', 'EN');
  });

  it('defaults to WEDDING/ES and can be cancelled', () => {
    render(<EventTypePicker onSelect={onSelect} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /crear invitación/i }));
    expect(onSelect).toHaveBeenCalledWith('WEDDING', 'ES');
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
