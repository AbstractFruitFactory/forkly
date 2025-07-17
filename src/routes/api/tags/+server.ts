import { json } from '@sveltejs/kit'
import { searchTags, getPopularTags } from '$lib/server/db/tags'

export type TagSearchResponse = {
  tags: Array<{
    name: string
    count: number
  }>
  query: string
}

export const GET = async ({ url }) => {
  try {
    console.log('Tags API called with URL:', url.toString())
    
    const query = url.searchParams.get('q') || ''
    const limit = 5

    console.log('Processing tags request - query:', query, 'limit:', limit)

    // If query is empty, get most popular tags
    if (!query.trim()) {
      console.log('Getting popular tags...')
      const popularTags = await getPopularTags(limit)
      console.log('Popular tags retrieved:', popularTags.length)
      
      return json({
        tags: popularTags,
        query: ''
      } satisfies TagSearchResponse)
    }

    // Search for tags that match the query
    console.log('Searching for tags with query:', query)
    const tagResults = await searchTags(query, limit)
    console.log('Tag search results:', tagResults.length)

    return json({
      tags: tagResults,
      query
    } satisfies TagSearchResponse)
  } catch (error) {
    console.error('Error in tags API:', error)
    throw error
  }
} 