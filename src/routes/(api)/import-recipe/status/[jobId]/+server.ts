import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { redis } from '$lib/server/redis'

export const GET: RequestHandler = async ({ params }) => {
  const { jobId } = params
  if (!jobId) return json({ error: 'Missing jobId' }, { status: 400 })
  const key = `import-recipe:result:${jobId}`
  const value = await redis.get(key)
  if (!value) {
    // Could check BullMQ for job existence, but for now just return pending
    return json({ status: 'pending' })
  }
  return json(JSON.parse(value))
} 