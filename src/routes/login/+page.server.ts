import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		const cookie = event.cookies.get('loggedInKorok');
		if (cookie) {
			event.cookies.delete('loggedInKorok', { path: '/' });
			return redirect(302, `/find?id=${cookie}`);
		} else {
			return redirect(302, '/');
		}
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		const cookie = event.cookies.get('loggedInKorok');
		if (cookie) {
			event.cookies.delete('loggedInKorok', { path: '/' });
			return redirect(302, `/find?id=${cookie}`);
		} else {
			return redirect(302, '/');
		}
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email-reg')?.toString() ?? '';
		const password = formData.get('password-reg')?.toString() ?? '';
		const name = formData.get('name-reg')?.toString() ?? '';
		if (name.length < 1) {
			return fail(400, { message: 'Name must be at least 1 character' });
		}
		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			console.log(error);
			return fail(500, { message: 'Unexpected error' });
		}
		const cookie = event.cookies.get('loggedInKorok');
		if (cookie) {
			event.cookies.delete('loggedInKorok', { path: '/' });
			return redirect(302, `/find?id=${cookie}`);
		} else {
			return redirect(302, '/');
		}
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
