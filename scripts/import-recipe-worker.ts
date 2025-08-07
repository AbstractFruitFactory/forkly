import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'

export type ImportedRecipeData = {
  title: string
  description: string
  image: string
  tags: string[]
  servings: number
  nutritionMode: 'auto' | 'manual' | 'none'
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  instructions: {
    text: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients: {
      name: string
      quantity: string
      measurement: string
    }[]
  }[]
}

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function fetchAndCleanHtml(url: string): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers,
        redirect: 'follow'
      })
      
      if (!res.ok) {
        if (res.status === 403 && attempt < maxRetries) {
          console.log(`Attempt ${attempt}: Got 403, retrying in ${attempt * 2}s...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
          lastError = new Error(`Failed to fetch URL: ${res.statusText}`)
          continue
        }
        throw new Error(`Failed to fetch URL: ${res.statusText}`)
      }
      
      const html = await res.text()
      const $ = cheerio.load(html)
      $('script, style, noscript, iframe, svg, header, footer, nav').remove()
      $('img').each((_, el) => {
        const $el = $(el)
        const src = $el.attr('src')
        const dataSrc = $el.attr('data-src')
        const dataPinMedia = $el.attr('data-pin-media')
        const dataLazySrc = $el.attr('data-lazy-src')
        const dataOriginal = $el.attr('data-original')
        const width = $el.attr('width')
        const height = $el.attr('height')
        
        let imageUrl = dataSrc || dataPinMedia || dataLazySrc || dataOriginal || src
        
        if (imageUrl && typeof imageUrl === 'string') {
          // Filter out empty SVG placeholders and data URIs that are just placeholders
          if (imageUrl.startsWith('data:image/svg+xml') && 
              (imageUrl.includes('viewBox') || imageUrl.includes('width') && imageUrl.includes('height'))) {
            // This is likely an empty SVG placeholder, skip it
            $el.remove()
          } else if (imageUrl.startsWith('http') || imageUrl.startsWith('//')) {
            // This is a real image URL
            const dimensions = width && height ? ` (${width}x${height})` : ''
            $el.replaceWith(`[IMAGE: ${imageUrl}${dimensions}]`)
          } else {
            // Skip relative URLs or other non-http URLs
            $el.remove()
          }
        } else {
          $el.remove()
        }
      })
      const text = $('body').text()
      return text.replace(/\s+/g, ' ').trim()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed: ${error}. Retrying in ${attempt * 2}s...`)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch URL after all retries')
}

function cleanTextInput(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function extractTextFromImages(imageBase64Array: string[]): Promise<string> {
  const prompt = `
Extract all text from these recipe images. Pay special attention to:
- Recipe title
- Ingredients list with quantities and measurements
- Cooking instructions/steps
- Any nutritional information
- Serving size
- Cooking time or other relevant details

Please extract the text exactly as it appears, maintaining the structure and formatting as much as possible. If there are multiple columns or sections, preserve that layout in the text output.

Combine all the text from all images into a single coherent recipe. If the images show different parts of the same recipe, merge them logically.

If any of the images are not recipes or contain no readable text, please indicate that clearly.

If there are multiple images, treat them as parts of the same recipe and combine the information appropriately.
`

  const messages: any[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...imageBase64Array.map(base64 => ({
          type: 'image_url' as const,
          image_url: {
            url: `data:image/jpeg;base64,${base64}`
          }
        }))
      ]
    }
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    messages
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI vision API')
  return content
}

async function extractRecipe(text: string): Promise<any> {
  const prompt = `
Extract a recipe in JSON format from the following text. If you see [IMAGE: url (WxH)] markers, you MUST use them to select the best image for the recipe and for steps. 

IMPORTANT: Every instruction MUST include mediaUrl and mediaType fields, even if they are null. When you see [IMAGE: url] markers in the text, extract those URLs and assign them to the most relevant instruction step.

Respond only with JSON, in this format:
{
  "title": "string",
  "description": "string",
  "image": "string (URL)",
  "servings": number,
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  } | null,
  "instructions": [
    {
      "text": "string",
      "mediaUrl": "string (URL) | null",
      "mediaType": "image" | "video" | null,
      "ingredients": [
        {
          "name": string,
          "quantity": string,
          "measurement": string
        }, ...
      ]
    }, ...
  ]
}

For the main recipe image, prioritize larger images (higher width x height values) as they are typically more representative of the final dish. Look for images with dimensions like 1440x1920, 1440x960, etc. over smaller ones like 180x180.

For each instruction step, you MUST include:
- mediaUrl: Extract URLs from [IMAGE: url] markers that appear near or before that step. If no relevant image is found, set to null.
- mediaType: Set to "image" if mediaUrl contains an image URL, "video" if it's a video URL, or null if mediaUrl is null.

If any field is missing, set it to null, empty string, or empty array as appropriate.

If the recipe has no image, set the image to null.

If the recipe has no clear input for anything, set it empty instead of guessing.

For ingredients, quantity is required if measurement is provided. For non-quantifiable inputs like "to taste", enter it into the quantity field.

If there is no clear recipe title, make one up based on the content.

Feel free to combine steps if it makes sense to do so. If the step mentions quantities of ingredients, change the text to omit the quantity.

Recipe text:
"""${text.slice(0, 8000)}"""
`
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })
  const content = completion.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')
  const parsed = JSON.parse(content)
  console.log('AI extracted recipe - Title:', parsed.title, 'Instructions:', parsed.instructions?.length || 0, 'steps')
  return parsed
}

