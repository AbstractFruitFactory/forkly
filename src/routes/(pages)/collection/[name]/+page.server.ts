import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getCollection, getCollections } from '$lib/server/db/save'

export const load: PageServerLoad = ({ locals, params }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const recipes = getCollection(locals.user.id, params.name)
  const collections = getCollections(locals.user.id).then(cs => cs.map(c => c.name))

  return {
    recipes,
    name: params.name,
    collections
  }
}