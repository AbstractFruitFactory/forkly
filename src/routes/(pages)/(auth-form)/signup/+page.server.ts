import { fail, json, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as v from 'valibot'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from '@node-rs/argon2'
import { Resend } from 'resend'
import { APP_URL, RESEND_API_KEY } from '$env/static/private'

export const load: PageServerLoad = ({ locals }) => {
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
    ),
    email: v.pipe(
        v.string(),
        v.minLength(5, 'Email must be at least 5 characters'),
        v.maxLength(255, 'Email must be at most 255 characters'),
        v.regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email address')
    )
})

const generateUserId = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(15))
    const id = encodeBase32LowerCase(bytes)
    return id
}

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData()
        const username = formData.get('username')
        const password = formData.get('password')
        const email = formData.get('email')

        const input = v.safeParse(signupSchema, { username, password, email })

        if (!input.success) return fail(400, { error: input.issues[0].message })

        const existingUser = await db
            .select()
            .from(table.user)
            .where(eq(table.user.username, input.output.username))
            .then(results => results[0])

        if (existingUser) return fail(400, { error: 'Username already taken' })

        const existingEmail = await db
            .select()
            .from(table.user)
            .where(eq(table.user.email, input.output.email))
            .then(results => results[0])

        if (existingEmail) {
            if (!existingEmail.emailVerified) {
                return fail(400, { 
                    error: 'An account with this email already exists but is not verified. Please check your email for the verification link.'
                })
            }
            return fail(400, { error: 'Email already in use' })
        }

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
            passwordHash,
            email: input.output.email,
            emailVerified: false
        })

        // Generate verification token
        const tokenBytes = crypto.getRandomValues(new Uint8Array(32))
        const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
        await db.insert(table.emailVerification).values({
            userId: userId,
            token,
            expiresAt
        })

        // Placeholder for sending email
        console.log(`Verify your email: /verify-email/${token}`)

        const resend = new Resend(RESEND_API_KEY)

        const url = `${APP_URL}/verify-email/${token}`

        const result = await resend.emails.send({
            from: 'Forkly <no-reply@forkly.me>',
            to: input.output.email,
            subject: 'Verify your email',
            html: `<p>Verify your email: <a href="${url}">${url}</a></p>`
        })

        console.log('Email result:', result)

        redirect(302, '/verify-email')
    }
} satisfies Actions 