import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EnvelopeWrapper } from './EnvelopeWrapper';

const mockPlayCrack = vi.fn();
const mockPlayAmbient = vi.fn();

vi.mock('../../utils/audioEngine', () => ({
  audioEngine: {
    playCrack: () => mockPlayCrack(),
    playAmbient: () => mockPlayAmbient(),
    getMuted: () => false,
    setMute: () => {},
  },
}));

let mockState = {
  design: { envelopeStyle: 'CLASSIC', backgroundColor: '#e0cfa9', openedEnvelopeImage: 'data:image/png;base64,testLogo', openedEnvelopeImageScale: 50 },
};

vi.mock('../../context/SigilContext', () => ({
  useSigilSelector: (selector: any) => selector(mockState),
}));

describe('EnvelopeWrapper', () => {
  beforeEach(() => {
    mockPlayCrack.mockClear();
    mockPlayAmbient.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in CLOSED phase and displays wax seal button', () => {
    render(
      <EnvelopeWrapper>
        <div>Test Letter</div>
      </EnvelopeWrapper>,
    );
    expect(screen.getByLabelText(/break wax seal/i)).toBeTruthy();
  });

  it('runs opening animation phases on seal click', () => {
    render(
      <EnvelopeWrapper>
        <div>Test Letter</div>
      </EnvelopeWrapper>,
    );
    const seal = screen.getByLabelText(/break wax seal/i);

    fireEvent.click(seal);
    expect(mockPlayCrack).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(mockPlayAmbient).toHaveBeenCalled();
  });

  it('renders event title logo scaled according to openedEnvelopeImageScale', () => {
    render(
      <EnvelopeWrapper>
        <div>Test Letter</div>
      </EnvelopeWrapper>,
    );

    const logo = screen.getByAltText('Event Logo');
    expect(logo).toBeInTheDocument();
    // 50% of 220px = 110px, 50% of 280px = 140px
    expect(logo).toHaveStyle({
      maxWidth: '110px',
      maxHeight: '140px',
    });
  });
});
