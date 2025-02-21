import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import { desc } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const recipes = await db.select().from(recipe).orderBy(desc(recipe.createdAt)).limit(10)

	return { recipes }
}