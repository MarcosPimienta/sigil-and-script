import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipientRsvpPanel } from './RecipientRsvpPanel';

const mockSubmitRsvp = vi.fn();

const mockState = {
  design: {
    language: 'EN',
    eventType: 'WEDDING',
    rsvpFormConfig: {
      requireMealPreference: true,
      requireDietaryRestrictions: true,
      allowPlusOnes: false,
      mealOptions: ['Beef', 'Fish', 'Vegan'],
    },
  },
  guest: {
    guestName: 'Jane Doe',
    routingToken: 'test-token-123',
    language: 'EN',
    dependents: [
      { id: 'dep-1', name: 'John Doe', included: false },
      { id: 'dep-2', name: 'Baby Doe', included: true },
    ],
  },
};

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    state: mockState,
    submitRsvp: mockSubmitRsvp,
  }),
}));

describe('RecipientRsvpPanel', () => {
  it('renders within .recipient-rsvp-card and does not use .left-panel class', () => {
    const { container } = render(<RecipientRsvpPanel />);
    const card = container.querySelector('.recipient-rsvp-card');
    expect(card).toBeInTheDocument();
    expect(container.querySelector('aside.left-panel')).toBeNull();
  });

  it('renders touch-friendly attendance choice buttons and toggles active state', () => {
    const { container } = render(<RecipientRsvpPanel />);
    const yesBtn = screen.getByRole('button', { name: /yes/i });
    const noBtn = screen.getByRole('button', { name: /no/i });

    expect(yesBtn).toHaveClass('rsvp-choice-btn');
    expect(noBtn).toHaveClass('rsvp-choice-btn');

    // Initially submit is disabled
    const submitBtn = screen.getByRole('button', { name: /submit|send/i });
    expect(submitBtn).toBeDisabled();

    // Click Yes
    fireEvent.click(yesBtn);
    expect(submitBtn).not.toBeDisabled();
    expect(container.querySelector('#meal-preference')).toBeInTheDocument();
  });

  it('renders touch-friendly dependent family rows with checkboxes', () => {
    const { container } = render(<RecipientRsvpPanel />);
    const yesBtn = screen.getByRole('button', { name: /yes/i });
    fireEvent.click(yesBtn);

    const rows = container.querySelectorAll('.rsvp-dependent-row');
    expect(rows.length).toBe(2);

    const checkboxes = container.querySelectorAll('.rsvp-dependent-checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('renders decoupled .recipient-rsvp-card on submitted state', () => {
    const { container } = render(<RecipientRsvpPanel />);
    const yesBtn = screen.getByRole('button', { name: /yes/i });
    fireEvent.click(yesBtn);

    const mealSelect = screen.getByLabelText(/meal preference/i);
    fireEvent.change(mealSelect, { target: { value: 'Vegan' } });

    const dietaryInput = screen.getByLabelText(/dietary/i);
    fireEvent.change(dietaryInput, { target: { value: 'Gluten-free' } });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(mockSubmitRsvp).toHaveBeenCalled();
    const card = container.querySelector('.recipient-rsvp-card');
    expect(card).toBeInTheDocument();
    expect(container.querySelector('aside.left-panel')).toBeNull();
  });
});
