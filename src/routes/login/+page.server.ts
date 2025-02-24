import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/auth'

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/')
	}
	return {}
}

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		if (!username || !password) return fail(400, { message: 'Missing username or password' })

		const { session } = await auth.validateCredentials(username.toString(), password.toString())
		if (!session) return fail(401, { message: 'Invalid username or password' })

		auth.setSessionTokenCookie(event, session.token, session.expiresAt)
		throw redirect(302, '/')
	}
} satisfies Actions