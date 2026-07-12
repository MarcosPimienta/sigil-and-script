import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormConfiguratorPanel } from './FormConfiguratorPanel';

const mockUpdateDesign = vi.fn();
const mockState: any = {
  design: {
    rsvpFormConfig: {
      requireMealPreference: false,
      requireDietaryRestrictions: false,
      allowPlusOnes: false,
      customNotesLabel: null,
    },
  },
};

beforeEach(() => {
  mockUpdateDesign.mockClear();
});

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    state: mockState,
    updateDesign: mockUpdateDesign,
  }),
}));

describe('FormConfiguratorPanel', () => {
  it('renders checkboxes with correct checked states', () => {
    render(<FormConfiguratorPanel />);
    const mealCheckbox = screen.getByLabelText(/require meal preference/i) as HTMLInputElement;
    const dietaryCheckbox = screen.getByLabelText(/dietary restrictions field/i) as HTMLInputElement;
    const plusOneCheckbox = screen.getByLabelText(/allow plus-ones/i) as HTMLInputElement;

    expect(mealCheckbox.checked).toBe(false);
    expect(dietaryCheckbox.checked).toBe(false);
    expect(plusOneCheckbox.checked).toBe(false);
  });

  it('triggers updateDesign when checkbox clicked', () => {
    render(<FormConfiguratorPanel />);
    const mealCheckbox = screen.getByLabelText(/require meal preference/i);
    fireEvent.click(mealCheckbox);
    expect(mockUpdateDesign).toHaveBeenCalledWith({
      rsvpFormConfig: {
        requireMealPreference: true,
        requireDietaryRestrictions: false,
        allowPlusOnes: false,
        customNotesLabel: null,
      },
    });
  });

  it('triggers updateDesign when notes input changes', () => {
    render(<FormConfiguratorPanel />);
    const notesInput = screen.getByLabelText(/custom notes label/i);
    fireEvent.change(notesInput, { target: { value: 'Couples wish' } });
    expect(mockUpdateDesign).toHaveBeenCalledWith({
      rsvpFormConfig: {
        requireMealPreference: false,
        requireDietaryRestrictions: false,
        allowPlusOnes: false,
        customNotesLabel: 'Couples wish',
      },
    });
  });
});
