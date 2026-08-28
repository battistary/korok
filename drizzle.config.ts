import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,   // <-- add this line
    },
    verbose: true,
    strict: true,
});
