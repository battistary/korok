import { BETTER_AUTH_SECRET } from '$app/env/private';
import { ORIGIN } from '$app/env/public';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			role: {
				type: ['user', 'admin', 'muncher'],
				required: true,
				defaultValue: 'user',
				input: false
			}
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export async function getCurrentSession() {
	const event = getRequestEvent();

	return auth.api.getSession({
		headers: event.request.headers
	});
}

export async function getCurrentUser() {
	const session = await getCurrentSession();

	return session?.user ?? null;
}
