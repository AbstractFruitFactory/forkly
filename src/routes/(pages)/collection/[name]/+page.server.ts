import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getCollection } from "$lib/server/db/save"

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const recipes = await getCollection(locals.user.id, params.name)

  return {
    recipes,
    name: params.name
  }
}