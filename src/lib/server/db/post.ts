import { db } from './index'
import { post, type Post } from './schema'
import { eq, desc } from 'drizzle-orm'
import { generateId } from '$lib/server/id'

export async function createPost(input: { title: string; content: string; imageUrl?: string }, userId: string): Promise<Post> {
	const id = generateId()
	const [created] = await db.insert(post).values({
		id,
		userId,
		title: input.title,
		content: input.content,
		imageUrl: input.imageUrl
	}).returning()
	return { ...created, imageUrl: created.imageUrl ?? undefined }
}

export async function getPostById(id: string): Promise<Post | undefined> {
	const [p] = await db.select().from(post).where(eq(post.id, id))
	return p ? { ...p, imageUrl: p.imageUrl ?? undefined } : undefined
}

export async function getPostsByUser(userId: string, limit = 20, offset = 0): Promise<Post[]> {
	const rows = await db.select().from(post).where(eq(post.userId, userId)).orderBy(desc(post.createdAt)).limit(limit).offset(offset)
	return rows.map(r => ({ ...r, imageUrl: r.imageUrl ?? undefined }))
} 