import { Queue } from 'bullmq'
import { REDIS_URL } from '$env/static/private'

export const importRecipeQueue = new Queue('import-recipe', {
  connection: {
    url: REDIS_URL
  }
}) 