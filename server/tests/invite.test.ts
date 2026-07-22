import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

describe('Sigil & Script Backend API Tests', () => {
  let testCanvasId: string;
  let pendingGuestId: string;
  let openedGuestId: string;
  const nonExistentGuestId = '00000000-0000-0000-0000-000000000000';

  const createdGuestIds: string[] = [];
  const createdCanvasIds: string[] = [];

  beforeAll(async () => {
    const canvas = await prisma.invitationCanvas.create({
      data: {
        envelopeColor: '#e0cfa9',
        waxSealAsset: 'gold-seal',
        countdownTarget: '2026-12-25T18:00:00.000Z',
        colorPalette: JSON.stringify(['#e0cfa9', '#2c1e11']),
        itinerary: JSON.stringify([{ type: 'CEREMONY', time: '18:00', locationName: 'Main Chapel' }]),
        hostId: 'test-host-id',
      },
    });
    testCanvasId = canvas.id;
    createdCanvasIds.push(canvas.id);

    const pendingGuest = await prisma.guest.create({
      data: {
        name: 'John Doe',
        status: 'PENDING',
        canvasId: testCanvasId,
      },
    });
    pendingGuestId = pendingGuest.id;
    createdGuestIds.push(pendingGuest.id);

    const openedGuest = await prisma.guest.create({
      data: {
        name: 'Jane Smith',
        status: 'OPENED',
        openedTimestamp: '2026-07-11T12:00:00.000Z',
        canvasId: testCanvasId,
      },
    });
    openedGuestId = openedGuest.id;
    createdGuestIds.push(openedGuest.id);
  });

  afterAll(async () => {
    if (createdGuestIds.length > 0) {
      await prisma.guest.deleteMany({
        where: { id: { in: createdGuestIds } },
      });
    }
    if (createdCanvasIds.length > 0) {
      await prisma.invitationCanvas.deleteMany({
        where: { id: { in: createdCanvasIds } },
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /invite/:token - Invitation Token Hydration & Telemetry', () => {
    it('should resolve a valid PENDING token, change status to OPENED and record openedTimestamp', async () => {
      const res = await request(app)
        .get(`/invite/${pendingGuestId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', pendingGuestId);
      expect(res.body).toHaveProperty('status', 'OPENED');
      expect(res.body).toHaveProperty('openedTimestamp');
      expect(res.body.openedTimestamp).not.toBeNull();
      expect(res.body).toHaveProperty('canvas');
      expect(res.body.canvas).toHaveProperty('envelopeColor', '#e0cfa9');

      const dbGuest = await prisma.guest.findUnique({ where: { id: pendingGuestId } });
      expect(dbGuest?.status).toBe('OPENED');
      expect(dbGuest?.openedTimestamp).not.toBeNull();
    });

    it('should resolve an already-OPENED token and not overwrite the openedTimestamp', async () => {
      const dbGuestBefore = await prisma.guest.findUnique({ where: { id: openedGuestId } });
      const initialTimestamp = dbGuestBefore?.openedTimestamp;
      expect(initialTimestamp).toBe('2026-07-11T12:00:00.000Z');

      const res = await request(app)
        .get(`/invite/${openedGuestId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', openedGuestId);
      expect(res.body).toHaveProperty('status', 'OPENED');
      expect(res.body.openedTimestamp).toBe(initialTimestamp);

      const dbGuestAfter = await prisma.guest.findUnique({ where: { id: openedGuestId } });
      expect(dbGuestAfter?.openedTimestamp).toBe(initialTimestamp);
    });

    it('should return HTML Open Graph tags when request accepts text/html', async () => {
      const res = await request(app)
        .get(`/invite/${openedGuestId}`)
        .set('Accept', 'text/html')
        .expect(200);

      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('<meta property="og:title" content="Invitación para Jane Smith" />');
      expect(res.text).toContain('<meta property="og:image"');
    });

    it('should return 404 for a non-existent UUID token', async () => {
      const res = await request(app)
        .get(`/invite/${nonExistentGuestId}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Invitation not found');
    });

    it('should return 400 for a malformed token UUID', async () => {
      const res = await request(app)
        .get('/invite/malformed-uuid')
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Invalid token format');
    });
  });

  describe('RBAC Middleware Guards', () => {
    it('should allow access to host route when X-Role is HOST', async () => {
      await request(app)
        .post('/canvas')
        .set('X-Role', 'HOST')
        .expect(200);
    });

    it('should allow access to host route when X-Role is ADMIN', async () => {
      await request(app)
        .post('/canvas')
        .set('X-Role', 'ADMIN')
        .expect(200);
    });

    it('should deny access to host route (403) when X-Role is GUEST', async () => {
      const res = await request(app)
        .post('/canvas')
        .set('X-Role', 'GUEST')
        .expect(403);
      expect(res.body).toHaveProperty('error', 'Access denied: requires HOST role');
    });

    it('should deny access to host route (403) when X-Role header is missing', async () => {
      const res = await request(app)
        .post('/canvas')
        .expect(403);
      expect(res.body).toHaveProperty('error', 'Access denied: missing role header');
    });
  });
});
