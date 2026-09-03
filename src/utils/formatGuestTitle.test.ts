import { describe, it, expect } from 'vitest';
import {
  formatGuestTitleName,
  formatFullInvitationTitle,
} from './formatGuestTitle';

describe('formatGuestTitleName', () => {
  it('formats 0 dependents as primary name only', () => {
    const guest = { name: 'Oscar', dependents: [] };
    expect(formatGuestTitleName(guest, 'ES')).toBe('Oscar');
    expect(formatGuestTitleName(guest, 'EN')).toBe('Oscar');
  });

  it('formats 1 dependent with "y" in Spanish and "&" in English', () => {
    const guest = { name: 'Oscar', dependents: [{ name: 'Diana', included: true }] };
    expect(formatGuestTitleName(guest, 'ES')).toBe('Oscar y Diana');
    expect(formatGuestTitleName(guest, 'EN')).toBe('Oscar & Diana');
  });

  it('formats 2+ dependents with "y Familia" in Spanish and "& Family" in English', () => {
    const guest = {
      name: 'Oscar',
      dependents: [
        { name: 'Diana', included: true },
        { name: 'Mateo', included: true },
      ],
    };
    expect(formatGuestTitleName(guest, 'ES')).toBe('Oscar y Familia');
    expect(formatGuestTitleName(guest, 'EN')).toBe('Oscar & Family');
  });

  it('formats FAMILY guestType correctly in Spanish and English', () => {
    const guest = { name: 'Gómez Pérez', guestType: 'FAMILY', dependents: [] };
    expect(formatGuestTitleName(guest, 'ES')).toBe('Familia Gómez Pérez');
    expect(formatGuestTitleName(guest, 'EN')).toBe('Gómez Pérez Family');
  });

  it('ignores excluded dependents', () => {
    const guest = {
      name: 'Oscar',
      dependents: [
        { name: 'Diana', included: true },
        { name: 'Mateo', included: false },
      ],
    };
    expect(formatGuestTitleName(guest, 'ES')).toBe('Oscar y Diana');
  });
});

describe('formatFullInvitationTitle', () => {
  it('formats full invitation title for 0 dependents in Spanish', () => {
    const guest = { name: 'Oscar', dependents: [] };
    const title = formatFullInvitationTitle(guest, 'Marcos & Diana', 'ES');
    expect(title).toBe('Invitación para Oscar al Matrimonio de Marcos & Diana');
  });

  it('formats full invitation title for 1 dependent in Spanish', () => {
    const guest = { name: 'Oscar', dependents: [{ name: 'Diana', included: true }] };
    const title = formatFullInvitationTitle(guest, 'Marcos & Diana', 'ES');
    expect(title).toBe('Invitación para Oscar y Diana al Matrimonio de Marcos & Diana');
  });

  it('formats full invitation title for 2+ dependents in Spanish', () => {
    const guest = {
      name: 'Oscar',
      dependents: [
        { name: 'Diana', included: true },
        { name: 'Sofía', included: true },
      ],
    };
    const title = formatFullInvitationTitle(guest, 'Marcos & Diana', 'ES');
    expect(title).toBe('Invitación para Oscar y Familia al Matrimonio de Marcos & Diana');
  });

  it('formats full invitation title for 1 dependent in English', () => {
    const guest = { name: 'Oscar', dependents: [{ name: 'Diana', included: true }] };
    const title = formatFullInvitationTitle(guest, 'Marcos & Diana', 'EN');
    expect(title).toBe('Invitation for Oscar & Diana to Marcos & Diana Wedding');
  });

  it('phrases other event types', () => {
    const guest = { name: 'Oscar', dependents: [] };
    expect(formatFullInvitationTitle(guest, 'Sofía', 'ES', 'BIRTHDAY')).toBe('Invitación para Oscar al Cumpleaños de Sofía');
    expect(formatFullInvitationTitle(guest, 'Sofía', 'EN', 'BIRTHDAY')).toBe("Invitation for Oscar to Sofía's Birthday");
    expect(formatFullInvitationTitle(guest, 'Mateo', 'ES', 'BAPTISM')).toBe('Invitación para Oscar al Bautizo de Mateo');
    // Spanish grammar: a title that itself begins with a feminine event noun takes "a la"
    expect(formatFullInvitationTitle(guest, 'Gala Anual', 'ES', 'CORPORATE')).toBe('Invitación para Oscar a la Gala Anual');
    expect(formatFullInvitationTitle(guest, 'Acme Summit 2027', 'ES', 'CORPORATE')).toBe('Invitación para Oscar a Acme Summit 2027');
    expect(formatFullInvitationTitle(guest, 'Boda de Ana y Luis', 'ES', 'WEDDING')).toBe('Invitación para Oscar a la Boda de Ana y Luis');
    expect(formatFullInvitationTitle(guest, '', 'ES', 'CUSTOM')).toBe('Invitación para Oscar a Evento');
  });
});
