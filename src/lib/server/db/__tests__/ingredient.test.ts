import { testDb, setupTestDb, teardownTestDb } from '../test-utils'
import { ingredient } from '../schema'
import { addIngredient } from '../ingredient'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { normalizeIngredientName } from '$lib/server/utils/normalize-ingredient'

// No custom seedIngredient helper; use addIngredient for all creation

describe('addIngredient', () => {
  beforeAll(async () => {
    await setupTestDb()
  })
  afterAll(async () => {
    await teardownTestDb()
  })
  beforeEach(async () => {
    await setupTestDb()
  })

  it('returns exact match (normalized)', async () => {
    const seeded = await addIngredient('Chopped Tomatoes')
    const result = await addIngredient('chopped tomatoes')
    expect(result.id).toBe(seeded.id)
    expect(result.name).toBe(seeded.name)
  })

  it('returns fuzzy match above threshold', async () => {
    const seeded = await addIngredient('Mozzarella Cheese')
    const result = await addIngredient('mozzarela cheese') // typo
    expect(result.id).toBe(seeded.id)
    expect(result.name).toBe(seeded.name)
  })

  it('creates new ingredient if no match', async () => {
    const result = await addIngredient('Dragonfruit')
    expect(result.name).toBe('dragonfruit')
    const found = await testDb.select().from(ingredient).where(sql`id = ${result.id}`)
    expect(found.length).toBe(1)
  })

  it('is case-insensitive and normalizes input', async () => {
    const seeded = await addIngredient('Red Onion')
    const result = await addIngredient('red onion (chopped)')
    expect(result.id).toBe(seeded.id)
  })

  it('does not match below fuzzy threshold', async () => {
    const seeded = await addIngredient('Apple')
    const result = await addIngredient('Pineapple')
    expect(result.id).not.toBe(seeded.id)
    expect(result.name).toBe('pineapple')
  })

  it('returns new ingredient for empty or whitespace-only input', async () => {
    await expect(addIngredient('')).rejects.toThrow()
    await expect(addIngredient('   ')).rejects.toThrow()
  })

  it('handles special characters and numbers', async () => {
    const result = await addIngredient('Tomato #2!')
    expect(result.name).toBe('tomato')
    const found = await testDb.select().from(ingredient).where(sql`id = ${result.id}`)
    expect(found.length).toBe(1)
  })

  it('treats duplicate with different whitespace/punctuation as same', async () => {
    const seeded = await addIngredient('Green-Pepper')
    const result = await addIngredient('  green pepper  ')
    expect(result.id).toBe(seeded.id)
  })

  it('handles very long ingredient names', async () => {
    const longName = 'a'.repeat(200)
    const result = await addIngredient(longName)
    expect(result.name).toBe(longName)
    const found = await testDb.select().from(ingredient).where(sql`id = ${result.id}`)
    expect(found.length).toBe(1)
  })

  it('handles unicode and emoji characters', async () => {
    const result = await addIngredient('🍆 Eggplant')
    expect(result.name).toBe('eggplant')
    const found = await testDb.select().from(ingredient).where(sql`id = ${result.id}`)
    expect(found.length).toBe(1)
  })
})

describe('normalizeIngredientName', () => {
  const cases = [
    ['Chopped Tomatoes', 'tomato'],
    ['chopped tomatoes', 'tomato'],
    ['Red Onion (chopped)', 'red onion'],
    ['Mozzarella Cheese', 'mozzarella cheese'],
    ['mozzarela cheese', 'mozzarela cheese'],
    ['Green-Pepper', 'green pepper'],
    ['  green pepper  ', 'green pepper'],
    ['Tomato #2!', 'tomato'],
    ['Eggs, beaten', 'egg'],
    ['Whole Milk', 'milk'],
    ['Fried Chicken', 'chicken'],
    ['Dragonfruit', 'dragonfruit'],
    ['Apple', 'apple'],
    ['Pineapple', 'pineapple'],
    ['Carrots (for garnish)', 'carrot'],
    ['onion for soup', 'onion'],
    ['baked potatoes', 'potato'],
    ['peeled, diced apples', 'apple'],
    ['grated parmesan cheese', 'parmesan cheese'],
    ['organic kale', 'kale'],
    ['frozen peas', 'pea'],
    ['🍆 Eggplant', 'eggplant'],
    ['jalapeños', 'jalapeño'],
    ['canned tomatoes', 'tomato'],
    ['minced garlic', 'garlic'],
    ['dried oregano', 'oregano'],
    ['milk (whole)', 'milk'],
    ['sliced mushrooms', 'mushroom'],
    ['unsalted butter', 'butter'],
    ['beaten eggs', 'egg'],
    ['pan-fried tofu', 'tofu'],
    ['toasted bread', 'bread'],
    ['shrimp (peeled and deveined)', 'shrimp'],
    ['lemon zest', 'lemon zest'],
    ['crushed red pepper flakes', 'red pepper flake'],
    ['ground black pepper', 'black pepper'],
    ['1% milk', 'milk'],
    ['milk, for coffee', 'milk'],
    ['  ', ''],
    ['', ''],
    [Array(200).fill('a').join(''), Array(200).fill('a').join('')],
  ]
  it.each(cases)('%s → %s', (input, expected) => {
    expect(normalizeIngredientName(input)).toBe(expected)
  })
}) 