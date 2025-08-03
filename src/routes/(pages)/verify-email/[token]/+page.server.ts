import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import * as auth from '$lib/server/auth'

export const load: PageServerLoad = async ({ params, cookies }) => {
    const { token } = params
    if (!token) return { verification: { success: false, message: 'Invalid verification link.' } }

    const verification = await db
        .select()
        .from(table.emailVerification)
        .where(eq(table.emailVerification.token, token))
        .then(results => results[0])
        .then(async (record) => {
            if (!record) return { success: false, message: 'Invalid or expired verification link.' }
            if (record.expiresAt < new Date()) {
                await db.delete(table.emailVerification).where(eq(table.emailVerification.token, token))
                return { success: false, message: 'Verification link has expired.' }
            }

            await db.update(table.user)
                .set({ emailVerified: true })
                .where(eq(table.user.id, record.userId))
            await db.delete(table.emailVerification).where(eq(table.emailVerification.token, token))

            // Create session after email verification
            const sessionToken = auth.generateSessionToken()
            const session = await auth.createSession(sessionToken, record.userId)

            // Set session cookie
            cookies.set(auth.sessionCookieName, sessionToken, {
                expires: session.expiresAt,
                path: '/'
            })

            return { success: true, message: 'Your email has been verified, and you will be redirected to the home page shortly.' }
        })

    return { verification }
}
