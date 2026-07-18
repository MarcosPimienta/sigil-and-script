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

export async function getCanvases(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const canvases = await prisma.invitationCanvas.findMany({
      where: { userId },
    });
    const strippedCanvases = canvases.map(canvas => {
      let designObj: any = {};
      try {
        if (canvas.designData) {
          designObj = JSON.parse(canvas.designData);
        }
      } catch (e) {
        console.error('Failed to parse designData in getCanvases', e);
      }

      return {
        id: canvas.id,
        countdownTarget: canvas.countdownTarget || designObj.countdownTarget,
        designData: JSON.stringify({
          title: designObj.title || 'Untitled Design'
        })
      };
    });
    res.json(strippedCanvases);
  } catch (error) {
    console.error('Error listing canvases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCanvasById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID parameter' });
    return;
  }

  try {
    const canvas = await prisma.invitationCanvas.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!canvas) {
      res.status(404).json({ error: 'Configuration not found' });
      return;
    }
    res.json(canvas);
  } catch (error) {
    console.error('Error getting canvas by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function saveCanvas(req: Request, res: Response): Promise<void> {
  const {
    id,
    envelopeColor,
    waxSealAsset,
    musicUrl,
    countdownTarget,
    colorPalette,
    itinerary,
    hostId,
    designData,
    invitees,
  } = req.body;

  try {
    const userId = req.user!.id;
    let canvasObj;

    const designDataStr = typeof designData === 'object'
      ? JSON.stringify(designData)
      : (designData ?? undefined);

    if (id) {
      const existing = await prisma.invitationCanvas.findUnique({
        where: { id },
      });

      if (existing) {
        if (existing.userId !== userId) {
          res.status(403).json({ error: 'Access denied: You do not own this canvas' });
          return;
        }

        canvasObj = await prisma.invitationCanvas.update({
          where: { id },
          data: {
            envelopeColor: envelopeColor ?? existing.envelopeColor,
            waxSealAsset: waxSealAsset ?? existing.waxSealAsset,
            musicUrl: musicUrl !== undefined ? musicUrl : existing.musicUrl,
            countdownTarget: countdownTarget ?? existing.countdownTarget,
            colorPalette: colorPalette ?? existing.colorPalette,
            itinerary: itinerary ?? existing.itinerary,
            hostId: hostId ?? existing.hostId,
            designData: designDataStr !== undefined ? designDataStr : existing.designData,
          },
        });
      }
    }

    if (!canvasObj) {
      canvasObj = await prisma.invitationCanvas.create({
        data: {
          id: id || undefined,
          envelopeColor: envelopeColor || '#f6ebe2',
          waxSealAsset: waxSealAsset || 'classic-red',
          musicUrl: musicUrl || null,
          countdownTarget: countdownTarget || new Date().toISOString(),
          colorPalette: colorPalette || JSON.stringify([]),
          itinerary: itinerary || JSON.stringify([]),
          hostId: hostId || 'host-default',
          designData: designDataStr || '{}',
          userId,
        },
      });
    }

    const canvasId = canvasObj.id;

    // Sync guest list roster to the database
    if (Array.isArray(invitees)) {
      const activeGuestIds = invitees
        .map((g: any) => g.id)
        .filter((gid: any) => typeof gid === 'string');

      await prisma.$transaction(async (tx) => {
        // Delete all guests associated with this canvas who are NOT in the incoming active list
        await tx.guest.deleteMany({
          where: {
            canvasId,
            id: { notIn: activeGuestIds },
          },
        });

        // Upsert all guests in the incoming list
        for (const guest of invitees) {
          if (!guest.id || !guest.name) continue;

          // Read existing guest if present to preserve their RSVP responses
          const existingDbGuest = await tx.guest.findUnique({
            where: { id: guest.id },
          });

          let mergedFormResponses = {};
          if (existingDbGuest && existingDbGuest.formResponses) {
            try {
              mergedFormResponses = JSON.parse(existingDbGuest.formResponses);
            } catch (e) {
              console.error("Failed to parse existing formResponses", e);
            }
          }

          const dependents = Array.isArray(guest.dependents) ? guest.dependents : [];
          mergedFormResponses = {
            ...mergedFormResponses,
            dependents,
          };

          await tx.guest.upsert({
            where: { id: guest.id },
            update: {
              name: guest.name,
              status: guest.status || 'PENDING',
              formResponses: JSON.stringify(mergedFormResponses),
            },
            create: {
              id: guest.id,
              name: guest.name,
              status: guest.status || 'PENDING',
              formResponses: JSON.stringify(mergedFormResponses),
              canvasId,
            },
          });
        }
      });
    }

    res.json(canvasObj);
  } catch (error) {
    console.error('Error saving canvas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCanvas(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID parameter' });
    return;
  }

  try {
    const existing = await prisma.invitationCanvas.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }

    if (existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied: You do not own this canvas' });
      return;
    }

    await prisma.guest.deleteMany({
      where: { canvasId: id },
    });

    await prisma.invitationCanvas.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting canvas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
