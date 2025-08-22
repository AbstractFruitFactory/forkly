import { query, getRequestEvent } from '$app/server'
import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { getPostById } from '$lib/server/db/post'
import { getPublicUserById } from '$lib/server/db/user'

export const getPostData = query(
	v.object({ id: v.string() }),
	async ({ id }: { id: string }) => {
		const { locals } = getRequestEvent()
		const post = await getPostById(id)
		if (!post) error(404, 'Post not found')
		const isOwner = !!locals.user && locals.user.id === post.userId
		const author = await getPublicUserById(post.userId)
		return { post, isOwner, author }
	}
) 