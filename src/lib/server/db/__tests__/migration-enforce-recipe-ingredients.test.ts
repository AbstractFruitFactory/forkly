import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDb, teardownTestDb, testDb } from '../test-utils'
import { recipe, recipeIngredient, recipeInstruction, ingredient, user } from '../schema'
import { randomUUID } from 'crypto'
import { eq, and } from 'drizzle-orm'

describe('Migration: Enforce Recipe Has Ingredients', () => {
  beforeAll(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  beforeEach(async () => {
    await setupTestDb()
  })

  async function createTestUser() {
    const userId = randomUUID()
    const [testUser] = await testDb.insert(user).values({
      id: userId,
      username: `test-user-${userId.slice(0, 8)}`,
      passwordHash: 'test-hash',
      email: `test-${userId.slice(0, 8)}@example.com`
    }).returning()
    return testUser
  }

  async function createTestIngredient(name?: string) {
    const ingredientId = randomUUID()
    const [testIngredient] = await testDb.insert(ingredient).values({
      id: ingredientId,
      name: name || `Test Ingredient ${ingredientId.slice(0, 8)}`
    }).returning()
    return testIngredient
  }

  it('should allow creating a recipe with ingredients', async () => {
    const testUser = await createTestUser()
    const testIngredient = await createTestIngredient()

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [testInstruction] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Test instruction',
      order: 1
    }).returning()

    const [testRecipeIngredient] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: testInstruction.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    expect(testRecipeIngredient).toBeDefined()
    expect(testRecipeIngredient.recipeId).toBe(testRecipe.id)
  })

  it('should prevent deleting the last ingredient from a recipe', async () => {
    const testUser = await createTestUser()
    const testIngredient = await createTestIngredient()

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [testInstruction] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Test instruction',
      order: 1
    }).returning()

    const [testRecipeIngredient] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: testInstruction.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    // Try to delete the only ingredient - this should fail
    await expect(
      testDb.delete(recipeIngredient).where(
        and(
          eq(recipeIngredient.recipeId, testRecipe.id),
          eq(recipeIngredient.instructionId, testInstruction.id),
          eq(recipeIngredient.ingredientId, testIngredient.id)
        )
      )
    ).rejects.toThrow('Recipe must have at least one ingredient')
  })

  it('should allow deleting an ingredient when recipe has multiple ingredients', async () => {
    const testUser = await createTestUser()
    const timestamp = Date.now()
    const ingredient1 = await createTestIngredient(`Ingredient 1 Test ${timestamp}`)
    const ingredient2 = await createTestIngredient(`Ingredient 2 Test ${timestamp + 1}`)

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [testInstruction] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Test instruction',
      order: 1
    }).returning()

    const [recipeIngredient1] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: testInstruction.id,
      ingredientId: ingredient1.id,
      displayName: 'Ingredient 1',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    const [recipeIngredient2] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: testInstruction.id,
      ingredientId: ingredient2.id,
      displayName: 'Ingredient 2',
      quantity: '2',
      measurement: 'tbsp'
    }).returning()

    // Delete one ingredient - this should succeed since there's still another ingredient
    await testDb.delete(recipeIngredient).where(
      and(
        eq(recipeIngredient.recipeId, testRecipe.id),
        eq(recipeIngredient.instructionId, testInstruction.id),
        eq(recipeIngredient.ingredientId, ingredient1.id)
      )
    )

    // Verify the other ingredient still exists
    const remainingIngredients = await testDb.select().from(recipeIngredient).where(
      eq(recipeIngredient.recipeId, testRecipe.id)
    )
    expect(remainingIngredients).toHaveLength(1)
    expect(remainingIngredients[0].ingredientId).toBe(ingredient2.id)
  })

  it('should allow deleting ingredients when recipe has ingredients in different instructions', async () => {
    const testUser = await createTestUser()
    const testIngredient = await createTestIngredient()

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [instruction1] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Instruction 1',
      order: 1
    }).returning()

    const [instruction2] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Instruction 2',
      order: 2
    }).returning()

    const [recipeIngredient1] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: instruction1.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    const [recipeIngredient2] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: instruction2.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '2',
      measurement: 'tbsp'
    }).returning()

    // Delete ingredient from instruction 1 - this should succeed since there's still an ingredient in instruction 2
    await testDb.delete(recipeIngredient).where(
      and(
        eq(recipeIngredient.recipeId, testRecipe.id),
        eq(recipeIngredient.instructionId, instruction1.id),
        eq(recipeIngredient.ingredientId, testIngredient.id)
      )
    )

    // Verify the ingredient in instruction 2 still exists
    const remainingIngredients = await testDb.select().from(recipeIngredient).where(
      eq(recipeIngredient.recipeId, testRecipe.id)
    )
    expect(remainingIngredients).toHaveLength(1)
    expect(remainingIngredients[0].instructionId).toBe(instruction2.id)
  })

  it('should prevent deleting the last ingredient even when recipe has multiple instructions', async () => {
    const testUser = await createTestUser()
    const testIngredient = await createTestIngredient()

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [instruction1] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Instruction 1',
      order: 1
    }).returning()

    const [instruction2] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Instruction 2',
      order: 2
    }).returning()

    const [recipeIngredient1] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: instruction1.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    const [recipeIngredient2] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: instruction2.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '2',
      measurement: 'tbsp'
    }).returning()

    // Delete ingredient from instruction 1
    await testDb.delete(recipeIngredient).where(
      and(
        eq(recipeIngredient.recipeId, testRecipe.id),
        eq(recipeIngredient.instructionId, instruction1.id),
        eq(recipeIngredient.ingredientId, testIngredient.id)
      )
    )

    // Try to delete the last remaining ingredient - this should fail
    await expect(
      testDb.delete(recipeIngredient).where(
        and(
          eq(recipeIngredient.recipeId, testRecipe.id),
          eq(recipeIngredient.instructionId, instruction2.id),
          eq(recipeIngredient.ingredientId, testIngredient.id)
        )
      )
    ).rejects.toThrow('Recipe must have at least one ingredient')
  })

  it('should allow creating a recipe without ingredients initially (ingredients added separately)', async () => {
    const testUser = await createTestUser()

    // Creating a recipe without ingredients should be allowed
    // (ingredients are typically added after recipe creation)
    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    expect(testRecipe).toBeDefined()
    expect(testRecipe.title).toBe('Test Recipe')

    // Verify the recipe exists but has no ingredients
    const recipeIngredients = await testDb.select().from(recipeIngredient).where(
      eq(recipeIngredient.recipeId, testRecipe.id)
    )
    expect(recipeIngredients).toHaveLength(0)
  })

  it('should enforce ingredient requirement when trying to delete all ingredients from a recipe', async () => {
    const testUser = await createTestUser()
    const testIngredient = await createTestIngredient()

    const [testRecipe] = await testDb.insert(recipe).values({
      id: randomUUID(),
      title: 'Test Recipe',
      description: 'Test Description',
      userId: testUser.id,
      servings: 2
    }).returning()

    const [testInstruction] = await testDb.insert(recipeInstruction).values({
      id: randomUUID(),
      recipeId: testRecipe.id,
      text: 'Test instruction',
      order: 1
    }).returning()

    const [testRecipeIngredient] = await testDb.insert(recipeIngredient).values({
      recipeId: testRecipe.id,
      instructionId: testInstruction.id,
      ingredientId: testIngredient.id,
      displayName: 'Test Ingredient',
      quantity: '1',
      measurement: 'cup'
    }).returning()

    // Try to delete all ingredients for this recipe - this should fail
    await expect(
      testDb.delete(recipeIngredient).where(
        eq(recipeIngredient.recipeId, testRecipe.id)
      )
    ).rejects.toThrow('Recipe must have at least one ingredient')

    // Verify the ingredient still exists
    const remainingIngredients = await testDb.select().from(recipeIngredient).where(
      eq(recipeIngredient.recipeId, testRecipe.id)
    )
    expect(remainingIngredients).toHaveLength(1)
    expect(remainingIngredients[0].ingredientId).toBe(testIngredient.id)
  })
}) 