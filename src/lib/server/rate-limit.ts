import { redis } from './redis'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}

export class RateLimiter {
  constructor(public config: RateLimitConfig) {}

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${this.config.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get all keys for this identifier
    const pattern = `${key}:*`
    const keys = await redis.keys(pattern)
    
    // Filter keys that are within the current window
    const validKeys = keys.filter(key => {
      const timestamp = parseInt(key.split(':').pop() || '0')
      return timestamp >= windowStart
    })
    
    const currentCount = validKeys.length

    if (currentCount >= this.config.maxRequests) {
      // Find the oldest request to calculate reset time
      const oldestTimestamp = Math.min(...validKeys.map(key => parseInt(key.split(':').pop() || '0')))
      const resetTime = oldestTimestamp + this.config.windowMs
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil(resetTime / 1000)
      }
    }

    // Add current request
    const requestKey = `${key}:${now}`
    await redis.set(requestKey, '1', { ex: Math.ceil(this.config.windowMs / 1000) })

    return {
      allowed: true,
      remaining: this.config.maxRequests - currentCount - 1,
      resetTime: Math.ceil((now + this.config.windowMs) / 1000)
    }
  }

  async getRemaining(identifier: string): Promise<{ remaining: number; resetTime: number }> {
    const key = `${this.config.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get all keys for this identifier
    const pattern = `${key}:*`
    const keys = await redis.keys(pattern)
    
    // Filter keys that are within the current window
    const validKeys = keys.filter(key => {
      const timestamp = parseInt(key.split(':').pop() || '0')
      return timestamp >= windowStart
    })
    
    const currentCount = validKeys.length
    const remaining = Math.max(0, this.config.maxRequests - currentCount)
    const resetTime = Math.ceil((now + this.config.windowMs) / 1000)

    return { remaining, resetTime }
  }
}

// Pre-configured rate limiters
export const importRecipeLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 imports per hour per user
  keyPrefix: 'rate-limit:import-recipe'
})

export const globalImportLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 imports per hour globally
  keyPrefix: 'rate-limit:import-recipe:global'
})

export const mediaUploadSignLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 60, // 60 signature requests per 15 minutes per user
  keyPrefix: 'rate-limit:media-upload-sign'
}) 