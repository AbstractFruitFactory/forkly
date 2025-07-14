import type { RequestEvent } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { verify } from '@node-rs/argon2'

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const sessionCookieName = 'auth-session'

export const generateSessionToken = () => {
	const bytes = crypto.getRandomValues(new Uint8Array(18))
	const token = encodeBase64url(bytes)
	return token
}

export const createSession = async (token: string, userId: string) => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	}
	await db.insert(table.session).values(session)
	return session
}

export const validateSessionToken = async (token: string) => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const [result] = await db
		.select({
			user: { id: table.user.id, username: table.user.username, bio: table.user.bio, avatarUrl: table.user.avatarUrl, emailVerified: table.user.emailVerified },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId))

	if (!result) {
		return { session: null, user: null }
	}

	const { session, user } = result

	const sessionExpired = Date.now() >= session.expiresAt.getTime()
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id))
		return { session: null, user: null }
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id))
	}

	return { session, user }
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>

export const invalidateSession = async (sessionId: string) => {
	await db.delete(table.session).where(eq(table.session.id, sessionId))
}

export const setSessionTokenCookie = (event: RequestEvent, token: string, expiresAt: Date) => {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	})
}

export const deleteSessionTokenCookie = (event: RequestEvent) => {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	})
}

export const validateCredentials = async (username: string, password: string) => {
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, username))

	if (!user) {
		return { session: null, user: null }
	}

	const validPassword = await verify(user.passwordHash, password)
	if (!validPassword) {
		return { session: null, user: null }
	}

	const token = generateSessionToken()
	const session = await createSession(token, user.id)

	return {
		session: { ...session, token },
		user: {
			id: user.id,
			username: user.username,
			bio: user.bio,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified
		}
	}
}
