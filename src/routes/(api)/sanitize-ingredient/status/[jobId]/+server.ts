import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { redis } from '$lib/server/redis'

export const GET: RequestHandler = async ({ params, locals }) => {
  // Require authentication
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { jobId } = params
    if (!jobId) return json({ error: 'Missing jobId' }, { status: 400 })
    
    const key = `sanitize-ingredient:result:${jobId}`
    const value = await redis.get(key)
    
    if (!value) {
      return json({ status: 'pending' })
    }

    return json(value)
  } catch (error) {
    console.error('Error in sanitize-ingredient status endpoint:', error)
    const message = error instanceof Error ? error.message : String(error)
    return json({ error: message }, { status: 500 })
  }
} 