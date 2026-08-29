import { area, korok, finds, user, leaderBoardUsers, leaderBoards } from '$lib/server/db/schema';
import { command, query } from '$app/server';
import { db } from '$lib/server/db';
import { and, asc, count, desc, eq, max, inArray } from 'drizzle-orm';
import { getCurrentUser } from '$lib/server/auth';
import * as v from 'valibot';

export const getKoroks = query(async () => {
	const koroks = await db
		.select()
		.from(korok)
		.where(and(eq(korok.isRelease, true), eq(korok.isFindable, true)));
	return koroks;
});

export const getAdminData = query(async () => {
	const user = await getCurrentUser();
	if (user?.role === 'admin') {
		const koroks = await db
			.select({ release: korok.release, count: count(), max: max(korok.number) })
			.from(korok)
			.groupBy(korok.release)
			.orderBy(asc(korok.release));
		return koroks;
	}
});

export const releaseKoroks = command(
	v.object({
		release: v.number()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.update(korok).set({ isRelease: true }).where(eq(korok.release, e.release));
			return true;
		}
		return false;
	}
);

export const releaseUnFindableAdmin = command(
	v.object({
		release: v.number()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.update(korok).set({ isFindable: false }).where(eq(korok.release, e.release));
			return true;
		}
		return false;
	}
);

export const updateFindableAdmin = command(
	v.object({
		korokId: v.string(),
		isFindable: v.boolean()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.update(korok).set({ isFindable: e.isFindable }).where(eq(korok.id, e.korokId));
			return true;
		}
		return false;
	}
);

export const deleteReleaseKoroks = command(
	v.object({
		release: v.number()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			const ids = (
				await db
					.select({ id: finds.id })
					.from(finds)
					.innerJoin(korok, eq(finds.korokId, korok.id))
					.where(eq(korok.release, e.release))
			).map((i) => i.id);
			await db.delete(finds).where(inArray(finds.id, ids));
			await db.delete(korok).where(eq(korok.release, e.release));
			return true;
		}
		return false;
	}
);

export const getAreas = query(async () => {
	const areas = await db.select().from(area);
	return areas;
});

export const getKoroksAdmin = query(async () => {
	const user = await getCurrentUser();
	if (user?.role === 'admin') {
		const koroks = await db.select().from(korok);
		return koroks;
	}
	return [];
});

export const addKoroksAdmin = command(
	v.object({
		type: v.number(),
		number: v.number(),
		description: v.string(),
		lat: v.number(),
		lng: v.number(),
		release: v.number(),
		isRelease: v.boolean()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.insert(korok).values(e);
			return true;
		}
		return false;
	}
);

export const updateKoroksAdmin = command(
	v.object({
		type: v.number(),
		number: v.number(),
		description: v.string(),
		lat: v.number(),
		lng: v.number(),
		release: v.number(),
		isRelease: v.boolean(),
		id: v.string()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.update(korok).set(e).where(eq(korok.id, e.id));
			return true;
		}
		return false;
	}
);

export const deleteKoroksAdmin = command(
	v.object({
		id: v.string()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			const ids = (
				await db
					.select({ id: finds.id })
					.from(finds)
					.innerJoin(korok, eq(finds.korokId, korok.id))
					.where(eq(korok.id, e.id))
			).map((i) => i.id);
			await db.delete(finds).where(inArray(finds.id, ids));
			await db.delete(korok).where(eq(korok.id, e.id));
			return true;
		}
		return false;
	}
);

export const addAreaAdmin = command(
	v.object({
		color: v.string(),
		points: v.array(v.tuple([v.number(), v.number()]))
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.insert(area).values(e);
			return true;
		}
		return false;
	}
);

