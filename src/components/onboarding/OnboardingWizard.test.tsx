import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingWizard } from './OnboardingWizard';

const mockRegister = vi.fn();
const mockResetToDefaults = vi.fn();
const mockUpdateDesign = vi.fn();
const mockSaveCurrentDesign = vi.fn();
const mockSetAppMode = vi.fn();

vi.mock('../../state/sigilStore', () => ({
  useSigilStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      register: mockRegister,
      resetToDefaults: mockResetToDefaults,
      updateDesign: mockUpdateDesign,
      saveCurrentDesign: mockSaveCurrentDesign,
      setAppMode: mockSetAppMode,
    }),
}));

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates password length and matching passwords in Step 1', async () => {
    render(<OnboardingWizard onClose={() => {}} onSuccess={() => {}} />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to event setup/i }));

    expect(await screen.findByText(/at least 12 characters/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('completes the 3-step onboarding journey and launches Studio', async () => {
    mockRegister.mockResolvedValue(true);
    mockSaveCurrentDesign.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    render(<OnboardingWizard onClose={() => {}} onSuccess={onSuccess} />);

    // Step 1: Account
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Elena Rostova' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'elena@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'validpassword1234' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'validpassword1234' } });

    fireEvent.click(screen.getByRole('button', { name: /continue to event setup/i }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('elena@example.com', 'validpassword1234', 'Elena Rostova'));

    // Step 2: What are you celebrating?
    expect(await screen.findByText(/what are you celebrating\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next details/i }));

    // Step 3: Essentials
    expect(await screen.findByText(/celebration essentials/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/event title or honorees/i), { target: { value: 'Elena & Marcus Gala' } });
    fireEvent.click(screen.getByRole('button', { name: /launch studio & customize/i }));

    await waitFor(() => {
      expect(mockResetToDefaults).toHaveBeenCalled();
      expect(mockUpdateDesign).toHaveBeenCalled();
      expect(mockSaveCurrentDesign).toHaveBeenCalled();
      expect(mockSetAppMode).toHaveBeenCalledWith('CREATOR');
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
