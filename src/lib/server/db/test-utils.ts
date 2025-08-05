import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { recipe, recipeLike, ingredient, recipeNutrition, user, recipeBookmark, recipeTag, tag } from './schema'
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
    passwordHash: 'test-hash',
    email: 'test@example.com'
  }).returning()
}

export async function createTestRecipe(userId: string, recipeData: Partial<typeof recipe.$inferInsert> = {}) {
  const tags: string[] = (recipeData as any).tags ?? ['test']
  const recipeInsert = { ...recipeData, tags: undefined, userId }
  const [createdRecipe] = await testDb.insert(recipe).values({
    id: recipeInsert.id ?? 'test-recipe-id',
    title: recipeInsert.title ?? 'Test Recipe',
    description: recipeInsert.description ?? 'Test Description',
    imageUrl: recipeInsert.imageUrl,
    servings: recipeInsert.servings ?? 1,
    userId: recipeInsert.userId,
    createdAt: recipeInsert.createdAt
  }).returning()
  // Ensure tags exist in tag table before inserting into recipeTag
  for (const tagName of tags) {
    const normalizedTagName = tagName.toLowerCase()
    await testDb.insert(tag).values({ name: normalizedTagName }).onConflictDoNothing()
    await testDb.insert(recipeTag).values({ recipeId: createdRecipe.id, tagName: normalizedTagName })
  }
  return [createdRecipe]
} 