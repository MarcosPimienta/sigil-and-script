import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

// Lazy singleton — avoids crashing the module on Vercel cold start
let _prisma: PrismaClient | null = null;
const getPrisma = (): PrismaClient => { if (!_prisma) _prisma = new PrismaClient(); return _prisma; };

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
    const guest = await getPrisma().guest.findUnique({
      where: { id: validatedToken },
      include: { canvas: true },
    });

    if (!guest) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    if (guest.status === 'PENDING') {
      const updatedGuest = await getPrisma().guest.update({
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

const rsvpBodySchema = z.object({
  status: z.enum(['RSVP_YES', 'RSVP_NO']),
  mealPref: z.string().nullable().optional(),
  dietary: z.string().nullable().optional(),
  plusOne: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  dependents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    included: z.boolean(),
  })).optional(),
});

export async function submitRsvp(req: Request, res: Response): Promise<void> {
  const { token } = req.params;

  const parsedToken = tokenParamSchema.safeParse(token);
  if (!parsedToken.success) {
    res.status(400).json({ error: 'Invalid token format', issues: parsedToken.error.issues });
    return;
  }

  const parsedBody = rsvpBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: 'Invalid request body', issues: parsedBody.error.issues });
    return;
  }

  const validatedToken = parsedToken.data;
  const { status, mealPref, dietary, plusOne, notes, dependents } = parsedBody.data;

  try {
    const existingGuest = await getPrisma().guest.findUnique({
      where: { id: validatedToken },
    });

    if (!existingGuest) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    let existingResponses = {};
    if (existingGuest.formResponses) {
      try {
        existingResponses = JSON.parse(existingGuest.formResponses);
      } catch (e) {
        console.error("Failed to parse existing formResponses", e);
      }
    }

    const mergedResponses = {
      ...existingResponses,
      mealPref,
      dietary,
      plusOne,
      notes,
      dependents: dependents ?? [],
      submittedAt: new Date().toISOString(),
    };

    // Calculate confirmed seats
    let confirmedSeats = 0;
    if (status === 'RSVP_YES') {
      confirmedSeats = 1;
      if (plusOne && plusOne.trim().length > 0) {
        confirmedSeats += 1;
      }
      if (dependents && Array.isArray(dependents)) {
        confirmedSeats += dependents.filter((d) => d.included).length;
      }
    }

    const updatedGuest = await getPrisma().guest.update({
      where: { id: validatedToken },
      data: {
        status,
        confirmedSeats,
        formResponses: JSON.stringify(mergedResponses),
      },
    });

    res.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCanvases(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const canvases = await getPrisma().invitationCanvas.findMany({
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
    const canvas = await getPrisma().invitationCanvas.findFirst({
      where: { id, userId: req.user!.id },
      include: { invitees: true },
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
      const existing = await getPrisma().invitationCanvas.findUnique({
        where: { id },
      });

      if (existing) {
        if (existing.userId !== userId) {
          res.status(403).json({ error: 'Access denied: You do not own this canvas' });
          return;
        }

        canvasObj = await getPrisma().invitationCanvas.update({
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
      canvasObj = await getPrisma().invitationCanvas.create({
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

      await getPrisma().$transaction(async (tx) => {
        // Delete guests associated with this canvas who are NOT in the incoming active list
        // Guard: only execute deleteMany if activeGuestIds is non-empty to protect against accidental wipes
        if (activeGuestIds.length > 0) {
          await tx.guest.deleteMany({
            where: {
              canvasId,
              id: { notIn: activeGuestIds },
            },
          });
        }

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
    const existing = await getPrisma().invitationCanvas.findUnique({
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

    await getPrisma().guest.deleteMany({
      where: { canvasId: id },
    });

    await getPrisma().invitationCanvas.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting canvas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const { fileData, fileName, fileType, bucket } = req.body;

  if (!fileData || !fileName || !fileType || !bucket) {
    res.status(400).json({ error: 'Missing required parameters: fileData, fileName, fileType, bucket' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    res.status(500).json({ error: 'Storage configuration error: Please check server environment variables.' });
    return;
  }

  try {
    const base64Parts = fileData.split(';base64,');
    const base64String = base64Parts.length > 1 ? base64Parts[1] : fileData;
    const buffer = Buffer.from(base64String, 'base64');

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${crypto.randomUUID()}-${sanitizedName}`;

    const targetUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${uniqueFileName}`;
    const uploadRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': fileType,
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Supabase upload request failed:', errorText);
      res.status(uploadRes.status).json({ error: `Supabase upload failed: ${errorText}` });
      return;
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueFileName}`;
    res.json({ publicUrl });
  } catch (error) {
    console.error('Error uploading media to Supabase:', error);
    res.status(500).json({ error: 'Internal server error during media upload' });
  }
}
