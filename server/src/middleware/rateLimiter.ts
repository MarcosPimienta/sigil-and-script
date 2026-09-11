import rateLimit from 'express-rate-limit';

const isTestEnv = () => process.env.NODE_ENV === 'test';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  statusCode: 429,
  skip: isTestEnv,
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration requests from this IP. Please try again in 15 minutes.' },
  statusCode: 429,
  skip: isTestEnv,
});

export const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many RSVP submissions from this IP. Please try again in 15 minutes.' },
  statusCode: 429,
  skip: isTestEnv,
});
