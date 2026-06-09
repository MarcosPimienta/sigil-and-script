import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DependentCheckbox } from './DependentCheckbox';
import type { Dependent } from '../../types/sigil.types';

const mockToggle = vi.fn();
const mockRemove = vi.fn();

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    toggleDependent: mockToggle,
    removeDependent: mockRemove,
  }),
}));

const dep: Dependent = { id: 'dep-1', name: 'Luca Martin', included: true };

describe('DependentCheckbox', () => {
  it('renders checked when included is true', () => {
    render(<DependentCheckbox dependent={dep} inviteeId="inv-1" inviteeName="Sophie Martin" />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('renders unchecked when included is false', () => {
    render(
      <DependentCheckbox
        dependent={{ ...dep, included: false }}
        inviteeId="inv-1"
        inviteeName="Sophie Martin"
      />,
    );
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('calls toggleDependent when checkbox changes', () => {
    render(<DependentCheckbox dependent={dep} inviteeId="inv-1" inviteeName="Sophie Martin" />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggle).toHaveBeenCalledWith('inv-1', 'dep-1');
  });

  it('calls removeDependent when remove button is clicked', () => {
    render(<DependentCheckbox dependent={dep} inviteeId="inv-1" inviteeName="Sophie Martin" />);
    fireEvent.click(screen.getByRole('button', { name: /remove luca martin/i }));
    expect(mockRemove).toHaveBeenCalledWith('inv-1', 'dep-1');
  });
});
