import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { CreatorCanvas } from './CreatorCanvas';
import { useSigilStore } from '../../state/sigilStore';
import { createDesignFromTemplate } from '../../templates';

const mockSetAppMode = vi.fn();
const mockUpdateDesign = vi.fn();

vi.mock('./EnvelopeWrapper', () => ({
  EnvelopeWrapper: () => <div data-testid="mock-envelope" />,
}));

vi.mock('./sections/SectionStack', () => ({
  SectionStack: () => <div data-testid="mock-section-stack" />,
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
    appMode: 'CREATOR',
    design: useSigilStore.getState().design,
    guest: {
      guestName: 'Guest 1',
      routingToken: 'guest-1',
      language: 'ES',
      dependents: [],
    },
  });

  return {
    useSigil: () => ({
      state: getMockState(),
      setAppMode: mockSetAppMode,
      updateDesign: mockUpdateDesign,
    }),
    useSigilSelector: (selector: (state: any) => any) => selector(getMockState()),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    user: { id: 'host-1', email: 'host@test.com', name: 'Test Host' },
  });
});

describe('Mobile Creator Studio & Responsive Toolbar', () => {
  describe('Toolbar Mobile Controls', () => {
    it('renders mobile panel toggle and mobile menu button', () => {
      const onToggleMobilePanel = vi.fn();
      render(
        <Toolbar
          onToggleMobilePanel={onToggleMobilePanel}
          isMobilePanelOpen={false}
        />
      );

      const toggleBtn = screen.getByRole('button', { name: /edit design/i });
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveTextContent('✏️ Design');

      const menuBtn = screen.getByRole('button', { name: /open studio menu/i });
      expect(menuBtn).toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(onToggleMobilePanel).toHaveBeenCalledTimes(1);
    });

    it('shows preview label when mobile panel is open', () => {
      render(
        <Toolbar
          onToggleMobilePanel={vi.fn()}
          isMobilePanelOpen={true}
        />
      );

      const toggleBtn = screen.getByRole('button', { name: /view preview/i });
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveTextContent('👁️ Preview');
    });

    it('opens and closes mobile menu dropdown sheet', () => {
      const { container } = render(<Toolbar />);

      const menuBtn = screen.getByRole('button', { name: /open studio menu/i });
      expect(container.querySelector('.toolbar-mobile-dropdown')).toBeNull();

      // Open menu
      fireEvent.click(menuBtn);
      expect(container.querySelector('.toolbar-mobile-dropdown')).toBeInTheDocument();
      expect(screen.getByText(/workspace mode/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🎨 studio/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📋 dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🪑 floor plan/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /💾 save layout/i })).toBeInTheDocument();

      // Click backdrop to close
      const backdrop = container.querySelector('.toolbar-menu-backdrop');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(container.querySelector('.toolbar-mobile-dropdown')).toBeNull();
    });
  });

  describe('LeftPanel Drawer & Backdrop', () => {
    it('applies .mobile-open and renders backdrop when isOpen is true', () => {
      const onClose = vi.fn();
      const { container } = render(<LeftPanel isOpen={true} onClose={onClose} />);

      const panel = container.querySelector('aside.left-panel');
      expect(panel).toHaveClass('mobile-open');

      const backdrop = container.querySelector('.mobile-panel-backdrop');
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('triggers onClose when header close button (✕) is clicked', () => {
      const onClose = vi.fn();
      render(<LeftPanel isOpen={true} onClose={onClose} />);

      const closeBtn = screen.getByRole('button', { name: /close design panel/i });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('CreatorCanvas Mobile Integration', () => {
    it('toggles mobile panel drawer with floating button', () => {
      const { container } = render(<CreatorCanvas />);

      const floatingToggle = screen.getByRole('button', { name: /open design controls/i });
      expect(floatingToggle).toBeInTheDocument();
      expect(floatingToggle).toHaveTextContent('✏️ Design Controls');

      // Click to open
      fireEvent.click(floatingToggle);
      const panel = container.querySelector('aside.left-panel');
      expect(panel).toHaveClass('mobile-open');
      expect(floatingToggle).toHaveTextContent('✕ Close Controls');

      // Click to close
      fireEvent.click(floatingToggle);
      expect(panel).not.toHaveClass('mobile-open');
    });

    it('toggles mobile panel drawer via top toolbar mobile toggle button', () => {
      const { container } = render(<CreatorCanvas />);

      const toolbarToggle = screen.getByRole('button', { name: /edit design/i });
      expect(toolbarToggle).toBeInTheDocument();

      // Click to open
      fireEvent.click(toolbarToggle);
      const panel = container.querySelector('aside.left-panel');
      expect(panel).toHaveClass('mobile-open');

      // Click to close via preview button
      const previewToggle = screen.getByRole('button', { name: /view preview/i });
      fireEvent.click(previewToggle);
      expect(panel).not.toHaveClass('mobile-open');
    });
  });
});
