import {
	getEvent,
	getEventLeaderBoardFinds,
	getEventKorokFinds,
	getMyFoundKorokIds
} from '../../query/korok.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);

	const [event, players, koroks, foundIds] = await Promise.all([
		getEvent({ id }),
		getEventLeaderBoardFinds({ eventId: id }),
		getEventKorokFinds({ eventId: id }),
		getMyFoundKorokIds()
	]);

	return {
		id,
		event,
		players: players ?? [],
		koroks: koroks ?? [],
		foundIds: new Set(foundIds)
	};
};
