import { fail, json, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as v from 'valibot'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from '@node-rs/argon2'
import * as auth from '$lib/server/auth'

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(302, '/')
    }
    return {}
}

const signupSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens')
    ),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )
})

const generateUserId = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(15))
    const id = encodeBase32LowerCase(bytes)
    return id
}

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData()
        const username = formData.get('username')
        const password = formData.get('password')

        const input = v.safeParse(signupSchema, { username, password })

        if (!input.success) return fail(400, { error: input.issues[0].message })

        const existingUser = await db
            .select()
            .from(table.user)
            .where(eq(table.user.username, input.output.username))
            .then(results => results[0])

        if (existingUser) return fail(400, { error: 'Username already taken' })

        const userId = generateUserId()
        const passwordHash = await hash(input.output.password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        })

        await db.insert(table.user).values({
            id: userId,
            username: input.output.username,
            passwordHash
        })

        const sessionToken = auth.generateSessionToken()
        const session = await auth.createSession(sessionToken, userId)

        cookies.set(auth.sessionCookieName, sessionToken, {
            expires: session.expiresAt,
            path: '/'
        })

        return json({
            user: {
                id: userId,
                username: input.output.username
            }
        })
    }
} satisfies Actions 