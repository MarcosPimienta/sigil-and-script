import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

describe('Sigil & Script Backend API Tests', () => {
  let testCanvasId: string;
  let pendingGuestId: string;
  let openedGuestId: string;
  let testUserId: string;
  let testUserToken: string;
  const nonExistentGuestId = '00000000-0000-0000-0000-000000000000';

  const createdGuestIds: string[] = [];
  const createdCanvasIds: string[] = [];

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `test-invite-${Date.now()}@example.com`,
        password: 'test-hashed-password-123',
        name: 'Test Invite Host',
      },
    });
    testUserId = user.id;

    testUserToken = 'tok-' + Date.now() + '-' + Math.random().toString(36).substring(2);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await prisma.session.create({
      data: {
        token: testUserToken,
        userId: testUserId,
        expiresAt,
      },
    });

    const canvas = await prisma.invitationCanvas.create({
      data: {
        envelopeColor: '#e0cfa9',
        waxSealAsset: 'gold-seal',
        countdownTarget: '2026-12-25T18:00:00.000Z',
        colorPalette: JSON.stringify(['#e0cfa9', '#2c1e11']),
        itinerary: JSON.stringify([{ type: 'CEREMONY', time: '18:00', locationName: 'Main Chapel' }]),
        hostId: testUserId,
        userId: testUserId,
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
    if (testUserId) {
      await prisma.session.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
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
      expect(res.text).toContain('<meta property="og:title" content="Invitación para Jane Smith');
      expect(res.text).toContain('<meta property="og:image"');
    });

    it('phrases the og:title by event type and language', async () => {
      const cases: { eventType: string; hostNames: string; lang: string; expected: string }[] = [
        { eventType: 'WEDDING', hostNames: 'Marcos & Diana', lang: 'ES', expected: 'Invitación para Jane Smith al Matrimonio de Marcos &amp; Diana' },
        { eventType: 'BIRTHDAY', hostNames: 'Sofía', lang: 'ES', expected: 'Invitación para Jane Smith al Cumpleaños de Sofía' },
        { eventType: 'BIRTHDAY', hostNames: 'Sofía', lang: 'EN', expected: "Invitation for Jane Smith to Sofía&#039;s Birthday" },
        { eventType: 'BAPTISM', hostNames: 'Mateo', lang: 'ES', expected: 'Invitación para Jane Smith al Bautizo de Mateo' },
        { eventType: 'CORPORATE', hostNames: 'Acme Summit 2027', lang: 'ES', expected: 'Invitación para Jane Smith a Acme Summit 2027' },
        { eventType: 'CORPORATE', hostNames: 'Acme Summit 2027', lang: 'EN', expected: 'Invitation for Jane Smith to Acme Summit 2027' },
      ];

      for (const c of cases) {
        await prisma.invitationCanvas.update({
          where: { id: testCanvasId },
          data: {
            eventType: c.eventType,
            designData: JSON.stringify({ eventType: c.eventType, hostNames: c.hostNames }),
          },
        });
        await prisma.guest.update({ where: { id: openedGuestId }, data: { language: c.lang } });

        const res = await request(app)
          .get(`/invite/${openedGuestId}`)
          .set('Accept', 'text/html')
          .expect(200);

        expect(res.text, `${c.eventType}/${c.lang}`).toContain(`<meta property="og:title" content="${c.expected}"`);
      }

      // restore
      await prisma.invitationCanvas.update({
        where: { id: testCanvasId },
        data: { eventType: 'WEDDING', designData: '{}' },
      });
      await prisma.guest.update({ where: { id: openedGuestId }, data: { language: 'ES' } });
    });

    it('falls back to WEDDING phrasing for a legacy canvas with no eventType', async () => {
      await prisma.invitationCanvas.update({
        where: { id: testCanvasId },
        data: { designData: JSON.stringify({ hostNames: 'Marcos & Diana' }) },
      });
      const res = await request(app).get(`/invite/${openedGuestId}`).set('Accept', 'text/html').expect(200);
      expect(res.text).toContain('al Matrimonio de Marcos &amp; Diana');
      await prisma.invitationCanvas.update({ where: { id: testCanvasId }, data: { designData: '{}' } });
    });

    it('should return JSON when request specifies Accept: application/json even with social crawler User-Agent', async () => {
      const res = await request(app)
        .get(`/invite/${openedGuestId}`)
        .set('User-Agent', 'WhatsApp/2.21.12.21 i')
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toHaveProperty('id', openedGuestId);
      expect(res.body).toHaveProperty('name', 'Jane Smith');
    });

    it('should return 404 for a non-existent UUID token', async () => {
      const res = await request(app)
        .get(`/invite/${nonExistentGuestId}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Invitation not found');
    });

    it('should return 404 for a non-matching custom token', async () => {
      const res = await request(app)
        .get('/invite/non-existent-token')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Invitation not found');
    });
  });

  describe('Token-Based Auth Guards (H-02 & R-05)', () => {
    it('should allow access to host route when a valid bearer token is provided', async () => {
      const res = await request(app)
        .post('/canvas')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          eventType: 'WEDDING',
          envelopeColor: '#f6ebe2',
        })
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(testUserId);
      createdCanvasIds.push(res.body.id);
    });

    it('should deny access (401) when Authorization header is missing', async () => {
      const res = await request(app)
        .post('/canvas')
        .send({ eventType: 'WEDDING' })
        .expect(401);
      expect(res.body).toHaveProperty('error', 'Access denied, please log in');
    });

    it('should deny access (401) even if client sends X-Role header without valid token', async () => {
      const res = await request(app)
        .post('/canvas')
        .set('X-Role', 'ADMIN')
        .send({ eventType: 'WEDDING' })
        .expect(401);
      expect(res.body).toHaveProperty('error', 'Access denied, please log in');
    });

    it('should deny access (401) for invalid or forged bearer tokens', async () => {
      const res = await request(app)
        .post('/canvas')
        .set('Authorization', 'Bearer forged-fake-token-1234')
        .send({ eventType: 'WEDDING' })
        .expect(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired session, please log in');
    });

    it('persists floorPlan configuration inside designData and retrieves it', async () => {
      const floorPlanData = {
        tables: [
          {
            id: 'table-1',
            name: 'Table 1',
            shape: 'round',
            seatsCount: 8,
            x: 100,
            y: 100,
            seats: [
              { id: 'table-1-seat-1', seatNumber: 1, assignedGuestId: 'guest-1', assignedGuestName: 'Alice' },
            ],
          },
        ],
      };

      const postRes = await request(app)
        .post('/canvas')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          designData: {
            title: 'Event with Floor Plan',
            floorPlan: floorPlanData,
          },
        })
        .expect(200);

      const createdId = postRes.body.id;
      createdCanvasIds.push(createdId);

      const getRes = await request(app)
        .get(`/canvas/${createdId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(getRes.body).toHaveProperty('designData');
      const parsed = JSON.parse(getRes.body.designData);
      expect(parsed.floorPlan).toEqual(floorPlanData);
    });
  });
});
