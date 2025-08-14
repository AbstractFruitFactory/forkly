import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { ingredient, recipeIngredient } from '../src/lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { addIngredient } from '../src/lib/server/db/ingredient'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const dbConnection = postgres(process.env.DATABASE_URL || '', { max: 1 })
const db = drizzle(dbConnection)

async function sanitizeIngredientsWithAI(ingredientNames: string[]): Promise<(string | null)[]> {
  const prompt = `
      Extract the base ingredient name from each of the following ingredient descriptions. Remove any preparation methods, quantities, measurements, or descriptive words, keeping only the core ingredient name.

      Examples:
      - "sliced tomatoes" → "tomato"
      - "fresh basil leaves" → "basil"
      - "extra virgin olive oil" → "olive oil"
      - "minced garlic cloves" → "garlic"
      - "boneless chicken breast" → "chicken"
      - "all-purpose flour" → "flour"
      - "large eggs" → "egg"
      - "ripe bananas" → "banana"

      If the text presents alternatives or options (e.g., contains "or", "/", "|", "and/or", or similar) such that no single canonical ingredient can be deduced, return NULL for that line instead of combining the options.

      Examples that must return NULL:
      - "chicken or vegetable broth" → NULL
      - "milk/cream" → NULL
      - "almonds | walnuts" → NULL

      Sometimes it might make sense to return multiple words if it implies a specific meaning, such as:
      "almond flour" (not "almond")
      "peanut butter" (not "peanut")
      "olive oil" (not "olive")

      However, lean more towards being general than specific. 
      If you are not sure if this is a basic ingredient that would be useful for a user to search for, return NULL.

      Return only the base ingredient names, one per line, in the same order as the input. Use singular where applicable (e.g., "tomato" not "tomatoes"). If no single name can be deduced, output exactly "NULL" for that line.

      Ingredients to sanitize:
      ${ingredientNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}
  `

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI API')

  const sanitizedNames = content
    .trim()
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .map(name => {
      if (name.length === 0) return null
      if (/^null$/i.test(name)) return null
      return name
    })

  if (sanitizedNames.length !== ingredientNames.length) {
    throw new Error(`Expected ${ingredientNames.length} ingredients but got ${sanitizedNames.length}`)
  }

  return sanitizedNames
}

const worker = new Worker(
  'sanitize-ingredient',
  async job => {
    const { recipeId } = job.data
    console.log(`Processing ingredient sanitization for recipe ${recipeId}`)

    try {
      const recipeIngredients = await db
        .select({
          recipeIngredientId: recipeIngredient.id,
          ingredientId: recipeIngredient.ingredientId,
          displayName: recipeIngredient.displayName
        })
        .from(recipeIngredient)
        .where(eq(recipeIngredient.recipeId, recipeId))

      if (recipeIngredients.length === 0) {
        throw new Error('No ingredients found for this recipe')
      }

      const displayNames = recipeIngredients.map(ri => ri.displayName)
      const ingredientIds = recipeIngredients.map(ri => ri.ingredientId)
      const recipeIngredientIds = recipeIngredients.map(ri => ri.recipeIngredientId)

      console.log(`Found ${displayNames.length} ingredients to sanitize:`, displayNames)

      const sanitizedNames = await sanitizeIngredientsWithAI(displayNames)
      console.log('AI sanitized names:', sanitizedNames)

      for (let i = 0; i < recipeIngredientIds.length; i++) {
        const currentIngredientId = ingredientIds[i]
        const sanitizedName = sanitizedNames[i]
        const recipeIngrId = recipeIngredientIds[i]

        if (sanitizedName == null) {
          try {
            await db
              .update(recipeIngredient)
              .set({ ingredientId: null })
              .where(eq(recipeIngredient.id, recipeIngrId))
            console.log(`Set recipe_ingredient ${recipeIngrId} ingredientId to NULL due to ambiguous name`)
          } catch (error) {
            console.error(`Failed to nullify ingredientId for recipe_ingredient ${recipeIngrId}:`, error)
          }
          continue
        }

        try {
          const { id: resolvedIngredientId } = await addIngredient(sanitizedName.trim().toLowerCase())
          if (currentIngredientId !== resolvedIngredientId) {
            await db
              .update(recipeIngredient)
              .set({ ingredientId: resolvedIngredientId })
              .where(eq(recipeIngredient.id, recipeIngrId))
            console.log(`Linked recipe_ingredient ${recipeIngrId} to ingredient ${resolvedIngredientId} (${sanitizedName})`)
          }
        } catch (error) {
          console.error(`Failed to resolve/link ingredient for recipe_ingredient ${recipeIngrId}:`, error)
        }
      }

      try {
        await redis.set(
          `sanitize-ingredient:result:${job.id}`,
          JSON.stringify({
            status: 'completed',
            recipeId,
            originalNames: displayNames,
            sanitizedNames: sanitizedNames
          }),
          { ex: 3600 }
        )
      } catch (redisError) {
        console.error('Failed to write to Redis:', redisError instanceof Error ? redisError.message : String(redisError))
        console.error('Redis error details:', redisError.cause?.errors?.map((e: any) => e.message).join('\n'))
      }

      console.log(`Job ${job.id} completed successfully`)
      return { recipeId, sanitizedNames }
    } catch (err: any) {
      console.log('Writing failed sanitization to Redis:', `sanitize-ingredient:result:${job.id}`)
      console.log('Value:', JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }))

      try {
        await redis.set(
          `sanitize-ingredient:result:${job.id}`,
          JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }),
          { ex: 3600 }
        )
      } catch (redisError) {
        console.error('Failed to write error to Redis:', redisError instanceof Error ? redisError.message : String(redisError))
        console.error('Redis error details:', redisError)
      }

      console.error(`Job ${job.id} failed:`, err.message)
      console.error('Full error details:', err)
      throw err
    }
  },
  {
    connection: { url: process.env.REDIS_URL },
    lockDuration: 30000,
    lockRenewTime: 15000,
    stalledInterval: 30000,
    maxStalledCount: 1,
    drainDelay: 5,
    concurrency: 1,
    removeOnComplete: {
      age: 24 * 3600,
      count: 100
    },
    removeOnFail: {
      age: 24 * 3600,
      count: 100
    }
  }
)

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on('active', job => {
  console.log(`Job ${job.id} started processing`)
})

worker.on('error', err => {
  console.error('Worker error:', err)
})

worker.on('stalled', jobId => {
  console.warn(`Job ${jobId} stalled`)
})

let isShuttingDown = false

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress, forcing exit')
    process.exit(1)
  }

  isShuttingDown = true
  console.log(`Received ${signal}, shutting down gracefully...`)

  try {
    await worker.close()
    await dbConnection.end()
    console.log('Worker closed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error during graceful shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})

console.log('Sanitize ingredient worker started and waiting for jobs...') 