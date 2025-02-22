import type { MeasurementUnit } from '$lib/types'
import { pgTable, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core'

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
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
})

type BaseIngredient = {
	name: string
	quantity: number
	measurement: MeasurementUnit
}

type SpoonacularIngredient = BaseIngredient & {
	spoonacularId: number
	custom: false
}

type OpenFoodFactsIngredient = BaseIngredient & {
	openfoodfactsId: number
	custom: false
}

type UsdaIngredient = BaseIngredient & {
	usdaId: number
	custom: false
}

type CustomIngredient = BaseIngredient & {
	custom: true
}

type LookupIngredient = SpoonacularIngredient | OpenFoodFactsIngredient | UsdaIngredient
type Ingredient = LookupIngredient | CustomIngredient

type NutritionInfo = {
	calories: number
	protein: number
	carbs: number
	fat: number
}

export const recipe = pgTable('recipe', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.references(() => user.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	ingredients: jsonb('ingredients').$type<Ingredient[]>().notNull(),
	instructions: jsonb('instructions').$type<string[]>().notNull(),
	nutrition: jsonb('nutrition').$type<{
		totalNutrition: NutritionInfo
		hasCustomIngredients: boolean
	}>().notNull(),
	imageUrl: text('image_url'),
	likes: integer('likes').default(0).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Session = typeof session.$inferSelect

export type User = typeof user.$inferSelect

export type Recipe = typeof recipe.$inferSelect
