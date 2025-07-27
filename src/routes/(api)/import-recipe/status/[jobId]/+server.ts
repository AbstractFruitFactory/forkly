import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { redis } from '$lib/server/redis'

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { jobId } = params
    if (!jobId) return json({ error: 'Missing jobId' }, { status: 400 })
    const key = `import-recipe:result:${jobId}`
    const value = await redis.get(key)
    if (!value) {
      return json({ status: 'pending' })
    }

    return json(value)
  } catch (error) {
    console.error('Error in import-recipe status endpoint:', error)
    const message = error instanceof Error ? error.message : String(error)
    return json({ error: message }, { status: 500 })
  }
} 