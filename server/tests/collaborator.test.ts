import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

describe('Collaborator & Co-Hosting API Tests', () => {
  let ownerId: string;
  let ownerToken: string;
  let collaboratorId: string;
  let collaboratorToken: string;
  let nonOwnerId: string;
  let nonOwnerToken: string;
  let testCanvasId: string;
  let createdCollabToken: string;
  let createdCollabId: string;

  const createdUserIds: string[] = [];
  const createdCanvasIds: string[] = [];

  beforeAll(async () => {
    // 1. Create Owner User & Session
    const owner = await prisma.user.create({
      data: {
        email: `collab-owner-${Date.now()}@example.com`,
        password: 'hashed-password-1234',
        name: 'Event Owner',
      },
    });
    ownerId = owner.id;
    createdUserIds.push(owner.id);

    ownerToken = 'owner-tok-' + Date.now();
    await prisma.session.create({
      data: {
        token: ownerToken,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // 2. Create Collaborator User & Session
    const collabUser = await prisma.user.create({
      data: {
        email: `collab-user-${Date.now()}@example.com`,
        password: 'hashed-password-1234',
        name: 'Co Host User',
      },
    });
    collaboratorId = collabUser.id;
    createdUserIds.push(collabUser.id);

    collaboratorToken = 'collab-tok-' + Date.now();
    await prisma.session.create({
      data: {
        token: collaboratorToken,
        userId: collaboratorId,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // 3. Create Unrelated User & Session
    const stranger = await prisma.user.create({
      data: {
        email: `stranger-${Date.now()}@example.com`,
        password: 'hashed-password-1234',
        name: 'Unrelated User',
      },
    });
    nonOwnerId = stranger.id;
    createdUserIds.push(stranger.id);

    nonOwnerToken = 'stranger-tok-' + Date.now();
    await prisma.session.create({
      data: {
        token: nonOwnerToken,
        userId: nonOwnerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // 4. Create Owner's Canvas
    const canvas = await prisma.invitationCanvas.create({
      data: {
        eventType: 'WEDDING',
        envelopeColor: '#e0cfa9',
        waxSealAsset: 'gold-seal',
        countdownTarget: '2026-12-25T18:00:00.000Z',
        colorPalette: JSON.stringify(['#e0cfa9', '#2c1e11']),
        itinerary: JSON.stringify([{ type: 'CEREMONY', time: '18:00', locationName: 'Main Chapel' }]),
        hostId: ownerId,
        userId: ownerId,
        designData: JSON.stringify({ title: 'Elena & Marcus Gala' }),
      },
    });
    testCanvasId = canvas.id;
    createdCanvasIds.push(canvas.id);
  });

  afterAll(async () => {
    await prisma.canvasCollaborator.deleteMany({
      where: { canvasId: { in: createdCanvasIds } },
    });
    await prisma.invitationCanvas.deleteMany({
      where: { id: { in: createdCanvasIds } },
    });
    await prisma.session.deleteMany({
      where: { userId: { in: createdUserIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
    await prisma.$disconnect();
  });

  describe('POST /canvas/:id/collaborators - Inviting Collaborators', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post(`/canvas/${testCanvasId}/collaborators`)
        .send({ email: 'partner@example.com' });
      expect(res.status).toBe(401);
    });

    it('denies invitation if caller is not the canvas owner', async () => {
      const res = await request(app)
        .post(`/canvas/${testCanvasId}/collaborators`)
        .set('Authorization', `Bearer ${nonOwnerToken}`)
        .send({ email: 'partner@example.com' });
      expect(res.status).toBe(403);
    });

    it('rejects self-invitation', async () => {
      const ownerUser = await prisma.user.findUnique({ where: { id: ownerId } });
      const res = await request(app)
        .post(`/canvas/${testCanvasId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: ownerUser!.email });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot invite yourself');
    });

    it('successfully creates a pending collaborator and generates invite link', async () => {
      const collabUser = await prisma.user.findUnique({ where: { id: collaboratorId } });
      const res = await request(app)
        .post(`/canvas/${testCanvasId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: collabUser!.email, role: 'CO_HOST' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.collaborator).toHaveProperty('inviteToken');
      expect(res.body.collaborator.status).toBe('PENDING');
      expect(res.body.collaborator.role).toBe('CO_HOST');

      createdCollabToken = res.body.collaborator.inviteToken;
      createdCollabId = res.body.collaborator.id;
    });
  });

  describe('GET /collaborators/invite/:token - Public Invite Verification', () => {
    it('returns 404 for invalid token', async () => {
      const res = await request(app).get('/collaborators/invite/invalid-token-123');
      expect(res.status).toBe(404);
    });

    it('resolves valid pending invite token with event metadata', async () => {
      const res = await request(app).get(`/collaborators/invite/${createdCollabToken}`);
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.eventTitle).toBe('Elena & Marcus Gala');
      expect(res.body.eventType).toBe('WEDDING');
      expect(res.body.role).toBe('CO_HOST');
    });
  });

  describe('POST /collaborators/invite/:token/accept - Claiming Invite', () => {
    it('rejects unauthenticated accept request', async () => {
      const res = await request(app).post(`/collaborators/invite/${createdCollabToken}/accept`);
      expect(res.status).toBe(401);
    });

    it('allows collaborator user to accept the invitation', async () => {
      const res = await request(app)
        .post(`/collaborators/invite/${createdCollabToken}/accept`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.canvasId).toBe(testCanvasId);

      // Verify DB record status
      const updated = await prisma.canvasCollaborator.findUnique({
        where: { id: createdCollabId },
      });
      expect(updated?.status).toBe('ACCEPTED');
      expect(updated?.userId).toBe(collaboratorId);
    });

    it('returns 404 if trying to accept an already-accepted invite token', async () => {
      const res = await request(app)
        .post(`/collaborators/invite/${createdCollabToken}/accept`)
        .set('Authorization', `Bearer ${collaboratorToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Shared Canvas Access & Scoping', () => {
    it('shows co-hosted event in GET /canvas for the accepted collaborator', async () => {
      const res = await request(app)
        .get('/canvas')
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(200);
      const canvasItem = res.body.find((c: any) => c.id === testCanvasId);
      expect(canvasItem).toBeDefined();
      expect(canvasItem.isCoHost).toBe(true);
      expect(canvasItem.role).toBe('CO_HOST');
    });

    it('allows accepted collaborator to GET /canvas/:id', async () => {
      const res = await request(app)
        .get(`/canvas/${testCanvasId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testCanvasId);
    });

    it('allows accepted collaborator to edit and save canvas via POST /canvas', async () => {
      const res = await request(app)
        .post('/canvas')
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          id: testCanvasId,
          designData: { title: 'Updated By Co-Host' },
        });

      expect(res.status).toBe(200);

      // Verify update persisted
      const fetched = await prisma.invitationCanvas.findUnique({
        where: { id: testCanvasId },
      });
      expect(fetched?.designData).toContain('Updated By Co-Host');
    });

    it('prevents collaborator from deleting the canvas (403)', async () => {
      const res = await request(app)
        .delete(`/canvas/${testCanvasId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('You do not own this canvas');
    });

    it('prevents unrelated stranger from accessing the canvas', async () => {
      const res = await request(app)
        .get(`/canvas/${testCanvasId}`)
        .set('Authorization', `Bearer ${nonOwnerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET & DELETE /canvas/:id/collaborators - Management', () => {
    it('lists collaborators for owner', async () => {
      const res = await request(app)
        .get(`/canvas/${testCanvasId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.collaborators.length).toBeGreaterThanOrEqual(1);
      expect(res.body.collaborators[0].status).toBe('ACCEPTED');
    });

    it('allows owner to remove collaborator', async () => {
      const res = await request(app)
        .delete(`/canvas/${testCanvasId}/collaborators/${createdCollabId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await prisma.canvasCollaborator.findUnique({
        where: { id: createdCollabId },
      });
      expect(check).toBeNull();
    });
  });
});
