import { query, getRequestEvent, command } from '$app/server'
import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { getPublicUserByUsername, getUserByUsername } from '$lib/server/db/user'
import { getPostsByUser } from '$lib/server/db/post'
import { createPost as createPostDb } from '$lib/server/db/post'

const CreatePostSchema = v.object({
	title: v.pipe(
		v.string(),
		v.minLength(3, 'Title too short'),
		v.maxLength(120, 'Title too long')
	),
	content: v.pipe(
		v.string(),
		v.minLength(1, 'Content is required')
	),
	imageUrl: v.optional(v.string())
})

export const getPostsByUsername = query(
	v.object({ username: v.string() }),
	async ({ username }: { username: string }) => {
		const { locals } = getRequestEvent()
		let userId: string | undefined
		if (locals.user && locals.user.username === username) {
			const u = await getUserByUsername(username)
			userId = u.id
		} else {
			const u = await getPublicUserByUsername(username)
			if (!u) error(404, { message: 'User not found' })
			userId = u.id
		}
		return await getPostsByUser(userId!)
	}
)


export const createPost = command(CreatePostSchema, async (input) => {
	const { locals } = getRequestEvent()
	if (!locals.user) error(401, 'Unauthorized')
	const created = await createPostDb({ title: input.title, content: input.content, imageUrl: input.imageUrl }, locals.user.id)
	return { postId: created.id }
}) 