import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';
import { v4 as uuidv4 } from 'uuid';

export const korok = sqliteTable('korok', {
	id: text('id')
		.$defaultFn(() => uuidv4())
		.primaryKey(),
	type: integer('type').notNull(),
	number: integer('number').notNull(),
	description: text('description').notNull(),
	lat: real('lat').notNull(),
	lng: real('lng').notNull(),
	release: integer('release').notNull(),
	isRelease: integer('is-release', { mode: 'boolean' }).notNull(),
	isFindable: integer('is-findable', { mode: 'boolean' }).default(true).notNull(),
	isRemoved: integer('is-removed', { mode: 'boolean' }).default(false).notNull()
});

export const area = sqliteTable('area', {
	id: integer('id').primaryKey(),
	color: text('color').notNull(),
	points: text('points', { mode: 'json' }).$type<[number, number][]>().notNull()
});

export const finds = sqliteTable('find', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	korokId: text('korok-id')
		.references(() => korok.id)
		.notNull(),
	userId: text('user-id')
		.references(() => user.id)
		.notNull(),
	time: integer('time', { mode: 'timestamp_ms' }).notNull()
});

export const leaderBoards = sqliteTable('leader-board', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description').notNull(),
	code: text('code').notNull().unique()
});

export const leaderBoardUsers = sqliteTable('leader-board-users', {
	leaderBoardId: integer('leader-board-id'),
	userId: text('user-id')
});

export const userRelations = relations(user, ({ many }) => ({
	finds: many(finds),
	leaderBoards: many(leaderBoards)
}));

export const korokRelations = relations(user, ({ many }) => ({
	finds: many(finds)
}));

export const findsRelations = relations(finds, ({ one }) => ({
	user: one(user, {
		fields: [finds.userId],
		references: [user.id]
	}),
	korok: one(korok, {
		fields: [finds.userId],
		references: [korok.id]
	})
}));

export const leaderRelations = relations(leaderBoards, ({ many }) => ({
	leaderBoardUsers: many(leaderBoardUsers)
}));

export const leaderBoardUserRelations = relations(leaderBoardUsers, ({ one }) => ({
	leaderBoard: one(leaderBoards, {
		fields: [leaderBoardUsers.leaderBoardId],
		references: [leaderBoards.id]
	}),
	user: one(user, {
		fields: [leaderBoardUsers.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
