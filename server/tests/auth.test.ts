import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

vi.mock('../src/services/mailer', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendPasswordResetEmail } from '../src/services/mailer';
import app from '../src/index';

const prisma = new PrismaClient();
const mailerMock = vi.mocked(sendPasswordResetEmail);

const TEST_EMAIL = `reset-test-${Date.now()}@example.com`;
const ORIGINAL_PASSWORD = 'original-pass';
const NEW_PASSWORD = 'brand-new-pass';

/** Extracts the raw token from the emailed link captured by the mailer mock. */
function lastEmailedToken(): string {
  const call = mailerMock.mock.calls.at(-1);
  if (!call) throw new Error('mailer was not called');
  const link = call[0].link;
  const m = /[?&]reset=([a-f0-9]{64})/.exec(link);
  if (!m) throw new Error(`no reset token in link: ${link}`);
  return m[1];
}

describe('Password recovery', () => {
  let userId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: TEST_EMAIL, password: ORIGINAL_PASSWORD, name: 'Reset Tester' });
    expect(res.status).toBe(201);
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    mailerMock.mockClear();
    // Reset throttling state between tests
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  });

  describe('POST /auth/forgot-password', () => {
    it('rejects an invalid email address', async () => {
      const res = await request(app).post('/auth/forgot-password').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(mailerMock).not.toHaveBeenCalled();
    });

    it('answers 200 for an unknown email and sends nothing', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody-here@example.com' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mailerMock).not.toHaveBeenCalled();
    });

    it('creates one unused token and emails a ?reset= link for a known email', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: TEST_EMAIL.toUpperCase() }); // case-insensitive
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });

      expect(mailerMock).toHaveBeenCalledTimes(1);
      const arg = mailerMock.mock.calls[0][0];
      expect(arg.to).toBe(TEST_EMAIL);
      expect(arg.link).toMatch(/\/\?reset=[a-f0-9]{64}$/);
      expect(arg.expiresInMinutes).toBe(60);

      const tokens = await prisma.passwordResetToken.findMany({ where: { userId } });
      expect(tokens).toHaveLength(1);
      expect(tokens[0].usedAt).toBeNull();
      expect(tokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now() + 55 * 60 * 1000);
      // Only the hash is stored
      expect(tokens[0].tokenHash).not.toBe(lastEmailedToken());
      expect(tokens[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('a second request invalidates the first link', async () => {
      await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      const firstToken = lastEmailedToken();
      await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      const secondToken = lastEmailedToken();
      expect(secondToken).not.toBe(firstToken);

      const stale = await request(app)
        .post('/auth/reset-password')
        .send({ token: firstToken, password: NEW_PASSWORD });
      expect(stale.status).toBe(400);
      expect(stale.body.error).toBe('This reset link is invalid or has expired');

      const unused = await prisma.passwordResetToken.count({ where: { userId, usedAt: null } });
      expect(unused).toBe(1);
    });

    it('throttles after three requests in the window', async () => {
      for (let i = 0; i < 3; i++) {
        const ok = await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
        expect(ok.status).toBe(200);
      }
      const blocked = await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      expect(blocked.status).toBe(429);
      expect(blocked.body.error).toMatch(/wait 15 minutes/);
      expect(mailerMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('rejects malformed, unknown and expired tokens with one generic message', async () => {
      const malformed = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'abc', password: NEW_PASSWORD });
      expect(malformed.status).toBe(400);
      expect(malformed.body.error).toBe('This reset link is invalid or has expired');

      const unknown = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'f'.repeat(64), password: NEW_PASSWORD });
      expect(unknown.status).toBe(400);
      expect(unknown.body.error).toBe('This reset link is invalid or has expired');

      await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      const token = lastEmailedToken();
      await prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      const expired = await request(app)
        .post('/auth/reset-password')
        .send({ token, password: NEW_PASSWORD });
      expect(expired.status).toBe(400);
      expect(expired.body.error).toBe('This reset link is invalid or has expired');
    });

    it('rejects a weak password and keeps the token valid', async () => {
      await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      const token = lastEmailedToken();

      const weak = await request(app).post('/auth/reset-password').send({ token, password: '123' });
      expect(weak.status).toBe(400);
      expect(weak.body.error).toMatch(/at least 6 characters/);

      const record = await prisma.passwordResetToken.findFirst({ where: { userId } });
      expect(record?.usedAt).toBeNull();
    });

    it('sets the new password, revokes sessions and consumes the token', async () => {
      // Existing session that must die with the reset
      const login = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: ORIGINAL_PASSWORD });
      expect(login.status).toBe(200);
      const oldSession = login.body.token as string;

      const before = await request(app).get('/canvas').set('Authorization', `Bearer ${oldSession}`);
      expect(before.status).toBe(200);

      await request(app).post('/auth/forgot-password').send({ email: TEST_EMAIL });
      const token = lastEmailedToken();

      const reset = await request(app)
        .post('/auth/reset-password')
        .send({ token, password: NEW_PASSWORD });
      expect(reset.status).toBe(200);
      expect(reset.body).toEqual({ success: true });

      // Old password no longer works, new one does
      const oldLogin = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: ORIGINAL_PASSWORD });
      expect(oldLogin.status).toBe(401);
      const newLogin = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: NEW_PASSWORD });
      expect(newLogin.status).toBe(200);

      // Pre-reset session is revoked
      const after = await request(app).get('/canvas').set('Authorization', `Bearer ${oldSession}`);
      expect(after.status).toBe(401);

      // Token is single-use
      const reuse = await request(app)
        .post('/auth/reset-password')
        .send({ token, password: 'yet-another-pass' });
      expect(reuse.status).toBe(400);

      const record = await prisma.passwordResetToken.findFirst({ where: { userId } });
      expect(record?.usedAt).not.toBeNull();

      // Restore for any later test ordering
      await request(app).post('/auth/logout').set('Authorization', `Bearer ${newLogin.body.token}`);
    });
  });
});
