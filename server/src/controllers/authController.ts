import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';
import { sendPasswordResetEmail } from '../services/mailer';

// Lazy singleton — avoids crashing the module on Vercel cold start
let _prisma: PrismaClient | null = null;
const prisma = (): PrismaClient => { if (!_prisma) _prisma = new PrismaClient(); return _prisma; };

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid reset token'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Password-reset policy
export const RESET_TOKEN_TTL_MINUTES = 60;
export const RESET_REQUEST_WINDOW_MINUTES = 15;
export const RESET_REQUEST_MAX_PER_WINDOW = 3;
const RESET_INVALID_MESSAGE = 'This reset link is invalid or has expired';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

/** Builds the `salt:hash` record stored in `User.password`. */
function makePasswordRecord(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${hashPassword(password, salt)}`;
}

/** Only the hash of a reset token is ever persisted. */
function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function appUrl(): string {
  const raw = process.env.APP_URL || 'http://localhost:5173';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma().user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const user = await prisma().user.create({
      data: {
        email: email.toLowerCase(),
        password: makePasswordRecord(password),
        name: name || null,
      },
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma().user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const [salt, storedHash] = user.password.split(':');
    if (!salt || !storedHash) {
      res.status(500).json({ error: 'Database integrity error' });
      return;
    }

    const currentHash = hashPassword(password, salt);
    if (currentHash !== storedHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    await prisma().session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({ error: 'Missing session token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    await prisma().session.deleteMany({
      where: { token },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /auth/forgot-password
 * Always answers 200 for unknown emails (no account enumeration). Known users
 * are throttled to RESET_REQUEST_MAX_PER_WINDOW requests per window.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma().user.findUnique({ where: { email } });

    if (!user) {
      res.json({ success: true });
      return;
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - RESET_REQUEST_WINDOW_MINUTES * 60 * 1000);
    const recent = await prisma().passwordResetToken.count({
      where: { userId: user.id, createdAt: { gt: windowStart } },
    });
    if (recent >= RESET_REQUEST_MAX_PER_WINDOW) {
      res.status(429).json({
        error: `Too many reset requests. Please wait ${RESET_REQUEST_WINDOW_MINUTES} minutes and try again.`,
      });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma().$transaction([
      // Only the newest link should work
      prisma().passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: now },
      }),
      prisma().passwordResetToken.create({
        data: { tokenHash: hashResetToken(token), userId: user.id, expiresAt },
      }),
    ]);

    const link = `${appUrl()}/?reset=${token}`;
    await sendPasswordResetEmail({ to: user.email, link, expiresInMinutes: RESET_TOKEN_TTL_MINUTES });

    res.json({ success: true });
  } catch (error) {
    console.error('Error during forgot-password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /auth/reset-password
 * Consumes a single-use token, sets the new password and revokes all sessions.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.errors[0];
      // Do not distinguish malformed tokens from unknown ones
      const message = issue.path[0] === 'token' ? RESET_INVALID_MESSAGE : issue.message;
      res.status(400).json({ error: message });
      return;
    }

    const { token, password } = parsed.data;
    const record = await prisma().passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    const now = new Date();
    if (!record || record.usedAt || record.expiresAt < now) {
      res.status(400).json({ error: RESET_INVALID_MESSAGE });
      return;
    }

    await prisma().$transaction([
      prisma().user.update({
        where: { id: record.userId },
        data: { password: makePasswordRecord(password) },
      }),
      prisma().passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      }),
      prisma().session.deleteMany({ where: { userId: record.userId } }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error during reset-password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