const worker = new Worker(
  'import-recipe',
  async job => {
    const { url, text, imageBase64Array, userId, username, inputType } = job.data
    console.log(`Processing import job for user ${username} (${userId}): ${inputType === 'url' ? url : inputType === 'text' ? 'text input' : 'image input'}`)

    try {
      let rawText: string

      if (inputType === 'url') {
        if (!url) throw new Error('URL is required for URL-based imports')
        rawText = await fetchAndCleanHtml(url)
      } else if (inputType === 'text') {
        if (!text) throw new Error('Text content is required for text-based imports')
        rawText = cleanTextInput(text)
      } else if (inputType === 'image') {
        if (!imageBase64Array || imageBase64Array.length === 0) {
          throw new Error('Image data is required for image-based imports')
        }
        rawText = await extractTextFromImages(imageBase64Array)
      } else {
        throw new Error('Invalid input type. Must be either "url", "text", or "image"')
      }

      const recipe = await extractRecipe(rawText)

      if (rawText.includes('[IMAGE:')) {
        const imageMatches = rawText.match(/\[IMAGE: ([^\]]+)\]/g)
      }

      const recipeData = {
        title: recipe.title || '',
        description: recipe.description || '',
        image: recipe.image || '',
        tags: Array.isArray(recipe.tags) ? recipe.tags : [],
        servings: recipe.servings ? Number(recipe.servings) : 1,
        nutritionMode: recipe.nutrition ? 'manual' : 'auto',
        nutrition: recipe.nutrition || undefined,
        instructions: Array.isArray(recipe.instructions)
          ? recipe.instructions.map((inst: any) => ({
            text: inst.text || '',
            mediaUrl: inst.mediaUrl || undefined,
            mediaType: inst.mediaType || undefined,
            ingredients: Array.isArray(inst.ingredients)
              ? inst.ingredients.map((ing: any) => ({
                name: ing.name || '',
                quantity: ing.quantity ?? 0,
                measurement: ing.measurement || ''
              }))
              : []
          }))
          : []
      }
      console.log('Writing completed recipe to Redis:', `import-recipe:result:${job.id}`)
      console.log('Value:', JSON.stringify({ status: 'completed', result: recipeData }))
      await redis.set(
        `import-recipe:result:${job.id}`,
        JSON.stringify({ status: 'completed', result: recipeData }),
        { ex: 3600 }
      )

      // Clean up the deduplication cache key (only for URL imports)
      if (inputType === 'url' && url) {
        const cacheKey = `imported-url:${userId}:${url}`
        await redis.del(cacheKey)
      }

      console.log(`Job ${job.id} completed successfully`)
      return recipeData
    } catch (err: any) {
      console.log('Writing failed recipe to Redis:', `import-recipe:result:${job.id}`)
      console.log('Value:', JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }))
      await redis.set(
        `import-recipe:result:${job.id}`,
        JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }),
        { ex: 3600 }
      )

      // Clean up the deduplication cache key on failure too (only for URL imports)
      if (inputType === 'url' && url) {
        const cacheKey = `imported-url:${userId}:${url}`
        await redis.del(cacheKey)
      }

      console.error(`Job ${job.id} failed:`, err.message)
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

console.log('Import recipe worker started and waiting for jobs...') 