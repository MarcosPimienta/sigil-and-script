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
    expect(title).toBe('Invitation for Oscar & Diana to Wedding of Marcos & Diana');
  });
});
