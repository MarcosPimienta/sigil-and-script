import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QrTab } from './QrTab';
import { PanelShell } from './PanelShell';
import { useSigilStore } from '../../../state/sigilStore';
import { createDesignFromTemplate } from '../../../templates';

const store = () => useSigilStore.getState();

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    panelTab: 'QR',
  });
});

describe('QrTab', () => {
  it('renders theme and size options and updates design state', () => {
    render(<QrTab />);

    const themeSelect = screen.getByLabelText(/tema de la tarjeta/i);
    fireEvent.change(themeSelect, { target: { value: 'MODERN_DARK' } });
    expect(store().design.qrCard?.theme).toBe('MODERN_DARK');

    const sizeSelect = screen.getByLabelText(/tamaño de impresión/i);
    fireEvent.change(sizeSelect, { target: { value: '3.5x2' } });
    expect(store().design.qrCard?.cardSize).toBe('3.5x2');
  });

  it('updates custom headline and scan instructions', () => {
    render(<QrTab />);

    const headlineInput = screen.getByLabelText(/título o encabezado/i);
    fireEvent.change(headlineInput, { target: { value: 'Nuestra Gran Noche' } });
    expect(store().design.qrCard?.headline).toBe('Nuestra Gran Noche');

    const instructionsInput = screen.getByLabelText(/instrucciones de escaneo/i);
    fireEvent.change(instructionsInput, { target: { value: 'Por favor confirma antes del viernes' } });
    expect(store().design.qrCard?.instructionsText).toBe('Por favor confirma antes del viernes');
  });

  it('toggles guest name and seal options', () => {
    render(<QrTab />);

    const sealCheckbox = screen.getByLabelText(/incluir sello/i);
    fireEvent.click(sealCheckbox);
    expect(store().design.qrCard?.includeSealLogo).toBe(true);

    const guestCheckbox = screen.getByLabelText(/personalizar con nombre/i);
    fireEvent.click(guestCheckbox);
    expect(store().design.qrCard?.includeGuestName).toBe(false);
  });
});

describe('PanelShell with QR Tab', () => {
  it('switches to the QR tab when tab is clicked', () => {
    useSigilStore.setState({ panelTab: 'EVENT' });
    render(<PanelShell />);

    const qrTabBtn = screen.getByRole('tab', { name: /código qr/i });
    expect(qrTabBtn).toBeTruthy();

    fireEvent.click(qrTabBtn);
    expect(store().panelTab).toBe('QR');
  });
});
