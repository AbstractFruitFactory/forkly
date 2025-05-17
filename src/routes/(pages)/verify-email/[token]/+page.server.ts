import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'

export const load: PageServerLoad = async ({ params }) => {
    const { token } = params
    if (!token) return { success: false, message: 'Invalid verification link.' }

    const record = await db
        .select()
        .from(table.emailVerification)
        .where(eq(table.emailVerification.token, token))
        .then(results => results[0])

    if (!record) return { success: false, message: 'Invalid or expired verification link.' }
    if (record.expiresAt < new Date()) {
        await db.delete(table.emailVerification).where(eq(table.emailVerification.token, token))
        return { success: false, message: 'Verification link has expired.' }
    }

    await db.update(table.user)
        .set({ emailVerified: true })
        .where(eq(table.user.id, record.userId))
    await db.delete(table.emailVerification).where(eq(table.emailVerification.token, token))

    return { success: true, message: 'Your email has been verified, and you will be redirected to the home page shortly.' }
} 