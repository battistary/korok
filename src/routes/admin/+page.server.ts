import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if ((event.locals.user as any).role !== 'admin') {
		return redirect(302, '/');
	}
	return {};
};
