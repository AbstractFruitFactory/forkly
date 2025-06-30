import type { PageLoad } from './$types'
import type { TagSearchResponse } from '../../api/tags/+server'
import { safeFetch } from '$lib/utils/fetch'

export const load: PageLoad = ({ fetch }) => {
  const availableTags = safeFetch<TagSearchResponse>(fetch)('/api/tags').then(
    (response) => (response.isOk() ? response.value.tags : [])
  )

  return {
    availableTags
  }
}
