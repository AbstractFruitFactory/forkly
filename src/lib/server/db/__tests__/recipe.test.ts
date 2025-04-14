import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getRecipes, getRecipeById, getRecipeWithDetails } from '../recipe'
import { setupTestDb, teardownTestDb, createTestUser, createTestRecipe, testDb } from '../test-utils'
import { recipe, recipeLike, recipeDislike, recipeBookmark, recipeIngredient, ingredient, recipeNutrition } from '../schema'
import { randomUUID } from 'crypto'

describe('recipe.ts', () => {
  beforeAll(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  beforeEach(async () => {
    await setupTestDb() // Clear database before each test
  })

  describe('getRecipes', () => {
    it('should return empty array when no recipes exist', async () => {
      const recipes = await getRecipes({ query: 'test' })
      expect(recipes).toEqual([])
    })

    it('should return basic recipe details', async () => {
      const [user] = await createTestUser(randomUUID())
      const [recipe] = await createTestRecipe(user.id)

      const recipes = await getRecipes({ query: 'Test' })
      expect(recipes).toHaveLength(1)
      expect(recipes[0]).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        tags: recipe.tags,
        likes: 0
      })
    })

    it('should return detailed recipe information when requested', async () => {
      const [user] = await createTestUser(randomUUID())
      const [recipe] = await createTestRecipe(user.id)

      const recipes = await getRecipes({ query: 'Test', detailed: true })
      expect(recipes).toHaveLength(1)
      expect(recipes[0]).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        tags: recipe.tags,
        servings: recipe.servings,
        likes: 0,
        dislikes: 0,
        user: {
          username: user.username
        }
      })
      expect(recipes[0].createdAt).toBeInstanceOf(Date)
    })

    it('should handle pagination correctly', async () => {
      const [user] = await createTestUser(randomUUID())
      
      // Create 5 test recipes
      await Promise.all([
        createTestRecipe(user.id, { id: 'recipe-1', title: 'Recipe 1' }),
        createTestRecipe(user.id, { id: 'recipe-2', title: 'Recipe 2' }),
        createTestRecipe(user.id, { id: 'recipe-3', title: 'Recipe 3' }),
        createTestRecipe(user.id, { id: 'recipe-4', title: 'Recipe 4' }),
        createTestRecipe(user.id, { id: 'recipe-5', title: 'Recipe 5' })
      ])

      // Test page 1 with limit 2
      const page1 = await getRecipes({ query: 'Recipe', limit: 2, page: 0 })
      expect(page1).toHaveLength(2)
      expect(page1[0].id).toBe('recipe-5') // Most recent first
      expect(page1[1].id).toBe('recipe-4')

      // Test page 2 with limit 2
      const page2 = await getRecipes({ query: 'Recipe', limit: 2, page: 1 })
      expect(page2).toHaveLength(2)
      expect(page2[0].id).toBe('recipe-3')
      expect(page2[1].id).toBe('recipe-2')

      // Test page 3 with limit 2 (should have 1 item)
      const page3 = await getRecipes({ query: 'Recipe', limit: 2, page: 2 })
      expect(page3).toHaveLength(1)
      expect(page3[0].id).toBe('recipe-1')

      // Test page 4 with limit 2 (should be empty)
      const page4 = await getRecipes({ query: 'Recipe', limit: 2, page: 3 })
      expect(page4).toHaveLength(0)
    })
  })

  describe('getRecipeById', () => {
    it('should return null for non-existent recipe', async () => {
      const result = await getRecipeById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return recipe details', async () => {
      const [user] = await createTestUser(randomUUID())
      const [recipe] = await createTestRecipe(user.id)

      const result = await getRecipeById(recipe.id)
      expect(result).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        tags: recipe.tags,
        servings: recipe.servings
      })
      expect(result?.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('getRecipeWithDetails', () => {
    it('should return null for non-existent recipe', async () => {
      const result = await getRecipeWithDetails('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return recipe with all details', async () => {
      const [user] = await createTestUser(randomUUID())
      const [recipe] = await createTestRecipe(user.id)

      // Add some likes, dislikes, and bookmarks
      await testDb.insert(recipeLike).values({ userId: user.id, recipeId: recipe.id })
      await testDb.insert(recipeDislike).values({ userId: user.id, recipeId: recipe.id })
      await testDb.insert(recipeBookmark).values({ userId: user.id, recipeId: recipe.id })

      // Add an ingredient
      const [testIngredient] = await testDb.insert(ingredient).values({
        id: randomUUID(),
        name: 'Test Ingredient'
      }).returning()

      await testDb.insert(recipeIngredient).values({
        recipeId: recipe.id,
        ingredientId: testIngredient.id,
        quantity: 1,
        measurement: 'cup'
      })

      // Add nutrition info
      await testDb.insert(recipeNutrition).values({
        recipeId: recipe.id,
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5
      })

      const result = await getRecipeWithDetails(recipe.id, user.id)
      expect(result).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        tags: recipe.tags,
        servings: recipe.servings,
        isLiked: true,
        isDisliked: true,
        isSaved: true,
        likes: 1,
        dislikes: 1,
        ingredients: [{
          id: testIngredient.id,
          name: testIngredient.name,
          quantity: 1,
          measurement: 'cup',
          custom: testIngredient.custom
        }],
        nutrition: {
          calories: 100,
          protein: 10,
          carbs: 20,
          fat: 5
        }
      })
      expect(result?.createdAt).toBeInstanceOf(Date)
    })
  })
}) 