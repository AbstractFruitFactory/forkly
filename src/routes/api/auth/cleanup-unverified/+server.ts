import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { lt, and, inArray, eq } from 'drizzle-orm'

export const POST: RequestHandler = async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)

        const expiredVerifications = await db
            .select()
            .from(table.emailVerification)
            .where(lt(table.emailVerification.expiresAt, oneHourAgo))

        const expiredUserIds = expiredVerifications.map(v => v.userId)

        let deletedUsers = 0
        let deletedVerifications = 0

        if (expiredUserIds.length > 0) {
            const unverifiedUsers = await db
                .select()
                .from(table.user)
                .where(
                    and(
                        inArray(table.user.id, expiredUserIds),
                        eq(table.user.emailVerified, false)
                    )
                )

            const usersToDelete = unverifiedUsers
                .filter(user => {
                    const createdAt = new Date(user.createdAt)
                    return createdAt < oneHourAgo
                })
                .map(user => user.id)

            if (usersToDelete.length > 0) {
                const result = await db.delete(table.user).where(inArray(table.user.id, usersToDelete))
                deletedUsers = result.length
            }
        }

        await db.delete(table.emailVerification).where(lt(table.emailVerification.expiresAt, oneHourAgo))
        deletedVerifications = expiredVerifications.length

        return json({
            success: true,
            message: `Cleanup completed: ${deletedUsers} unverified users and ${deletedVerifications} expired verification tokens removed`,
            deletedUsers,
            deletedVerifications
        })
    } catch (error) {
        console.error('Cleanup failed:', error)
        return json({ 
            error: 'Failed to perform cleanup' 
        }, { status: 500 })
    }
} 