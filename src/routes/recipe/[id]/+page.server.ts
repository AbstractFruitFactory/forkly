import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { api } from '$lib/server/food-api'

export const load: PageServerLoad = async ({ params }) => {
  const recipeId = params.id

  const recipes = await db.select()
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]
  if (!foundRecipe) {
    throw error(404, 'Recipe not found')
  }

  const nutritionResult = await api.getRecipeInfo(
    foundRecipe.ingredients
      .filter(ing => !ing.custom)
      .map(ing => ({
        amount: ing.quantity,
        unit: ing.measurement,
        name: ing.name
      }))
  )

  const nutrition = nutritionResult.isOk()
    ? {
      totalNutrition: {
        calories: nutritionResult.value.calories,
        protein: nutritionResult.value.protein,
        carbs: nutritionResult.value.carbs,
        fat: nutritionResult.value.fat
      },
      ingredientNutrition: nutritionResult.value.ingredients.map(ing => ing.nutrients),
      hasCustomIngredients: foundRecipe.ingredients.some(i => i.custom)
    }
    : {
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ingredientNutrition: foundRecipe.ingredients.map(() => null),
      hasCustomIngredients: foundRecipe.ingredients.some(i => i.custom)
    }

  return {
    recipe: foundRecipe,
    nutrition
  }
} 