import { pgTable, text, timestamp, jsonb, integer, primaryKey, real, check, boolean } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	bio: text('bio'),
	avatarUrl: text('avatar_url'),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	googleId: text('google_id').unique(),
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
})

export const ingredient = pgTable('ingredient', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const recipe = pgTable('recipe', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	instructions: jsonb('instructions').$type<{
		text: string
		mediaUrl?: string
		mediaType?: 'image' | 'video'
	}[]>().notNull(),
	tags: jsonb('tags').$type<string[]>().default([]).notNull(),
	imageUrl: text('image_url'),
	servings: integer('servings').notNull().default(1),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		tagLengthCheck: sql`json_array_length(jsonb_path_query_array(${table.tags}, '$[*] ? (@.type() == "string" && length(@) < 10)')) = json_array_length(${table.tags})`.as('tags_length_check')
	}
})

export const recipeNutrition = pgTable('recipe_nutrition', {
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	calories: real('calories').notNull(),
	protein: real('protein').notNull(),
	carbs: real('carbs').notNull(),
	fat: real('fat').notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.recipeId] })
	}
})

export const recipeLike = pgTable('recipe_like', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.recipeId] })
	}
})

export const recipeDislike = pgTable('recipe_dislike', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.recipeId] })
	}
})

export const recipeBookmark = pgTable('recipe_bookmark', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.recipeId] })
	}
})

export const recipeIngredient = pgTable('recipe_ingredient', {
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	ingredientId: text('ingredient_id')
		.notNull()
		.references(() => ingredient.id, { onDelete: 'cascade' }),
	displayName: text('display_name').notNull(),
	quantity: real('quantity'),
	measurement: text('measurement'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.recipeId, table.ingredientId, table.displayName] }),
		quantityNonZero: check('quantity_non_zero', sql`quantity IS NULL OR quantity <> 0`)
	}
})

export const recipeComment = pgTable('recipe_comment', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const emailVerification = pgTable('email_verification', {
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
})

export type Session = typeof session.$inferSelect

export type User = typeof user.$inferSelect

export type Recipe = typeof recipe.$inferSelect

export type IngredientRecord = typeof ingredient.$inferSelect

export type RecipeIngredient = typeof recipeIngredient.$inferSelect

export type RecipeNutrition = typeof recipeNutrition.$inferSelect

export type RecipeComment = typeof recipeComment.$inferSelect
