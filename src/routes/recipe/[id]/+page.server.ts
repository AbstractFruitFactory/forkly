import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe, recipeLike, ingredient, recipeIngredient, recipeNutrition } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const recipeId = params.id

  const recipes = await db.select({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
    diets: recipe.diets
  })
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]

  if (!foundRecipe) throw error(404, 'Recipe not found')

  // Get recipe ingredients
  const recipeIngredients = await db
    .select({
      ingredient: ingredient,
      quantity: recipeIngredient.quantity,
      measurement: recipeIngredient.measurement
    })
    .from(recipeIngredient)
    .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
    .where(eq(recipeIngredient.recipeId, recipeId))

  const nutritionData = await db
    .select()
    .from(recipeNutrition)
    .where(eq(recipeNutrition.recipeId, recipeId))

  const nutrition = nutritionData[0] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }

  // Get like status if user is logged in
  let isLiked = false
  if (locals.user?.id) {
    const likes = await db
      .select()
      .from(recipeLike)
      .where(and(
        eq(recipeLike.recipeId, recipeId),
        eq(recipeLike.userId, locals.user.id)
      ))
    isLiked = likes.length > 0
  }

  const likes = await db
    .select()
    .from(recipeLike)
    .where(eq(recipeLike.recipeId, recipeId))

  return {
    recipe: {
      ...foundRecipe,
      ingredients: recipeIngredients.map(ri => ({
        name: ri.ingredient.name,
        quantity: ri.quantity,
        measurement: ri.measurement,
        custom: ri.ingredient.custom,
        spoonacularId: ri.ingredient.spoonacularId
      })),
      isLiked,
      likes: likes.length
    },
    nutrition
  }
}