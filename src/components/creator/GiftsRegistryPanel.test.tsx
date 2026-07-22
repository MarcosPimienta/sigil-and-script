import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../test-setup';
import { GiftsRegistryPanel } from './GiftsRegistryPanel';

let mockState = {
  design: {
    registryText: 'Sample registry message',
    registryLink: 'https://example.com/registry',
    registryImage: 'data:image/png;base64,fakeImage',
    registryImageScale: 50,
    language: 'ES',
  },
};

vi.mock('../../context/SigilContext', () => ({
  useSigilSelector: (selector: any) => selector(mockState),
}));

describe('GiftsRegistryPanel', () => {
  it('renders centered and correctly scaled registry image', () => {
    render(<GiftsRegistryPanel />);

    const img = screen.getByAltText('Registry decorative image');
    expect(img).toBeInTheDocument();
    
    // Scale is 50%, base max dimension is 120px -> expected 60px
    expect(img).toHaveStyle({
      maxWidth: '60px',
      maxHeight: '60px',
      margin: '0 auto',
      display: 'block',
    });

    const container = img.parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
  });

  it('defaults to 120px max dimensions at 100% default scale', () => {
    mockState = {
      design: {
        registryText: 'Sample registry message',
        registryLink: 'https://example.com/registry',
        registryImage: 'data:image/png;base64,fakeImage',
        registryImageScale: undefined as any,
        language: 'ES',
      },
    };

    render(<GiftsRegistryPanel />);

    const img = screen.getByAltText('Registry decorative image');
    expect(img).toHaveStyle({
      maxWidth: '120px',
      maxHeight: '120px',
    });
  });
});
