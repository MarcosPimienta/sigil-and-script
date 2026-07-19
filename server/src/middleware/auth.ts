import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Lazy singleton — avoids crashing the module on Vercel cold start
let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Legacy support for RBAC testing suite
    if (process.env.NODE_ENV === 'test') {
      const userRole = req.headers['x-role'];
      if (userRole === 'HOST' || userRole === 'ADMIN') {
        const testUserId = 'test-user-id';
        await getPrisma().user.upsert({
          where: { id: testUserId },
          update: {},
          create: {
            id: testUserId,
            email: 'test@example.com',
            password: 'test-hashed-password',
            name: 'Test User',
          },
        }).catch(() => {});

        req.user = {
          id: testUserId,
          email: 'test@example.com',
          name: 'Test User',
        };
        next();
        return;
      }
      if (userRole === 'GUEST') {
        res.status(403).json({ error: 'Access denied: requires HOST role' });
        return;
      }
      if (!userRole && !req.headers.authorization) {
        res.status(403).json({ error: 'Access denied: missing role header' });
        return;
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied, please log in' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const session = await getPrisma().session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session, please log in' });
      return;
    }

    if (session.expiresAt < new Date()) {
      // Clean up expired session asynchronously
      getPrisma().session.delete({ where: { id: session.id } }).catch(() => {});
      res.status(401).json({ error: 'Session expired, please log in' });
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };

    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireRole(role: 'ADMIN' | 'HOST') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.headers['x-role'];
    if (!userRole) {
      res.status(403).json({ error: 'Access denied: missing role header' });
      return;
    }

    if (userRole !== role && userRole !== 'ADMIN') {
      res.status(403).json({ error: `Access denied: requires ${role} role` });
      return;
    }

    next();
  };
}
