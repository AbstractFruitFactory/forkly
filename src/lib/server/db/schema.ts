import { pgTable, text, timestamp, jsonb, integer, primaryKey, real, check, boolean, foreignKey } from 'drizzle-orm/pg-core'
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
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const recipe = pgTable('recipe', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	tags: jsonb('tags').$type<string[]>().default([]).notNull(),
        imageUrl: text('image_url'),
        servings: integer('servings').notNull().default(1),
        draft: boolean('draft').notNull().default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		titleLength: check('recipe_title_length', sql`length(${table.title}) <= 80 and length(${table.title}) >= 5`)
	}
})

export const recipeInstruction = pgTable('recipe_instruction', {
	id: text('id').primaryKey(),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	mediaUrl: text('media_url'),
	mediaType: text('media_type', { enum: ['image', 'video'] }),
	order: integer('order').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const recipeIngredient = pgTable('recipe_ingredient', {
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	instructionId: text('instruction_id')
		.notNull()
		.references(() => recipeInstruction.id, { onDelete: 'cascade' }),
	ingredientId: text('ingredient_id')
		.notNull()
		.references(() => ingredient.id, { onDelete: 'cascade' }),
	displayName: text('display_name').notNull(),
	quantity: real('quantity'),
	measurement: text('measurement'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.recipeId, table.instructionId, table.ingredientId] }),
		uniqueInstructionIngredient: sql`UNIQUE(${table.instructionId}, ${table.ingredientId}, ${table.displayName})`,
		quantityNonZero: check('quantity_non_zero', sql`quantity IS NULL OR quantity <> 0`)
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


export const collection = pgTable('collection', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.name] })
	}
})

export const recipeBookmark = pgTable('recipe_bookmark', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	collectionName: text('collection_name'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.userId, table.recipeId] }),
		collectionFk: foreignKey({
			columns: [table.userId, table.collectionName],
			foreignColumns: [collection.userId, collection.name],
		}).onDelete('cascade')
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

export const tag = pgTable('tag', {
	name: text('name').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		nameLength: check('tag_name_length', sql`length(${table.name}) < 15`)
	}
})

export const recipeTag = pgTable('recipe_tag', {
	recipeId: text('recipe_id')
		.notNull()
		.references(() => recipe.id, { onDelete: 'cascade' }),
	tagName: text('tag_name')
		.notNull()
		.references(() => tag.name, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.recipeId, table.tagName] })
	}
})

export const emailVerification = pgTable('email_verification', {
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
})

export type Session = typeof session.$inferSelect

export type User = typeof user.$inferSelect

export type Recipe = typeof recipe.$inferSelect

export type RecipeInstruction = typeof recipeInstruction.$inferSelect

export type IngredientRecord = typeof ingredient.$inferSelect

export type RecipeIngredient = typeof recipeIngredient.$inferSelect

export type RecipeNutrition = typeof recipeNutrition.$inferSelect

export type RecipeComment = typeof recipeComment.$inferSelect

export type Collection = typeof collection.$inferSelect

export type Tag = typeof tag.$inferSelect

export type RecipeTag = typeof recipeTag.$inferSelect
