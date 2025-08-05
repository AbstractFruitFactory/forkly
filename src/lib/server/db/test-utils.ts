import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { recipe, recipeLike, ingredient, recipeNutrition, user, recipeBookmark, recipeTag, tag, recipeIngredient, recipeInstruction, recipeComment, collection, emailVerification, session, recipeDraft } from './schema'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// Create a test database connection
const testConnection = postgres(process.env.DATABASE_URL || '', { max: 1 })
export const testDb = drizzle(testConnection)

// Test database setup and teardown utilities
export async function setupTestDb() {
  try {
    // Use TRUNCATE with CASCADE for more reliable cleanup
    // This will clear all tables and reset sequences
    await testDb.execute(sql`
      TRUNCATE TABLE 
        recipe_bookmark,
        recipe_like,
        recipe_nutrition,
        recipe_tag,
        recipe_ingredient,
        recipe_instruction,
        recipe_comment,
        recipe_draft,
        recipe,
        collection,
        email_verification,
        session,
        ingredient,
        tag,
        "user"
      CASCADE
    `)
  } catch (error) {
    console.error('Error during test database cleanup:', error)
    // If TRUNCATE fails, fall back to DELETE statements in correct order
    try {
      await testDb.delete(recipeBookmark)
      await testDb.delete(recipeLike)
      await testDb.delete(recipeNutrition)
      await testDb.delete(recipeTag)
      await testDb.delete(recipeIngredient)
      await testDb.delete(recipeInstruction)
      await testDb.delete(recipeComment)
      await testDb.delete(recipeDraft)
      await testDb.delete(recipe)
      await testDb.delete(collection)
      await testDb.delete(emailVerification)
      await testDb.delete(session)
      await testDb.delete(ingredient)
      await testDb.delete(tag)
      await testDb.delete(user)
    } catch (deleteError) {
      console.error('Error during fallback DELETE cleanup:', deleteError)
      throw new Error(`Failed to clean test database: ${deleteError}`)
    }
  }
}

export async function teardownTestDb() {
  await testConnection.end()
}

// Helper function to create test data with transaction
export async function createTestUser(id: string = randomUUID()) {
  const userId = id
  const [testUser] = await testDb.insert(user).values({
    id: userId,
    username: `test-user-${userId.slice(0, 8)}`,
    passwordHash: 'test-hash',
    email: `test-${userId.slice(0, 8)}@example.com`
  }).returning()
  return testUser
}

export async function createTestRecipe(userId: string, recipeData: Partial<typeof recipe.$inferInsert> = {}) {
  const tags: string[] = (recipeData as any).tags ?? ['test']
  const recipeInsert = { ...recipeData, tags: undefined, userId }
  
  // Create recipe first
  const [createdRecipe] = await testDb.insert(recipe).values({
    id: recipeInsert.id ?? randomUUID(),
    title: recipeInsert.title ?? 'Test Recipe',
    description: recipeInsert.description ?? 'Test Description',
    imageUrl: recipeInsert.imageUrl,
    servings: recipeInsert.servings ?? 1,
    userId: recipeInsert.userId,
    createdAt: recipeInsert.createdAt
  }).returning()
  
  // Then create tags and recipe-tag relationships
  for (const tagName of tags) {
    const normalizedTagName = tagName.toLowerCase()
    await testDb.insert(tag).values({ name: normalizedTagName }).onConflictDoNothing()
    await testDb.insert(recipeTag).values({ recipeId: createdRecipe.id, tagName: normalizedTagName })
  }
  
  return [createdRecipe]
} 