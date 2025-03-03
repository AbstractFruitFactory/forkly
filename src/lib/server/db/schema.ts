import type { DietType, MeasurementUnit } from '$lib/types'
import { pgTable, text, timestamp, jsonb, integer, primaryKey, foreignKey, real, boolean } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	bio: text('bio'),
	avatarUrl: text('avatar_url')
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
	spoonacularId: integer('spoonacular_id').unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	custom: boolean('custom').default(false).notNull()
})

export const recipe = pgTable('recipe', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description').notNull(),
	instructions: jsonb('instructions').$type<{
		text: string;
		mediaUrl?: string;
		mediaType?: 'image' | 'video';
	}[]>().notNull(),
	diets: jsonb('diets').$type<DietType[]>().default([]).notNull(),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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

export const recipeIngredient = pgTable('recipe_ingredient', {
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	ingredientId: text('ingredient_id')
		.notNull()
		.references(() => ingredient.id, { onDelete: 'cascade' }),
	quantity: real('quantity').notNull(),
	measurement: text('measurement').$type<MeasurementUnit>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.recipeId, table.ingredientId] })
	}
})

export type Session = typeof session.$inferSelect

export type User = typeof user.$inferSelect

export type Recipe = typeof recipe.$inferSelect

export type IngredientRecord = typeof ingredient.$inferSelect

export type RecipeIngredient = typeof recipeIngredient.$inferSelect

export type RecipeNutrition = typeof recipeNutrition.$inferSelect
