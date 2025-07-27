import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function fetchAndCleanHtml(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`)
  const html = await res.text()
  const $ = cheerio.load(html)
  $('script, style, noscript, iframe, svg, header, footer, nav').remove()
  $('img').each((_, el) => {
    const src = $(el).attr('src')
    if (src && typeof src === 'string') {
      $(el).replaceWith(`[IMAGE: ${src}]`)
    } else {
      $(el).remove()
    }
  })
  const text = $('body').text()
  return text.replace(/\s+/g, ' ').trim()
}

async function extractRecipe(text: string): Promise<any> {
  const prompt = `
Extract a recipe in JSON format from the following text. If you see [IMAGE: url] markers, use them to select the best image for the recipe and for steps. Prefer images that appear early in the recipe for the main image.

Respond only with JSON, in this format:
{
  "title": "string",
  "description": "string",
  "image": "string (URL)",
  "tags": ["string", ...] (max 3),
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
      "mediaUrl": "string (URL)",
      "mediaType": "image" | "video" | null,
      "ingredients": [
        {
          "name": "string",
          "quantity": number,
          "measurement": "string"
        }, ...
      ]
    }, ...
  ]
}

The image should be a URL to an image of the dish, likely a picture early in the recipe. Prefer URLs from [IMAGE: url] markers that appear early in the text.

The mediaUrl should be a URL to an image or video of the step, if available, preferably from [IMAGE: url] markers near the step.

If any field is missing, set it to null, empty string, or empty array as appropriate.

If the recipe has no image, set the image to null.

If the recipe has no clear input for anything, set it empty instead of guessing.

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
  return JSON.parse(content)
}

const worker = new Worker(
  'import-recipe',
  async job => {
    const { url } = job.data
    try {
      const rawText = await fetchAndCleanHtml(url)
      const recipe = await extractRecipe(rawText)
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
      await redis.set(
        `import-recipe:result:${job.id}`,
        JSON.stringify({ status: 'completed', result: recipeData }),
        { EX: 3600 }
      )
    } catch (err: any) {
      await redis.set(
        `import-recipe:result:${job.id}`,
        JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }),
        { EX: 3600 }
      )
    }
  },
  {
    connection: { url: process.env.REDIS_URL }
  }
)

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
}) 