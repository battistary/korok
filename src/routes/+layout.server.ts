import type { PageServerLoad } from './$types';
import { getMyFinds } from './query/korok.remote';

export const load: PageServerLoad = async (event) => {
    event.depends('app:korok-count'); // <-- add this

    const user = event.locals.user;
    let koroksFound = 0;

    if (user?.id) {
        try {
            const result = await getMyFinds({ userId: user.id });
            koroksFound = result?.koroksFound ?? 0;
        } catch (error) {
            console.error('Failed to fetch koroks in layout:', error);
        }
    }

    return {
        user,
        koroksFound,
    };
};
