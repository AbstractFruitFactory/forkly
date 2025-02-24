import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'
import { validateSessionToken } from '$lib/server/auth'

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('auth-session')
	if (sessionToken) {
		const { user } = await validateSessionToken(sessionToken)
		event.locals.user = user
	}
	return resolve(event)
}

export const handle = sequence(handleAuth)
