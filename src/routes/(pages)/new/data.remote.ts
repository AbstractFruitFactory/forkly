import { query, getRequestEvent } from '$app/server'

export const isLoggedIn = query(async () => {
  const { locals } = getRequestEvent()
  return !!locals.user
})