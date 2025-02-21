import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { trpc } from '$lib/trpc/client'

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(302, '/')
    }
    return {}
}

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData()
        const username = formData.get('username')?.toString()
        const password = formData.get('password')?.toString()

        if (!username || !password) {
            return fail(400, { message: 'Missing username or password' })
        }

        const result = await trpc(event).auth.signup.mutate({
            // @ts-ignore
            username,
            password
        })

        if (result.isOk()) {
            throw redirect(302, '/')
        } else {
            return fail(400, { message: result.error.message })
        }
    }
} satisfies Actions 