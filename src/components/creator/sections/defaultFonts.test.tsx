// Default typography: the invitation-wide fonts set in Estilo are applied at
// the stack root and inherited by every section that does not override them.
//
// The first test is the important one — it is the guarantee that an invitation
// saved before defaultFonts existed renders exactly as it always did.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '../../../test-setup';
import type { InvitationDesign, InvitationSection } from '../../../types/sigil.types';
import { HEADING_FONT_VAR, BODY_FONT_VAR } from '../../../utils/fonts';

import { createSection } from '../../../utils/sectionDefaults';

const sections: InvitationSection[] = [createSection('TEXT', 'ES'), createSection('TEXT', 'ES')];

let design: Partial<InvitationDesign> = {};

vi.mock('../../../context/SigilContext', () => ({
  useSigil: () => ({ state: { design, guest: { language: 'ES' } } }),
  useSigilSelector: (fn: (s: unknown) => unknown) => fn({ design, guest: { language: 'ES' } }),
}));

vi.mock('../../../state/sigilStore', () => ({
  useSigilStore: (fn: (s: unknown) => unknown) =>
    fn({ focusInspector: () => {}, inspectorFocus: { type: 'NONE' } }),
}));

async function renderStack() {
  const { SectionStack } = await import('./SectionStack');
  return render(<SectionStack mode="recipient" />);
}

beforeEach(() => {
  design = { language: 'ES', sections };
});

describe('invitation-wide default fonts', () => {
  it('sets no font variables at all when the design has none', async () => {
    const { container } = await renderStack();
    const root = container.querySelector('.recipient-invite-details') as HTMLElement;
    expect(root.style.getPropertyValue(HEADING_FONT_VAR)).toBe('');
    expect(root.style.getPropertyValue(BODY_FONT_VAR)).toBe('');
  });

  it('puts the chosen defaults on the root, where sections inherit them', async () => {
    design = {
      ...design,
      defaultFonts: { heading: "'Playfair Display', serif", body: "'Spectral', serif" },
    };
    const { container } = await renderStack();
    const root = container.querySelector('.recipient-invite-details') as HTMLElement;
    expect(root.style.getPropertyValue(HEADING_FONT_VAR)).toBe("'Playfair Display', serif");
    expect(root.style.getPropertyValue(BODY_FONT_VAR)).toBe("'Spectral', serif");
  });

  it("lets a section's own font win over the default", async () => {
    design = {
      ...design,
      defaultFonts: { heading: "'Playfair Display', serif" },
      sections: [
        sections[0],
        { ...sections[1], fonts: { heading: "'Cinzel Decorative', serif" } },
      ],
    };
    const { container } = await renderStack();
    const wrappers = container.querySelectorAll('.recipient-invite-details > div');

    // The first section sets nothing, so it inherits the root's default.
    expect((wrappers[0] as HTMLElement).style.getPropertyValue(HEADING_FONT_VAR)).toBe('');
    // The second overrides exactly that one variable.
    expect((wrappers[1] as HTMLElement).style.getPropertyValue(HEADING_FONT_VAR)).toBe(
      "'Cinzel Decorative', serif",
    );
  });
});
