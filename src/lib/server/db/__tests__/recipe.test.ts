import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getRecipes, getRecipeById, getRecipeWithDetails } from '../recipe'
import { setupTestDb, teardownTestDb, createTestUser, createTestRecipe, testDb } from '../test-utils'
import { recipeLike, recipeBookmark, ingredient, recipeNutrition } from '../schema'
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
      const recipes = await getRecipes({ query: 'nonexistent' })
      expect(recipes).toEqual([])
    })

    it('should return basic recipe details', async () => {
      const user = await createTestUser()
      const [recipe] = await createTestRecipe(user.id, { title: 'Unique Test Recipe Basic' })

      const recipes = await getRecipes({ query: 'Unique Test Recipe Basic' })
      expect(recipes).toHaveLength(1)
      expect(recipes[0]).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        tags: ['test'],
        likes: 0
      })
    })

    it('should return detailed recipe information when requested', async () => {
      const user = await createTestUser()
      const [recipe] = await createTestRecipe(user.id, { title: 'Unique Test Recipe Detailed' })

      const recipes = await getRecipes({ query: 'Unique Test Recipe Detailed', detailed: true })
      expect(recipes).toHaveLength(1)
      expect(recipes[0]).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        tags: ['test'],
        servings: recipe.servings,
        likes: 0,
        user: {
          username: user.username
        }
      })
      expect(recipes[0].createdAt).toBeInstanceOf(Date)
    })

    it('should handle pagination correctly', async () => {
      const user = await createTestUser()
      
      // Create 5 test recipes with unique titles
      await Promise.all([
        createTestRecipe(user.id, { id: 'recipe-1', title: 'Pagination Recipe 1' }),
        createTestRecipe(user.id, { id: 'recipe-2', title: 'Pagination Recipe 2' }),
        createTestRecipe(user.id, { id: 'recipe-3', title: 'Pagination Recipe 3' }),
        createTestRecipe(user.id, { id: 'recipe-4', title: 'Pagination Recipe 4' }),
        createTestRecipe(user.id, { id: 'recipe-5', title: 'Pagination Recipe 5' })
      ])

      // Test page 1 with limit 2
      const page1 = await getRecipes({ query: 'Pagination Recipe', limit: 2, page: 0 })
      expect(page1).toHaveLength(2)
      expect(page1[0].id).toBe('recipe-5') // Most recent first
      expect(page1[1].id).toBe('recipe-4')

      // Test page 2 with limit 2
      const page2 = await getRecipes({ query: 'Pagination Recipe', limit: 2, page: 1 })
      expect(page2).toHaveLength(2)
      expect(page2[0].id).toBe('recipe-3')
      expect(page2[1].id).toBe('recipe-2')

      // Test page 3 with limit 2 (should have 1 item)
      const page3 = await getRecipes({ query: 'Pagination Recipe', limit: 2, page: 2 })
      expect(page3).toHaveLength(1)
      expect(page3[0].id).toBe('recipe-1')

      // Test page 4 with limit 2 (should be empty)
      const page4 = await getRecipes({ query: 'Pagination Recipe', limit: 2, page: 3 })
      expect(page4).toHaveLength(0)
    })
  })

  describe('getRecipeById', () => {
    it('should return null for non-existent recipe', async () => {
      const result = await getRecipeById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return recipe details', async () => {
      const user = await createTestUser()
      const [recipe] = await createTestRecipe(user.id, { title: 'Unique Test Recipe ById' })

      const result = await getRecipeById(recipe.id)
      expect(result).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings
      })
    })
  })

  describe('getRecipeWithDetails', () => {
    it('should return null for non-existent recipe', async () => {
      const result = await getRecipeWithDetails('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return recipe with all details', async () => {
      const user = await createTestUser()
      const [recipe] = await createTestRecipe(user.id, { title: 'Unique Test Recipe WithDetails' })

      const result = await getRecipeWithDetails(recipe.id)
      expect(result).toMatchObject({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        tags: ['test'],
        servings: recipe.servings,
        likes: 0,
        user: {
          username: user.username
        }
      })
      expect(result?.createdAt).toBeInstanceOf(Date)
    })
  })

  it('should return undefined nutrition when not provided', async () => {
    const user = await createTestUser()
    const [recipe] = await createTestRecipe(user.id, { title: 'Unique Test Recipe Nutrition' })

    const result = await getRecipeWithDetails(recipe.id)
    expect(result?.nutrition).toBeUndefined()
  })
})