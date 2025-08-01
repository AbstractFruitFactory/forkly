import { Queue } from 'bullmq'
import { REDIS_URL } from '$env/static/private'

export const importRecipeQueue = new Queue('import-recipe', {
  connection: {
    url: REDIS_URL
  },
  defaultJobOptions: {
    removeOnComplete: {
      age: 24 * 3600,
      count: 100
    },
    removeOnFail: {
      age: 24 * 3600,
      count: 100
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
}) 