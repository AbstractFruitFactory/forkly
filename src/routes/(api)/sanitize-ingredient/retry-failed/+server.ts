import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { sanitizeIngredientQueue } from '$lib/server/queue'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('authorization')
  const hasAuthHeader = typeof authHeader === 'string' && authHeader.length > 0
  const hasCronSecret = typeof env.CRON_SECRET === 'string' && env.CRON_SECRET.length > 0
  if (!hasAuthHeader || !hasCronSecret) {
    console.warn('retry-failed cron: missing header or secret', {
      hasAuthHeader,
      hasCronSecret
    })
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.warn('retry-failed cron: invalid authorization header')
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  const olderThanMinutes = 15
  const limit = 200
  const cutoffMs = Date.now() - olderThanMinutes * 60 * 1000

  try {
    const failedJobs = await sanitizeIngredientQueue.getJobs(['failed'], 0, limit - 1)

    let considered = 0
    let retried = 0

    for (const job of failedJobs) {
      const ts = job.finishedOn ?? job.processedOn ?? job.timestamp ?? Date.now()
      if (ts > cutoffMs) continue
      considered++
      try {
        await job.retry()
        retried++
      } catch {}
    }

    return json({ success: true, considered, retried, olderThanMinutes })
  } catch {
    return json({ error: 'Failed to retry failed sanitation jobs' }, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 })
  }

  let payload: { olderThanMinutes?: number; limit?: number } = {}
  try {
    payload = await request.json()
  } catch {}

  const olderThanMinutes = typeof payload.olderThanMinutes === 'number' && payload.olderThanMinutes > 0 ? payload.olderThanMinutes : 15
  const limit = typeof payload.limit === 'number' && payload.limit > 0 ? Math.min(payload.limit, 500) : 200

  const cutoffMs = Date.now() - olderThanMinutes * 60 * 1000

  try {
    const failedJobs = await sanitizeIngredientQueue.getJobs(['failed'], 0, limit - 1)

    let considered = 0
    let retried = 0
    const skipped: Array<{ id: string; reason?: string }> = []

    for (const job of failedJobs) {
      const ts = job.finishedOn ?? job.processedOn ?? job.timestamp ?? Date.now()
      if (ts > cutoffMs) {
        skipped.push({ id: String(job.id), reason: 'too-recent' })
        continue
      }
      considered++
      try {
        await job.retry()
        retried++
      } catch (e) {
        skipped.push({ id: String(job.id), reason: 'retry-error' })
      }
    }

    return json({
      success: true,
      failedJobsFetched: failedJobs.length,
      considered,
      retried,
      skipped,
      olderThanMinutes
    })
  } catch (error) {
    return json({ error: 'Failed to retry failed sanitation jobs' }, { status: 500 })
  }
} 