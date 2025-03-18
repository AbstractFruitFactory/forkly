import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/auth'
import * as v from 'valibot'

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/')
	}
	return {}
}

const loginSchema = v.object({
	username: v.pipe(
		v.string('Username is required'),
		v.minLength(1, 'Username is required')
	),
	password: v.pipe(
		v.string('Password is required'),
		v.minLength(1, 'Password is required')
	)
})

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		const input = v.safeParse(loginSchema, { username, password })
		
		if (!input.success) return fail(400, { message: input.issues[0].message })

		const { session } = await auth.validateCredentials(input.output.username, input.output.password)
		if (!session) return fail(401, { message: 'Invalid username or password' })

		auth.setSessionTokenCookie(event, session.token, session.expiresAt)
		throw redirect(302, '/')
	}
} satisfies Actions