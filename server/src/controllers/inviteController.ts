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
    const canvases = await prisma.invitationCanvas.findMany();
    const strippedCanvases = canvases.map(canvas => {
      let designObj: any = {};
      try {
        if (canvas.designData) {
          designObj = JSON.parse(canvas.designData);
        }
      } catch (e) {
        console.error('Failed to parse designData in getCanvases', e);
      }

      // Strip large base64 image strings to keep payloads small
      delete designObj.headerImage;
      delete designObj.frameImage;
      delete designObj.paperImage;
      delete designObj.closedEnvelopeImage;
      delete designObj.openedEnvelopeImage;
      delete designObj.stickerImage;

      return {
        ...canvas,
        designData: JSON.stringify(designObj)
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
    const canvas = await prisma.invitationCanvas.findUnique({
      where: { id },
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
  } = req.body;

  try {
    if (id) {
      const existing = await prisma.invitationCanvas.findUnique({
        where: { id },
      });

      if (existing) {
        const updated = await prisma.invitationCanvas.update({
          where: { id },
          data: {
            envelopeColor: envelopeColor ?? existing.envelopeColor,
            waxSealAsset: waxSealAsset ?? existing.waxSealAsset,
            musicUrl: musicUrl !== undefined ? musicUrl : existing.musicUrl,
            countdownTarget: countdownTarget ?? existing.countdownTarget,
            colorPalette: colorPalette ?? existing.colorPalette,
            itinerary: itinerary ?? existing.itinerary,
            hostId: hostId ?? existing.hostId,
            designData: designData ?? existing.designData,
          },
        });
        res.json(updated);
        return;
      }
    }

    const created = await prisma.invitationCanvas.create({
      data: {
        id: id || undefined,
        envelopeColor: envelopeColor || '#f6ebe2',
        waxSealAsset: waxSealAsset || 'classic-red',
        musicUrl: musicUrl || null,
        countdownTarget: countdownTarget || new Date().toISOString(),
        colorPalette: colorPalette || JSON.stringify([]),
        itinerary: itinerary || JSON.stringify([]),
        hostId: hostId || 'host-default',
        designData: designData || '{}',
      },
    });
    res.json(created);
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
