import { db } from './index'
import * as table from './schema'
import { lt, and, inArray, eq } from 'drizzle-orm'

async function cleanupUnverifiedUsers() {
    try {
        console.log('Starting cleanup of unverified users and expired verification tokens...')
        
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)

        const expiredVerifications = await db
            .select()
            .from(table.emailVerification)
            .where(lt(table.emailVerification.expiresAt, oneHourAgo))

        console.log(`Found ${expiredVerifications.length} expired verification tokens`)

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
                await db.delete(table.user).where(inArray(table.user.id, usersToDelete))
                deletedUsers = usersToDelete.length
                console.log(`Deleted ${deletedUsers} unverified users`)
            }
        }

        await db.delete(table.emailVerification).where(lt(table.emailVerification.expiresAt, oneHourAgo))
        deletedVerifications = expiredVerifications.length

        console.log(`Cleanup completed: ${deletedUsers} unverified users and ${deletedVerifications} expired verification tokens removed`)
        
        process.exit(0)
    } catch (error) {
        console.error('Cleanup failed:', error)
        process.exit(1)
    }
}

cleanupUnverifiedUsers() 