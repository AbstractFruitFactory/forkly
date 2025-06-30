import type { ServerLoad } from "@sveltejs/kit"

export const load: ServerLoad = ({ locals }) => {
  const user = locals.user
  return { user: user ?? undefined }
}