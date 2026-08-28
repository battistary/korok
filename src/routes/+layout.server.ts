import type { PageServerLoad } from './$types';
import { getMyFinds } from './query/korok.remote'; // adjust path if needed

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    let koroksFound = 0;

    if (user?.id) {
        try {
            const result = await getMyFinds({ userId: user.id });
            koroksFound = result?.koroksFound ?? 0;
        } catch (error) {
            console.error('Failed to fetch koroks in layout:', error);
            // fallback to 0
        }
    }

    return {
        user,
        koroksFound, // now available as data.koroksFound
        test: ''     // keep existing fields if you need them
    };
};
