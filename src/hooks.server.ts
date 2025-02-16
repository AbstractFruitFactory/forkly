import type { Handle } from '@sveltejs/kit'
import { createContext } from '$lib/trpc/context'
import { appRouter } from '$lib/trpc/router'
import { createTRPCHandle } from 'trpc-sveltekit'
import * as auth from '$lib/server/auth'

const trpcHandle = createTRPCHandle({ router: appRouter, createContext })

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName)
	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const { session, user } = await auth.validateSessionToken(sessionToken)
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		auth.deleteSessionTokenCookie(event)
	}

	event.locals.user = user
	event.locals.session = session

	return resolve(event)
}

export const handle: Handle = async ({ event, resolve }) => {
	// First handle tRPC requests
	const response = await trpcHandle({ event, resolve })
	if (response) return response

	// Then handle auth for other requests
	return handleAuth({ event, resolve })
}
