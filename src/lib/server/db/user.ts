import { db } from '.'
import { user } from './schema'
import { eq } from 'drizzle-orm'

export type PrivateUser = Awaited<ReturnType<typeof getUserById>>

export type PublicUser = Awaited<ReturnType<typeof getPublicUserByUsername>>

export type User = PrivateUser | PublicUser

export async function getUserById(userId: string) {
  const results = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return results[0] || null
}

export async function getUserByUsername(username: string) {
  const results = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1)

  return results[0] || null
}

export async function getPublicUserByUsername(username: string) {
  const results = await db
    .select({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1)

  return results[0] || null
}

export async function getPublicUserById(userId: string) {
  const results = await db
    .select({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return results[0] || null
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{
    username: string
    bio: string | null
    avatarUrl: string | null
  }>
) {
  const updatedUser = await db
    .update(user)
    .set(data)
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    })

  return updatedUser[0]
} 