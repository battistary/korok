import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(event.locals.user as any).role !== 'admin' &&
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(event.locals.user as any).role !== 'muncher'
	) {
		return redirect(302, '/');
	}
	return {};
};
