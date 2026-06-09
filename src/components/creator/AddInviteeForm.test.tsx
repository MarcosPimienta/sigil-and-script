import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddInviteeForm } from './AddInviteeForm';

const mockAddInvitee = vi.fn();

beforeEach(() => mockAddInvitee.mockClear());

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({ addInvitee: mockAddInvitee }),
}));

describe('AddInviteeForm', () => {
  it('calls addInvitee with trimmed name on submit', () => {
    render(<AddInviteeForm />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: '  Sophie  ' } });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
    expect(mockAddInvitee).toHaveBeenCalledWith('Sophie', undefined);
  });

  it('shows validation error and does not call addInvitee for empty name', () => {
    render(<AddInviteeForm />);
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Guest name is required')).toBeTruthy();
    expect(mockAddInvitee).not.toHaveBeenCalled();
  });

  it('clears fields after successful submit', () => {
    render(<AddInviteeForm />);
    const nameInput = screen.getByLabelText(/guest name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Sophie' } });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
    expect(nameInput.value).toBe('');
  });

  it('passes email when provided', () => {
    render(<AddInviteeForm />);
    fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'Sophie' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'sophie@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
    expect(mockAddInvitee).toHaveBeenCalledWith('Sophie', 'sophie@example.com');
  });
});
