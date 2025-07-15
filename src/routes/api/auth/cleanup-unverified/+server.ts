import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { lt, and, inArray, eq } from 'drizzle-orm'

export const POST: RequestHandler = async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)
        console.log('Cleanup started at:', new Date().toISOString())
        console.log('Looking for verifications expired before:', oneHourAgo.toISOString())

        const expiredVerifications = await db
            .select()
            .from(table.emailVerification)
            .where(lt(table.emailVerification.expiresAt, oneHourAgo))

        console.log('Found expired verifications:', expiredVerifications.length)
        if (expiredVerifications.length > 0) {
            console.log('Expired verification details:', expiredVerifications.map(v => ({
                userId: v.userId,
                expiresAt: v.expiresAt
            })))
        }

        const expiredUserIds = expiredVerifications.map(v => v.userId)
        console.log('User IDs with expired verifications:', expiredUserIds)

        let deletedUsers = 0
        let deletedVerifications = 0

        if (expiredUserIds.length > 0) {
            console.log('Looking for unverified users with expired verifications...')
            
            const unverifiedUsers = await db
                .select()
                .from(table.user)
                .where(
                    and(
                        inArray(table.user.id, expiredUserIds),
                        eq(table.user.emailVerified, false)
                    )
                )

            console.log('Found unverified users:', unverifiedUsers.length)
            if (unverifiedUsers.length > 0) {
                console.log('Unverified user details:', unverifiedUsers.map(u => ({
                    id: u.id,
                    email: u.email,
                    emailVerified: u.emailVerified,
                    createdAt: u.createdAt
                })))
            }

            const usersToDelete = unverifiedUsers
                .filter(user => {
                    const createdAt = new Date(user.createdAt)
                    const shouldDelete = createdAt < oneHourAgo
                    console.log(`User ${user.id} (${user.email}): created at ${createdAt.toISOString()}, should delete: ${shouldDelete}`)
                    return shouldDelete
                })
                .map(user => user.id)

            console.log('Users to delete:', usersToDelete.length)
            if (usersToDelete.length > 0) {
                console.log('Attempting to delete users:', usersToDelete)
                const result = await db.delete(table.user).where(inArray(table.user.id, usersToDelete))
                deletedUsers = result.length
                console.log('Delete operation result:', result)
                console.log('Actually deleted users:', deletedUsers)
            } else {
                console.log('No users meet deletion criteria (created within last hour)')
            }
        } else {
            console.log('No expired verifications found, skipping user deletion')
        }

        console.log('Deleting expired verification tokens...')
        const verificationDeleteResult = await db.delete(table.emailVerification).where(lt(table.emailVerification.expiresAt, oneHourAgo))
        deletedVerifications = expiredVerifications.length
        console.log('Verification delete result:', verificationDeleteResult)
        console.log('Deleted verifications:', deletedVerifications)

        const summary = {
            success: true,
            message: `Cleanup completed: ${deletedUsers} unverified users and ${deletedVerifications} expired verification tokens removed`,
            deletedUsers,
            deletedVerifications,
            timestamp: new Date().toISOString()
        }
        
        console.log('Cleanup summary:', summary)
        return json(summary)
    } catch (error) {
        console.error('Cleanup failed:', error)
        return json({ 
            error: 'Failed to perform cleanup',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
} 