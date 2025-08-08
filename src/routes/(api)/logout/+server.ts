import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import * as auth from '$lib/server/auth'

export const POST: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete(auth.sessionCookieName, { path: '/' })
  locals.user = null
  redirect(302, '/')
}