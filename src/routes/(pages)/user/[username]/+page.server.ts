import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals, fetch, url, params }) => {
  const { username } = params

  const tab = url.searchParams.get('tab')
  const isOwner = locals.user && locals.user.username === username || false

  return {
    currentUser: locals.user,
    isOwner,
    initialTab: tab ?? undefined
  }
}