import { generateState, generateCodeVerifier } from "arctic"
import { google } from "$lib/server/oauth"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async (event) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"])

    const returnTo = event.url.searchParams.get('returnTo')
    if (returnTo) {
        event.cookies.set('post_login_redirect', returnTo, {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: 'lax'
        })
    }

    event.cookies.set("google_oauth_state", state, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    })
    event.cookies.set("google_code_verifier", codeVerifier, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    })

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString()
        }
    })
} 