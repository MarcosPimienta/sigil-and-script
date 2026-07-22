import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../test-setup';
import { InvitationStage } from './InvitationStage';

let mockState = {
  design: {
    borderStyle: 'clean',
    paperTexture: 'parchment',
    headerImage: 'data:image/png;base64,testHeader',
    headerImageScale: 50,
    textBlocks: [
      { id: 'tb-headline', content: 'Matrimonio de Marcos & Diana', style: {} },
    ],
  },
  guest: { name: 'Esteemed Guest' },
  canvasSelection: { selectedTextBlockId: null },
};

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    state: mockState,
    dispatch: vi.fn(),
    selectTextBlock: vi.fn(),
    focusInspector: vi.fn(),
    updateTextBlock: vi.fn(),
  }),
}));

describe('InvitationStage', () => {
  it('renders header title image scaled according to headerImageScale', () => {
    render(<InvitationStage />);

    const img = screen.getByAltText('Event Title Artwork');
    expect(img).toBeInTheDocument();

    // 50% of 280px = 140px, 50% of 200px = 100px
    expect(img).toHaveStyle({
      maxWidth: '140px',
      maxHeight: '100px',
      display: 'block',
      margin: '0 auto',
    });
  });
});
