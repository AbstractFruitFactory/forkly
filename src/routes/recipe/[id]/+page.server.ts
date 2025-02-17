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

  const getNutrition = async (foundRecipe: typeof recipe.$inferSelect) => {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }

    const ingredientNutrition = []
    for (const ingredient of foundRecipe.ingredients) {
      const nutritionResult = await api.getNutritionInfo(
        ingredient.spoonacularId,
        ingredient.quantity,
        ingredient.measurement
      )

      if (nutritionResult.isOk()) {
        const nutrition = nutritionResult.value
        totalNutrition.calories += nutrition.calories
        totalNutrition.protein += nutrition.protein
        totalNutrition.carbs += nutrition.carbs
        totalNutrition.fat += nutrition.fat
        ingredientNutrition.push(nutrition)
      } else {
        console.error(nutritionResult.error)
      }
    }

    return {
      totalNutrition,
      ingredientNutrition
    }
  }

  return {
    recipe: foundRecipe,
    nutrition: getNutrition(foundRecipe)
  }
} 