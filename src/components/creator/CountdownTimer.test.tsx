import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

let mockCountdownTarget = '';

vi.mock('../../context/SigilContext', () => ({
  useSigilSelector: (selector: any) =>
    selector({
      design: { countdownTarget: mockCountdownTarget },
    }),
}));

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders null if countdownTarget is missing', () => {
    mockCountdownTarget = '';
    const { container } = render(<CountdownTimer />);
    expect(container.firstChild).toBeNull();
  });

  it('calculates and shows the remaining time units correctly', () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(targetDate.getHours() + 3);
    targetDate.setMinutes(targetDate.getMinutes() + 5);

    mockCountdownTarget = targetDate.toISOString();

    render(<CountdownTimer />);

    expect(screen.getByText('02')).toBeTruthy();
    expect(screen.getByText('03')).toBeTruthy();
    expect(screen.getByText('05')).toBeTruthy();
  });

  it('stops at 00 units if target date is in the past', () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1);

    mockCountdownTarget = targetDate.toISOString();

    render(<CountdownTimer />);

    const zeroes = screen.getAllByText('00');
    expect(zeroes.length).toBeGreaterThanOrEqual(3);
  });
});
