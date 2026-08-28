import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Use process.env directly – works in both dev and production
const DATABASE_URL = process.env.DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!TURSO_AUTH_TOKEN) throw new Error('TURSO_AUTH_TOKEN is not set');

const client = createClient({ 
    url: DATABASE_URL, 
    authToken: TURSO_AUTH_TOKEN 
});

export const db = drizzle(client, { schema });
