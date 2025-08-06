import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { ingredient, recipeIngredient } from '../src/lib/server/db/schema'
import { eq } from 'drizzle-orm'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Create database connection for the worker
const dbConnection = postgres(process.env.DATABASE_URL || '', { max: 1 })
const db = drizzle(dbConnection)

async function sanitizeIngredientsWithAI(ingredientNames: string[]): Promise<string[]> {
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

sometimes it might make sense to return multiple words, if it implies a specific meaning, such as:

"almond flour" (not "almond")
"peanut butter" (not "peanut")
"olive oil" (not "olive")

Please return only the base ingredient names, one per line, in the same order as the input. Keep the names simple and singular (e.g., "tomato" not "tomatoes").

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
  
  // Parse the response - expect one ingredient per line
  const sanitizedNames = content
    .trim()
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
    .filter(name => name.length > 0) // Remove empty lines
  
  // Ensure we have the same number of ingredients
  if (sanitizedNames.length !== ingredientNames.length) {
    throw new Error(`Expected ${ingredientNames.length} ingredients but got ${sanitizedNames.length}`)
  }
  
  return sanitizedNames
}

async function updateIngredientName(ingredientId: string, newName: string): Promise<void> {
  // First check if an ingredient with this name already exists
  const existingIngredient = await db
    .select({ id: ingredient.id })
    .from(ingredient)
    .where(eq(ingredient.name, newName))
    .limit(1)

  if (existingIngredient.length > 0) {
    // If the ingredient already exists and it's not the same ingredient, we need to handle this
    const existingId = existingIngredient[0].id
    if (existingId !== ingredientId) {
      // Update all recipe_ingredient references to use the existing ingredient
      await db
        .update(recipeIngredient)
        .set({ ingredientId: existingId })
        .where(eq(recipeIngredient.ingredientId, ingredientId))
      
      // Delete the duplicate ingredient
      await db
        .delete(ingredient)
        .where(eq(ingredient.id, ingredientId))
      
      console.log(`Merged ingredient ${ingredientId} into existing ingredient ${existingId} (${newName})`)
      return
    }
  }

  // Update the ingredient name
  await db
    .update(ingredient)
    .set({ name: newName })
    .where(eq(ingredient.id, ingredientId))
  
  console.log(`Updated ingredient ${ingredientId} to "${newName}"`)
}

const worker = new Worker(
  'sanitize-ingredient',
  async job => {
    const { recipeId } = job.data
    console.log(`Processing ingredient sanitization for recipe ${recipeId}`)

    try {
      // Get all ingredients for this recipe from the database
      const recipeIngredients = await db
        .select({
          ingredientId: recipeIngredient.ingredientId,
          ingredientName: ingredient.name
        })
        .from(recipeIngredient)
        .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
        .where(eq(recipeIngredient.recipeId, recipeId))

      if (recipeIngredients.length === 0) {
        throw new Error('No ingredients found for this recipe')
      }

      const ingredientNames = recipeIngredients.map(ri => ri.ingredientName)
      const ingredientIds = recipeIngredients.map(ri => ri.ingredientId)

      console.log(`Found ${ingredientNames.length} ingredients to sanitize:`, ingredientNames)

      // Sanitize ingredients using AI
      const sanitizedNames = await sanitizeIngredientsWithAI(ingredientNames)
      console.log('AI sanitized names:', sanitizedNames)

      // Update ingredients in database with conflict handling
      for (let i = 0; i < ingredientIds.length; i++) {
        const ingredientId = ingredientIds[i]
        const sanitizedName = sanitizedNames[i]
        
        try {
          await updateIngredientName(ingredientId, sanitizedName)
        } catch (error) {
          console.error(`Failed to update ingredient ${ingredientId}:`, error)
          // Continue with other ingredients even if one fails
        }
      }

      // Store result in Redis for potential status checking
      try {
        await redis.set(
          `sanitize-ingredient:result:${job.id}`,
          JSON.stringify({ 
            status: 'completed', 
            recipeId,
            originalNames: ingredientNames,
            sanitizedNames: sanitizedNames
          }),
          { ex: 3600 }
        )
      } catch (redisError) {
        console.error('Failed to write to Redis:', redisError instanceof Error ? redisError.message : String(redisError))
        console.error('Redis error details:', redisError.cause.errors.map(e => e.message).join('\n'))
        // Don't fail the job if Redis is down
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

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})

console.log('Sanitize ingredient worker started and waiting for jobs...') 