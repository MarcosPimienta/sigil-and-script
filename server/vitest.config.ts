import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // Tests run against the real (remote) Postgres configured in .env; each
    // request costs a few DB round trips, so allow well over the 5 s default.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
