const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const canvases = await prisma.invitationCanvas.findMany({
    select: { id: true, userId: true, countdownTarget: true, musicUrl: true, envelopeColor: true }
  });
  console.log('--- CANVASES ---');
  console.log(JSON.stringify(canvases, null, 2));

  const sessions = await prisma.session.findMany({
    select: { id: true, userId: true, expiresAt: true }
  });
  console.log('--- SESSIONS ---');
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
