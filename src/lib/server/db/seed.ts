import { recipe, ingredient, recipeIngredient, recipeNutrition, tag, recipeTag } from './schema'
import type { Recipe } from './schema'
import { generateId } from '../id'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as dotenv from 'dotenv'
import { readFile } from 'fs/promises'
import { normalizeIngredientName } from '../utils/normalize-ingredient'

dotenv.config()

const client = postgres(process.env.DATABASE_URL as string)
export const db = drizzle(client)

export const seed = async () => {
  // Force reseed: clean up existing data first
  console.log('Cleaning up existing data to force reseed...')
  try {
    await db.delete(recipeTag)
    await db.delete(recipeIngredient)
    await db.delete(recipeNutrition)
    await db.delete(recipe)
    await db.delete(ingredient)
    await db.delete(tag)
  } catch (error) {
    console.log('Error cleaning up data:', error)
  }

  // Load recipes from JSON
  const recipesJson = await readFile(new URL('./seedRecipes.json', import.meta.url), 'utf-8')
  const sampleRecipesRaw: Array<Omit<Recipe, 'id' | 'createdAt'>> = JSON.parse(recipesJson)

  // Duplicate recipes to reach 1000 total
  const TARGET_RECIPE_COUNT = 1000
  const baseCount = sampleRecipesRaw.length
  const multiplier = Math.ceil(TARGET_RECIPE_COUNT / baseCount)
  let sampleRecipes: Recipe[] = []
  for (let m = 0; m < multiplier; m++) {
    for (const recipe of sampleRecipesRaw) {
      sampleRecipes.push({
        ...recipe,
        id: generateId(),
        createdAt: new Date()
      })
      if (sampleRecipes.length === TARGET_RECIPE_COUNT) break
    }
    if (sampleRecipes.length === TARGET_RECIPE_COUNT) break
  }

  // Extract all unique tags from recipes
  const tagSet = new Set<string>()
  for (const recipe of sampleRecipesRaw) {
    for (const tagName of (recipe as any).tags || []) {
      tagSet.add(tagName)
    }
  }

  // Insert unique tags
  for (const tagName of tagSet) {
    await db.insert(tag)
      .values({ name: tagName })
      .onConflictDoNothing({ target: tag.name })
  }

  // Read all ingredient names from ingredient_list_en.txt
  const ingredientListText = await readFile(new URL('./ingredient_list_en.txt', import.meta.url), 'utf-8')
  const ingredientNames = ingredientListText.split('\n').map((name) => name.trim()).filter(Boolean)
  const ingredientMap = new Map<string, { id: string, name: string }>()
  for (const name of ingredientNames) {
    if (!ingredientMap.has(name)) {
      ingredientMap.set(name, {
        id: generateId(),
        name: name
      })
    }
  }
  // Also add all ingredients from recipes
  for (const recipe of sampleRecipesRaw) {
    for (const ing of (recipe as any).ingredients || []) {
      const normalized = normalizeIngredientName(ing.displayName)
      if (!ingredientMap.has(normalized)) {
        ingredientMap.set(normalized, {
          id: generateId(),
          name: normalized
        })
      }
    }
  }

  // Insert unique ingredients
  for (const { id, name } of ingredientMap.values()) {
    await db.insert(ingredient)
      .values({ id, name })
      .onConflictDoNothing({ target: ingredient.name })
  }

  // Insert recipes
  await db.insert(recipe).values(sampleRecipes)

  // Build and insert recipe-tag relationships
  const allRecipeTags = []
  for (let i = 0; i < sampleRecipes.length; i++) {
    const recipe = sampleRecipes[i]
    // Find the corresponding raw recipe (by modulo, since we duplicated)
    const rawRecipe = sampleRecipesRaw[i % baseCount]
    for (const tagName of (rawRecipe as any).tags || []) {
      allRecipeTags.push({
        recipeId: recipe.id,
        tagName: tagName
      })
    }
  }
  console.log('Inserting recipe-tag relationships...')
  await db.insert(recipeTag).values(allRecipeTags)

  // Build and insert recipe-ingredient relationships
  const allRecipeIngredients = []
  for (let i = 0; i < sampleRecipes.length; i++) {
    const recipe = sampleRecipes[i]
    // Find the corresponding raw recipe (by modulo, since we duplicated)
    const rawRecipe = sampleRecipesRaw[i % baseCount]
    for (const ing of (rawRecipe as any).ingredients || []) {
      const normalized = normalizeIngredientName(ing.displayName)
      const ingredientEntry = ingredientMap.get(normalized)
      if (!ingredientEntry) continue
      allRecipeIngredients.push({
        recipeId: recipe.id,
        ingredientId: ingredientEntry.id,
        displayName: ing.displayName,
        quantity: ing.quantity,
        measurement: ing.measurement
      })
    }
  }
  await db.insert(recipeIngredient).values(allRecipeIngredients)

  // Generate random nutrition data for each recipe
  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  function randomNutrition(recipe: Recipe) {
    // Optionally, you could use recipe.tags or title to bias the ranges
    return {
      recipeId: recipe.id,
      calories: randomInt(150, 900),
      protein: randomInt(2, 60),
      carbs: randomInt(5, 120),
      fat: randomInt(2, 60)
    }
  }
  const recipeNutritionData = sampleRecipes.map(randomNutrition)

  console.log('Inserting nutrition data...')
  await db.insert(recipeNutrition).values(recipeNutritionData)
}

seed().catch((err) => {
  console.error('Failed to seed database:', err)
  process.exit(1)
}).then(() => {
  console.log('Database seeded successfully!')
  process.exit(0)
})
