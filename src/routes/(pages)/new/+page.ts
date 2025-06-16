import type { PageLoad } from './$types'
import type { TagSearchResponse } from '../../api/tags/+server'
import { safeFetch } from '$lib/utils/fetch'

export const load: PageLoad = async ({ fetch }) => {
  // Pass the fetch instance from the event parameter
  const response = await safeFetch<TagSearchResponse>(fetch)(
    '/api/tags'
  )

  const availableTags = response.isOk()
    ? response.value.tags
    : []

  return {
    availableTags
  }
} 