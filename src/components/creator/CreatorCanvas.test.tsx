import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatorCanvas } from './CreatorCanvas';
import { useSigilStore } from '../../state/sigilStore';
import { createDesignFromTemplate } from '../../templates';

const mockSetAppMode = vi.fn();
let currentAppMode = 'RECIPIENT';
let currentRoutingToken = 'preview';

vi.mock('./EnvelopeWrapper', () => ({
  EnvelopeWrapper: () => <div data-testid="mock-envelope" />,
}));

vi.mock('./sections/SectionStack', () => ({
  SectionStack: () => <div data-testid="mock-section-stack" />,
}));

vi.mock('./Toolbar', () => ({
  Toolbar: () => <header data-testid="mock-toolbar" />,
}));

vi.mock('./LeftPanel', () => ({
  LeftPanel: () => <aside data-testid="mock-left-panel" />,
}));

vi.mock('../../utils/audioEngine', () => ({
  audioEngine: {
    playCrack: vi.fn(),
    playAmbient: vi.fn(),
    setSongUrl: vi.fn(),
    getAudioElement: () => null,
    getMuted: () => false,
    setMute: vi.fn(),
  },
}));

vi.mock('../../context/SigilContext', () => {
  const getMockState = () => ({
    appMode: currentAppMode,
    design: useSigilStore.getState().design,
    guest: {
      guestName: 'Guest 1',
      routingToken: currentRoutingToken,
      language: 'ES',
      dependents: [],
    },
  });

  return {
    useSigil: () => ({
      state: getMockState(),
      setAppMode: mockSetAppMode,
    }),
    useSigilSelector: (selector: (state: any) => any) => selector(getMockState()),
  };
});

describe('CreatorCanvas Preview Back Button Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentAppMode = 'RECIPIENT';
    useSigilStore.setState({
      design: createDesignFromTemplate('WEDDING', 'ES'),
      user: { id: 'host-1', email: 'host@test.com', name: 'Test Host' } as any,
    });
  });

  it('renders PreviewBackButton when appMode is RECIPIENT for host preview', () => {
    render(<CreatorCanvas />);

    const backButton = screen.getByRole('button', { name: /volver al estudio/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('id', 'btn-preview-back-to-studio');
  });

  it('clicking PreviewBackButton calls setAppMode with CREATOR and sets mute', async () => {
    const { audioEngine } = await import('../../utils/audioEngine');
    render(<CreatorCanvas />);

    const backButton = screen.getByRole('button', { name: /volver al estudio/i });
    fireEvent.click(backButton);

    expect(mockSetAppMode).toHaveBeenCalledWith('CREATOR');
    expect(audioEngine.setMute).toHaveBeenCalledWith(true);
  });

  it('does NOT render PreviewBackButton for external guests on /invite/ route when not logged in', () => {
    useSigilStore.setState({ user: null });
    currentRoutingToken = 'abc-token';
    window.history.pushState({}, '', '/invite/abc-token');

    try {
      render(<CreatorCanvas />);
      const backButton = screen.queryByRole('button', { name: /volver al estudio/i });
      expect(backButton).not.toBeInTheDocument();
    } finally {
      window.history.pushState({}, '', '/');
      currentRoutingToken = 'preview';
    }
  });
});
