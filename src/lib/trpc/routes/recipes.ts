import { TRPCError } from '@trpc/server'
import { t } from '../t'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import * as v from 'valibot'
import { generateId } from '$lib/server/id'
import { eq, desc, and } from 'drizzle-orm'
import type { MeasurementUnit } from '$lib/types'
import { measurementUnits } from '$lib/types'

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.event.locals.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' })
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.event.locals.user
		}
	})
})

const baseIngredientSchema = v.object({
	name: v.string(),
	quantity: v.number(),
	measurement: v.pipe(
		v.string(),
		v.custom<MeasurementUnit>(
			(value) => measurementUnits.includes(value as MeasurementUnit),
			'Invalid measurement unit'
		)
	)
})

const createRecipeSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1)),
	description: v.pipe(v.string(), v.minLength(1)),
	ingredients: v.array(
		v.union([
			v.intersect([
				baseIngredientSchema,
				v.object({
					custom: v.literal(true)
				})
			]),
			v.intersect([
				baseIngredientSchema,
				v.object({
					custom: v.literal(false),
					spoonacularId: v.number(),
				})
			]),
			v.intersect([
				baseIngredientSchema,
				v.object({
					custom: v.literal(false),
					openfoodfactsId: v.number(),
				})
			]),
			v.intersect([
				baseIngredientSchema,
				v.object({
					custom: v.literal(false),
					usdaId: v.number(),
				})
			])
		])
	),
	instructions: v.array(v.string()),
	nutrition: v.object({
		totalNutrition: v.object({
			calories: v.number(),
			protein: v.number(),
			carbs: v.number(),
			fat: v.number()
		}),
		hasCustomIngredients: v.boolean()
	}),
	imageUrl: v.optional(v.string())
})

export const recipesRouter = t.router({
	create: protectedProcedure
		.input(v.parser(createRecipeSchema))
		.mutation(async ({ input, ctx }) => {
			const newRecipe = await db.insert(recipe).values({
				id: generateId(),
				userId: ctx.user.id,
				title: input.title,
				description: input.description,
				ingredients: input.ingredients,
				instructions: input.instructions,
				nutrition: input.nutrition,
				imageUrl: input.imageUrl,
				likes: 0,
				createdAt: new Date()
			}).returning()
			return newRecipe[0]
		}),

	getUserRecipes: protectedProcedure.query(async ({ ctx }) => {
		const recipes = await db
			.select()
			.from(recipe)
			.where(eq(recipe.userId, ctx.user.id))
			.orderBy(desc(recipe.createdAt))
		return recipes
	}),

	delete: protectedProcedure
		.input(v.parser(v.object({ id: v.string() })))
		.mutation(async ({ input, ctx }) => {
			const recipeToDelete = await db
				.select()
				.from(recipe)
				.where(and(
					eq(recipe.id, input.id),
					eq(recipe.userId, ctx.user.id)
				))
				.limit(1)

			if (!recipeToDelete.length) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Recipe not found or you do not have permission to delete it'
				})
			}

			await db.delete(recipe).where(eq(recipe.id, input.id))
			return { success: true }
		})
}) 