export const deleteAreaAdmin = command(
	v.object({
		id: v.number()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (user?.role === 'admin') {
			await db.delete(area).where(eq(area.id, e.id));
			return true;
		}
		return false;
	}
);

export const getKorokFinds = query(async () => {
	const korokStats = await db
		.select({
			korok: korok,
			findCount: count(finds.id)
		})
		.from(korok)
		.leftJoin(finds, eq(finds.korokId, korok.id))
		.where(eq(korok.isFindable, true))
		.groupBy(korok.id)
		.orderBy(desc(count(finds.id)));
	return korokStats;
});

export const getUserFinds = query(async () => {
	const userStats = await db
		.select({
			user: user,
			koroksFound: count(finds.id),
			lastFoundAt: max(finds.time)
		})
		.from(user)
		.leftJoin(finds, eq(finds.userId, user.id))
		.leftJoin(korok, and(eq(korok.id, finds.korokId), eq(korok.isFindable, true)))
		.groupBy(user.id)
		.orderBy(desc(count(finds.id)), asc(max(finds.time)));
	return userStats;
});

export const getMyFinds = query(v.object({ userId: v.string() }), async (e) => {
	const userStats = await db
		.select({
			user: user,
			koroksFound: count(finds.id),
			lastFoundAt: max(finds.time)
		})
		.from(user)
		.leftJoin(finds, eq(finds.userId, user.id))
		.leftJoin(korok, eq(korok.id, finds.korokId))
		.where(and(eq(korok.isFindable, true), eq(finds.userId, e.userId)))
		.groupBy(user.id)
		.orderBy(desc(count(finds.id)), asc(max(finds.time)));
	return userStats[0];
});

export const logFind = command(
	v.object({
		korokId: v.string(),
		userId: v.string(),
		time: v.date()
	}),
	async (e) => {
		const k = await db.query.korok.findFirst({
			where: eq(korok.id, e.korokId)
		});
		if (!k) return false;
		const f = await db.query.finds.findFirst({
			where: and(eq(finds.korokId, e.korokId), eq(finds.userId, e.userId))
		});
		if (!f) {
			await db.insert(finds).values({
				korokId: e.korokId,
				userId: e.userId,
				time: e.time
			});
		}
		const userStats = await db
			.select({
				user: user,
				koroksFound: count(finds.id),
				lastFoundAt: max(finds.time)
			})
			.from(user)
			.leftJoin(finds, eq(finds.userId, user.id))
			.groupBy(user.id)
			.where(eq(finds.userId, e.userId));
		const korokStats = await db
			.select({
				korok: korok,
				findCount: count(finds.id)
			})
			.from(korok)
			.leftJoin(finds, eq(finds.korokId, korok.id))
			.groupBy(korok.id)
			.where(eq(finds.korokId, e.korokId));
		if (f)
			return {
				found: true,
				korok: k,
				userFinds: userStats[0].koroksFound,
				korokFinds: korokStats[0].findCount
			};
		return {
			found: false,
			korok: k,
			userFinds: userStats[0].koroksFound,
			korokFinds: korokStats[0].findCount
		};
	}
);

export const getLeaderBoardFinds = query(v.object({ leaderBoardId: v.number() }), async (e) => {
	const userStats = await db
		.select({
			user: user,
			koroksFound: count(finds.id),
			lastFoundAt: max(finds.time)
		})
		.from(user)
		.leftJoin(finds, eq(finds.userId, user.id))
		.leftJoin(korok, and(eq(korok.id, finds.korokId), eq(korok.isFindable, true)))
		.leftJoin(leaderBoardUsers, eq(leaderBoardUsers.userId, user.id))
		.leftJoin(leaderBoards, eq(leaderBoards.id, leaderBoardUsers.leaderBoardId))
		.where(eq(leaderBoards.id, e.leaderBoardId))
		.groupBy(user.id)
		.orderBy(desc(count(finds.id)), asc(max(finds.time)));
	return userStats;
});

export const getMyLeaderboard = query(async () => {
	const user = await getCurrentUser();
	if (!user) return [];

	const myLeaderBoards = await db
		.select({
			id: leaderBoards.id,
			name: leaderBoards.name,
			description: leaderBoards.description,
			code: leaderBoards.code
		})
		.from(leaderBoards)
		.leftJoin(leaderBoardUsers, eq(leaderBoards.id, leaderBoardUsers.leaderBoardId))
		.where(eq(leaderBoardUsers.userId, user.id));
	return myLeaderBoards;
});

export const joinLeaderBoard = query(v.object({ code: v.string() }), async (e) => {
	const user = await getCurrentUser();
	if (!user) return false;
	const leaderBoard = await db
		.select({ id: leaderBoards.id })
		.from(leaderBoards)
		.where(eq(leaderBoards.code, e.code));
	if (!leaderBoard[0]) return false;
	await db.insert(leaderBoardUsers).values({
		leaderBoardId: leaderBoard[0].id,
		userId: user.id
	});
	return true;
});

export const makeLeaderBoard = command(
	v.object({
		name: v.string(),
		description: v.string()
	}),
	async (e) => {
		const user = await getCurrentUser();
		if (!user) return false;
		const leaderBoard = await db
			.insert(leaderBoards)
			.values({ description: e.description, name: e.name, code: generateRandomCode(6) })
			.returning();
		if (!leaderBoard[0]) return false;
		await db.insert(leaderBoardUsers).values({
			leaderBoardId: leaderBoard[0].id,
			userId: user?.id
		});
		return leaderBoard[0];
	}
);

export const deleteAllLeaderBoard = command(async () => {
	const user = await getCurrentUser();
	if (!user || user.role !== 'admin') return false;
	await db.delete(leaderBoardUsers);
	await db.delete(leaderBoards);
	return true;
});

export const leaveLeaderBoard = command(
	v.object({ leaderBoardId: v.number() }),
	async ({ leaderBoardId }) => {
		const user = await getCurrentUser();
		if (!user) return false;
		await db
			.delete(leaderBoardUsers)
			.where(
				and(eq(leaderBoardUsers.userId, user.id), eq(leaderBoardUsers.leaderBoardId, leaderBoardId))
			);
		return true;
	}
);

function generateRandomCode(length: number) {
	let str = '';
	for (let i = 0; i < length; i++) {
		str += String.fromCharCode(65 + Math.round(Math.random() * 25));
	}
	return str;
}
