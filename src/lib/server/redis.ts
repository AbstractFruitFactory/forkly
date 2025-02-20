import { createClient } from '@redis/client'
import { REDIS_URL } from '$env/static/private'

const redis = createClient({
  url: REDIS_URL
})

redis.on('error', (err: Error) => console.error('Redis Client Error', err))

await redis.connect()

export { redis } 