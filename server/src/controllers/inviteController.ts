import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const tokenParamSchema = z.string().uuid();

export async function getInviteByToken(req: Request, res: Response): Promise<void> {
  const { token } = req.params;

  const parsed = tokenParamSchema.safeParse(token);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid token format', issues: parsed.error.issues });
    return;
  }

  const validatedToken = parsed.data;

  try {
    const guest = await prisma.guest.findUnique({
      where: { id: validatedToken },
      include: { canvas: true },
    });

    if (!guest) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    if (guest.status === 'PENDING') {
      const updatedGuest = await prisma.guest.update({
        where: { id: validatedToken },
        data: {
          status: 'OPENED',
          openedTimestamp: new Date().toISOString(),
        },
        include: { canvas: true },
      });
      res.json(updatedGuest);
      return;
    }

    res.json(guest);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
