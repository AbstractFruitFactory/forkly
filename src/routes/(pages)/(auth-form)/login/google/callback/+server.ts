import { google } from "$lib/server/oauth"
import { decodeIdToken } from "arctic"
import { db } from "$lib/server/db"
import * as table from "$lib/server/db/schema"
import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/auth"
import { eq } from "drizzle-orm"
import { generateId } from "$lib/server/id"
import { generateAvailableUsername } from "$lib/server/utils/username"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async (event) => {
    const code = event.url.searchParams.get("code")
    const state = event.url.searchParams.get("state")
    const storedState = event.cookies.get("google_oauth_state") ?? null
    const codeVerifier = event.cookies.get("google_code_verifier") ?? null
    if (!code || !state || !storedState || !codeVerifier) {
        return new Response(null, { status: 400 })
    }
    if (state !== storedState) {
        return new Response(null, { status: 400 })
    }

    let tokens
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier)
    } catch {
        return new Response(null, { status: 400 })
    }
    const claims = decodeIdToken(tokens.idToken()) as { sub: string; name?: string; email?: string }
    const googleUserId = claims.sub
    const baseUsername = claims.name || (claims.email ? claims.email.split("@")[0] : "googleuser")
    const username = await generateAvailableUsername(baseUsername)
    const email = claims.email || `${googleUserId}@googleuser.com`

    // Find user by googleId
    let user = await db
        .select()
        .from(table.user)
        .where(eq(table.user.googleId, googleUserId))
        .then(results => results[0])

    // If not found, create user
    if (!user) {
        user = await db
            .insert(table.user)
            .values({
                id: generateId(),
                username,
                passwordHash: 'google-oauth',
                email,
                emailVerified: true,
                googleId: googleUserId
            })
            .returning()
            .then(results => results[0])
    }

    // Create session
    const sessionToken = generateSessionToken()
    const session = await createSession(sessionToken, user.id)
    setSessionTokenCookie(event, sessionToken, session.expiresAt)

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/"
        }
    })
} 