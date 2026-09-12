import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';
import { sendCollaboratorInviteEmail } from '../services/mailer';

// Lazy singleton — avoids crashing on Vercel cold start
let _prisma: PrismaClient | null = null;
const prisma = (): PrismaClient => {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
};

function appUrl(): string {
  const raw = process.env.APP_URL || 'http://localhost:5173';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function getParam(param: string | string[] | undefined): string | null {
  if (!param) return null;
  return Array.isArray(param) ? param[0] : param;
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['CO_HOST', 'EDITOR']).optional().default('CO_HOST'),
});

/**
 * POST /canvas/:id/collaborators
 * Invites a co-host or editor to a canvas. Caller must be the canvas owner.
 */
export async function inviteCollaborator(req: Request, res: Response): Promise<void> {
  try {
    const canvasId = getParam(req.params.id);
    if (!canvasId) {
      res.status(400).json({ error: 'Invalid canvas ID' });
      return;
    }

    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify canvas ownership
    const canvas = await prisma().invitationCanvas.findUnique({
      where: { id: canvasId },
      include: { user: true },
    });

    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }

    if (canvas.userId !== userId) {
      res.status(403).json({ error: 'Only the canvas owner can invite collaborators' });
      return;
    }

    // Prevent inviting oneself
    if (normalizedEmail === userEmail.toLowerCase()) {
      res.status(400).json({ error: 'Cannot invite yourself as a collaborator' });
      return;
    }

    // Check existing collaborator record
    const existingCollab = await prisma().canvasCollaborator.findFirst({
      where: { canvasId, email: normalizedEmail },
    });

    let inviteToken: string;
    let collaboratorRecord;

    if (existingCollab) {
      if (existingCollab.status === 'ACCEPTED') {
        res.status(400).json({ error: 'This user is already an active collaborator on this event' });
        return;
      }
      // Re-issue a fresh token for pending invite
      inviteToken = crypto.randomBytes(32).toString('hex');
      collaboratorRecord = await prisma().canvasCollaborator.update({
        where: { id: existingCollab.id },
        data: {
          inviteToken,
          role,
          createdAt: new Date(),
        },
      });
    } else {
      inviteToken = crypto.randomBytes(32).toString('hex');
      collaboratorRecord = await prisma().canvasCollaborator.create({
        data: {
          canvasId,
          email: normalizedEmail,
          role,
          status: 'PENDING',
          inviteToken,
        },
      });
    }

    // Resolve event title
    let eventTitle = 'Event Invitation';
    try {
      if (canvas.designData) {
        const parsedDesign = JSON.parse(canvas.designData);
        if (parsedDesign.title) {
          eventTitle = parsedDesign.title;
        }
      }
    } catch {
      // fallback to default
    }

    const inviteLink = `${appUrl()}/?collab=${inviteToken}`;
    const inviterName = req.user!.name || req.user!.email;

    await sendCollaboratorInviteEmail({
      to: normalizedEmail,
      link: inviteLink,
      inviterName,
      eventTitle,
      role,
    });

    res.status(201).json({
      success: true,
      collaborator: collaboratorRecord,
      inviteLink,
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /canvas/:id/collaborators
 * Lists all collaborators for a canvas.
 */
export async function listCollaborators(req: Request, res: Response): Promise<void> {
  try {
    const canvasId = getParam(req.params.id);
    if (!canvasId) {
      res.status(400).json({ error: 'Invalid canvas ID' });
      return;
    }

    const userId = req.user!.id;

    const canvas = await prisma().invitationCanvas.findUnique({
      where: { id: canvasId },
      include: {
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }

    const isOwner = canvas.userId === userId;
    const isCollaborator = canvas.collaborators.some(
      (c: any) => c.userId === userId && c.status === 'ACCEPTED'
    );

    if (!isOwner && !isCollaborator) {
      res.status(403).json({ error: 'Access denied: You do not have permission to view collaborators for this event' });
      return;
    }

    res.json({
      ownerId: canvas.userId,
      collaborators: canvas.collaborators.map((c: any) => ({
        id: c.id,
        canvasId: c.canvasId,
        email: c.email,
        role: c.role,
        status: c.status,
        userId: c.userId,
        userName: c.user?.name || null,
        userEmail: c.user?.email || null,
        createdAt: c.createdAt,
        acceptedAt: c.acceptedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing collaborators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /canvas/:id/collaborators/:collabId
 * Removes a collaborator. Canvas owner can remove any collaborator;
 * collaborators can remove themselves.
 */
export async function removeCollaborator(req: Request, res: Response): Promise<void> {
  try {
    const canvasId = getParam(req.params.id);
    const collabId = getParam(req.params.collabId);

    if (!canvasId || !collabId) {
      res.status(400).json({ error: 'Invalid ID parameters' });
      return;
    }

    const userId = req.user!.id;

    const canvas = await prisma().invitationCanvas.findUnique({
      where: { id: canvasId },
    });

    if (!canvas) {
      res.status(404).json({ error: 'Canvas not found' });
      return;
    }

    const collab = await prisma().canvasCollaborator.findUnique({
      where: { id: collabId },
    });

    if (!collab || collab.canvasId !== canvasId) {
      res.status(404).json({ error: 'Collaborator not found on this canvas' });
      return;
    }

    const isOwner = canvas.userId === userId;
    const isSelf = collab.userId === userId || collab.email === req.user!.email;

    if (!isOwner && !isSelf) {
      res.status(403).json({ error: 'Access denied: You cannot remove this collaborator' });
      return;
    }

    await prisma().canvasCollaborator.delete({
      where: { id: collabId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /collaborators/invite/:token
 * Public endpoint to resolve invite token details (for the invitation acceptance view).
 */
export async function getInviteDetails(req: Request, res: Response): Promise<void> {
  try {
    const token = getParam(req.params.token);

    if (!token) {
      res.status(400).json({ error: 'Invalid invitation token' });
      return;
    }

    const collab = await prisma().canvasCollaborator.findUnique({
      where: { inviteToken: token },
      include: {
        canvas: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!collab || collab.status !== 'PENDING') {
      res.status(404).json({ error: 'Invalid or expired invitation link' });
      return;
    }

    let eventTitle = 'Event Invitation';
    try {
      if (collab.canvas.designData) {
        const designObj = JSON.parse(collab.canvas.designData);
        if (designObj.title) {
          eventTitle = designObj.title;
        }
      }
    } catch {
      // fallback
    }

    res.json({
      valid: true,
      canvasId: collab.canvas.id,
      eventTitle,
      eventType: collab.canvas.eventType,
      inviterName: collab.canvas.user?.name || collab.canvas.user?.email || 'A Host',
      email: collab.email,
      role: collab.role,
    });
  } catch (error) {
    console.error('Error resolving collaborator invite details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /collaborators/invite/:token/accept
 * Authenticated endpoint: Claims the invitation for the current logged-in user.
 */
export async function acceptInvite(req: Request, res: Response): Promise<void> {
  try {
    const token = getParam(req.params.token);
    const userId = req.user!.id;

    if (!token) {
      res.status(400).json({ error: 'Invalid invitation token' });
      return;
    }

    const collab = await prisma().canvasCollaborator.findUnique({
      where: { inviteToken: token },
    });

    if (!collab || collab.status !== 'PENDING') {
      res.status(404).json({ error: 'Invalid or expired invitation link' });
      return;
    }

    // Accept and claim invitation
    await prisma().canvasCollaborator.update({
      where: { id: collab.id },
      data: {
        userId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    res.json({
      success: true,
      canvasId: collab.canvasId,
    });
  } catch (error) {
    console.error('Error accepting collaborator invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
