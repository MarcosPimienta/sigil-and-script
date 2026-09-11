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
