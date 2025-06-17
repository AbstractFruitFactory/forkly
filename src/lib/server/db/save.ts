import { db } from '.'
import { recipeBookmark, collection, recipe } from './schema'
import { eq, and, sql } from 'drizzle-orm'
import { getRecipes } from './recipe'
import type { DetailedRecipe } from './recipe'

/**
 * Check if a recipe is saved by a user
 */
export async function isRecipeSaved(recipeId: string, userId: string) {
	const bookmarks = await db
		.select()
		.from(recipeBookmark)
		.where(and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId)))
	return bookmarks.length > 0
}

/**
 * Toggle the saved status of a recipe for a user
 */
export async function toggleRecipeSave(recipeId: string, userId: string, collectionName?: string) {
	const existingSave = await isRecipeSaved(recipeId, userId)

	if (existingSave) {
		await db
			.delete(recipeBookmark)
			.where(and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId)))
		return false
	} else {
		await db.insert(recipeBookmark).values({
			userId,
			recipeId,
			collectionName
		})
		return true
	}
}

/**
 * Remove a save from a recipe for a user
 */
export async function removeRecipeSave(recipeId: string, userId: string) {
	await db
		.delete(recipeBookmark)
		.where(and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId)))
}

/**
 * Get all recipes saved by a user
 */
export async function getSavedRecipesByUser(userId: string) {
	const bookmarks = await db
		.select({
			recipeId: recipeBookmark.recipeId,
			collectionName: recipeBookmark.collectionName
		})
		.from(recipeBookmark)
		.where(eq(recipeBookmark.userId, userId))

	return bookmarks.map((bookmark) => ({
		recipeId: bookmark.recipeId,
		collectionName: bookmark.collectionName
	}))
}

/**
 * Get all collections for a user with their recipe counts
 */
export async function getCollections(userId: string): Promise<{ name: string; count: number }[]> {
	// Get all collections for the user
	const collections = await db
		.select()
		.from(collection)
		.where(eq(collection.userId, userId))
		.orderBy(collection.createdAt)

	// Get recipe counts for each collection
	const collectionCounts = await db
		.select({
			collectionName: recipeBookmark.collectionName,
			count: sql<number>`count(*)`
		})
		.from(recipeBookmark)
		.where(eq(recipeBookmark.userId, userId))
		.groupBy(recipeBookmark.collectionName)

	// Get total count of all saved recipes
	const totalCount = await db
		.select({
			count: sql<number>`count(*)`
		})
		.from(recipeBookmark)
		.where(eq(recipeBookmark.userId, userId))
		.then((result) => result[0]?.count || 0)

	return [
		{ name: 'All Recipes', count: totalCount },
		...collections.map((c) => ({
			name: c.name,
			count: collectionCounts.find((cc) => cc.collectionName === c.name)?.count || 0
		}))
	]
}

/**
 * Create a new collection for a user
 */
export async function createCollection(userId: string, name: string) {
	const newCollection = await db
		.insert(collection)
		.values({
			userId,
			name
		})
		.returning()

	return newCollection[0]
}

/**
 * Get all recipes in a collection
 */
export async function getCollection(userId: string, collectionName: string) {
	const bookmarks = await db
		.select({
			recipeId: recipeBookmark.recipeId
		})
		.from(recipeBookmark)
		.where(
			collectionName === 'All Recipes'
				? eq(recipeBookmark.userId, userId)
				: and(eq(recipeBookmark.userId, userId), eq(recipeBookmark.collectionName, collectionName))
		)

	const recipeIds = bookmarks.map((bookmark) => bookmark.recipeId)

	if (recipeIds.length === 0) {
		return []
	}

	return getRecipes({
		recipeIds,
		detailed: true
	})
}

/**
 * Rename a collection
 */
export async function renameCollection(userId: string, oldName: string, newName: string) {
	await db.transaction(async (tx) => {
		await tx
			.update(collection)
			.set({ name: newName })
			.where(and(eq(collection.userId, userId), eq(collection.name, oldName)))

		await tx
			.update(recipeBookmark)
			.set({ collectionName: newName })
			.where(and(eq(recipeBookmark.userId, userId), eq(recipeBookmark.collectionName, oldName)))
	})
}

/**
 * Delete a collection
 */
export async function deleteCollection(userId: string, name: string) {
	const deleted = await db
		.delete(collection)
		.where(and(eq(collection.userId, userId), eq(collection.name, name)))
		.returning()

	return deleted.length > 0
}
