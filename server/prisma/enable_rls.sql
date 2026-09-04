-- 1. Enable Row-Level Security (RLS) on all application tables
ALTER TABLE "public"."InvitationCanvas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Guest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PasswordResetToken" ENABLE ROW LEVEL SECURITY;

-- Also protect Prisma migration tracking table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
    ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. Revoke PostgREST API permissions from anon and authenticated roles
REVOKE ALL ON TABLE "public"."InvitationCanvas" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Guest" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."User" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."Session" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."PasswordResetToken" FROM anon, authenticated;

-- 3. Ensure future tables created in public do not grant permissions to anon/authenticated
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
