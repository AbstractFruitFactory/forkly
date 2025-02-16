import type { MeasurementUnit } from '$lib/types'
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
})

export const recipe = pgTable('recipe', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.references(() => user.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	ingredients: jsonb('ingredients').$type<{
		name: string
		quantity: number
		measurement: MeasurementUnit
	}[]>().notNull(),
	instructions: jsonb('instructions').$type<string[]>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export type Session = typeof session.$inferSelect

export type User = typeof user.$inferSelect

export type Recipe = typeof recipe.$inferSelect
