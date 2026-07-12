import { Request, Response, NextFunction } from 'express';

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
