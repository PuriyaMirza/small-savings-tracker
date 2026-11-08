import { defineConfig } from 'drizzle-kit';

// `npx drizzle-kit generate` writes SQL migrations to ./drizzle (checked into git).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
