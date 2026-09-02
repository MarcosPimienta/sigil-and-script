// ─────────────────────────────────────────────────────────────────────────────
// Mailer — transactional email via Resend, with a console fallback.
//
// Env:
//   RESEND_API_KEY  Resend API key. When unset, emails are logged instead of sent
//                   (local development, CI).
//   MAIL_FROM       Sender identity, e.g. "Sigil & Script <noreply@example.com>".
//                   The domain must be verified in Resend.
//
// Every function here resolves even on provider failure: callers must not leak
// "email failed" to clients (account enumeration), so errors are logged only.
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from 'resend';

export interface PasswordResetEmail {
  to: string;
  link: string;
  /** Minutes until the link expires — used in the copy. */
  expiresInMinutes: number;
}

const DEFAULT_FROM = 'Sigil & Script <onboarding@resend.dev>';

let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function renderPasswordResetEmail({ link, expiresInMinutes }: Omit<PasswordResetEmail, 'to'>): { subject: string; text: string; html: string } {
  const subject = 'Reset your Sigil & Script password';
  const text = [
    'We received a request to reset the password for your Sigil & Script account.',
    '',
    `Open this link to choose a new password (valid for ${expiresInMinutes} minutes):`,
    link,
    '',
    "If you didn't request this, you can safely ignore this email — your password will not change.",
  ].join('\n');
  const safeLink = escapeHtml(link);
  const html = `
<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2c1e11;">
  <h1 style="font-weight: 400; font-size: 22px; letter-spacing: 0.04em; margin: 0 0 16px;">Sigil &amp; Script</h1>
  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px;">We received a request to reset the password for your account.</p>
  <p style="margin: 0 0 24px;">
    <a href="${safeLink}" style="display: inline-block; background: #991b1b; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 15px;">Choose a new password</a>
  </p>
  <p style="font-size: 13px; line-height: 1.5; color: #6b5a4a; margin: 0 0 8px;">This link is valid for ${expiresInMinutes} minutes. If the button doesn't work, copy this address into your browser:</p>
  <p style="font-size: 12px; word-break: break-all; margin: 0 0 24px;"><a href="${safeLink}" style="color: #991b1b;">${safeLink}</a></p>
  <p style="font-size: 13px; line-height: 1.5; color: #6b5a4a; margin: 0;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
</div>`.trim();
  return { subject, text, html };
}

export async function sendPasswordResetEmail(email: PasswordResetEmail): Promise<void> {
  const { subject, text, html } = renderPasswordResetEmail(email);
  const resend = getResend();

  if (!resend) {
    console.log(`[mailer] RESEND_API_KEY not set — password reset link for ${email.to}: ${email.link}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: email.to,
      subject,
      text,
      html,
    });
    if (error) {
      console.error('[mailer] Resend rejected the password reset email:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[mailer] Password reset link for ${email.to}: ${email.link}`);
      }
    }
  } catch (err) {
    console.error('[mailer] Failed to send password reset email:', err);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[mailer] Password reset link for ${email.to}: ${email.link}`);
    }
  }
}
