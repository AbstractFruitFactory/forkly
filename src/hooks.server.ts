import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'
import * as authModule from '$lib/server/auth'

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('auth-session')
	if (sessionToken) {
		const result = await authModule.validateSessionToken(sessionToken)
		event.locals.user = result.user
	}
	return resolve(event)
}

export const handle = sequence(handleAuth)
