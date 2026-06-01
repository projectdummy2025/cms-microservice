import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL!;

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
