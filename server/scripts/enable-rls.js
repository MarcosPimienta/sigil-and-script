const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Securing Supabase Database: Enabling Row-Level Security (RLS)...');

  const statements = [
    // 1. Enable RLS on all tables
    `ALTER TABLE "public"."InvitationCanvas" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "public"."Guest" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "public"."Session" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "public"."PasswordResetToken" ENABLE ROW LEVEL SECURITY;`,

    // 2. Protect Prisma migration metadata table if present
    `DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
        ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
      END IF;
    END $$;`,

    // 3. Revoke direct PostgREST API access from anon & authenticated roles
    `REVOKE ALL ON TABLE "public"."InvitationCanvas" FROM anon, authenticated;`,
    `REVOKE ALL ON TABLE "public"."Guest" FROM anon, authenticated;`,
    `REVOKE ALL ON TABLE "public"."User" FROM anon, authenticated;`,
    `REVOKE ALL ON TABLE "public"."Session" FROM anon, authenticated;`,
    `REVOKE ALL ON TABLE "public"."PasswordResetToken" FROM anon, authenticated;`,

    // 4. Revoke default privileges on future tables created in public schema
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;`
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const firstLine = sql.trim().split('\n')[0];
      console.log(`  ✓ ${firstLine}`);
    } catch (err) {
      console.error(`  ✗ Error running statement:`, err.message);
      throw err;
    }
  }

  // Verify status in pg_tables
  console.log('\n🔍 Verifying RLS status on public tables:');
  const tables = await prisma.$queryRaw`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename ASC;
  `;

  for (const table of tables) {
    const status = table.rowsecurity ? 'ENABLED (Protected)' : 'DISABLED (Vulnerable)';
    console.log(`  - ${table.tablename.padEnd(22)}: ${status}`);
  }

  console.log('\n✅ Database successfully secured against public API exposure.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
