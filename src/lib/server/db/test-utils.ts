import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { recipe, recipeLike, recipeDislike, recipeIngredient, ingredient, recipeNutrition, user, recipeBookmark } from './schema'
import { sql } from 'drizzle-orm'

// Create a test database connection
const testConnection = postgres(process.env.DATABASE_URL || '', { max: 1 })
export const testDb = drizzle(testConnection)

// Test database setup and teardown utilities
export async function setupTestDb() {
  // Clear all tables if they exist
  try {
    await testDb.delete(recipeBookmark)
    await testDb.delete(recipeLike)
    await testDb.delete(recipeDislike)
    await testDb.delete(recipeIngredient)
    await testDb.delete(recipeNutrition)
    await testDb.delete(recipe)
    await testDb.delete(ingredient)
    await testDb.delete(user)
  } catch (error) {
    // Tables might not exist yet, that's okay
  }
}

export async function teardownTestDb() {
  await testConnection.end()
}

// Helper function to create test data
export async function createTestUser(id: string = 'test-user-id') {
  return await testDb.insert(user).values({
    id,
    username: 'test-user',
    passwordHash: 'test-hash'
  }).returning()
}

export async function createTestRecipe(userId: string, recipeData: Partial<typeof recipe.$inferInsert> = {}) {
  return await testDb.insert(recipe).values({
    id: 'test-recipe-id',
    title: 'Test Recipe',
    description: 'Test Description',
    instructions: [{ text: 'Test instruction' }],
    tags: ['test'],
    userId,
    servings: 1,
    ...recipeData
  }).returning()
} 