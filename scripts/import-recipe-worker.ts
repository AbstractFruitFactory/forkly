import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import dotenv from 'dotenv'
import { setTimeout as delay } from 'node:timers/promises'
import { URL as NodeURL } from 'node:url'

dotenv.config()

export type ImportedRecipeData = {
  title: string
  description: string
  image: string | null
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
    mediaUrl?: string | null
    mediaType?: 'image' | 'video' | null
    ingredients: {
      name: string
      quantity: string
      measurement: string
      isPrepared?: boolean
    }[]
  }[]
}

type InputType = 'url' | 'text' | 'image'

type JobData = {
  url?: string
  text?: string
  imageBase64Array?: string[]
  userId: string
  username: string
  inputType: InputType
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function resolveUrl(base: string, maybe: string | undefined | null): string | null {
  if (!maybe) return null
  try {
    return new NodeURL(maybe, base).toString()
  } catch {
    return null
  }
}

function toInt(x: any): number | undefined {
  if (x == null) return undefined
  const n = Number(x)
  if (Number.isFinite(n)) return n
  const m = String(x).match(/(-?\d{2,5})/)
  return m ? Number(m[1]) : undefined
}

type ImageCandidate = {
  url: string
  width?: number
  height?: number
  source: 'jsonld' | 'og' | 'marker'
  order?: number
}

function looksLikeLogo(u: string): boolean {
  const s = u.toLowerCase()
  return /(logo|sprite|icon|placeholder|blank|avatar|favicon)/.test(s)
}

function chooseMainImage(cands: ImageCandidate[]): string | null {
  if (!cands.length) return null
  const dedup = new Map<string, ImageCandidate>()
  for (const c of cands) {
    if (!c.url) continue
    if (!dedup.has(c.url)) dedup.set(c.url, c)
  }
  const arr = [...dedup.values()]
  arr.sort((a, b) => {
    const areaA = (a.width ?? 0) * (a.height ?? 0)
    const areaB = (b.width ?? 0) * (b.height ?? 0)
    const srcW = (t: ImageCandidate['source']) => (t === 'jsonld' ? 3 : t === 'og' ? 2 : 1)
    const penA = looksLikeLogo(a.url) ? -1000 : 0
    const penB = looksLikeLogo(b.url) ? -1000 : 0
    return (srcW(b.source) + areaB / 1e6 + penB) - (srcW(a.source) + areaA / 1e6 + penA)
  })
  const best = arr.find(c => !looksLikeLogo(c.url) && ((c.width ?? 0) >= 256 || (c.height ?? 0) >= 256)) || arr[0]
  return best?.url ?? null
}

function extractMetaImages($: CheerioAPI, baseUrl: string): ImageCandidate[] {
  const out: ImageCandidate[] = []
  const ogImg = $('meta[property="og:image"], meta[name="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]').attr('content')
  const w = toInt($('meta[property="og:image:width"]').attr('content'))
  const h = toInt($('meta[property="og:image:height"]').attr('content'))
  if (ogImg) {
    const abs = resolveUrl(baseUrl, ogImg)
    if (abs) out.push({ url: abs, width: w, height: h, source: 'og' })
  }
  return out
}

async function fetchAndCleanHtml(url: string): Promise<{ text: string; $: CheerioAPI; html: string; markers: ImageCandidate[]; ogImages: ImageCandidate[] }> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 ForklyImporter/1.0 (+importer)'
  }

  const maxRetries = 4
  let lastErr: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
          const backoff = Math.min(2000 * 2 ** (attempt - 1), 10000) + Math.random() * 500
          await delay(backoff)
          continue
        }
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
      }
      const html = await res.text()
      const $ = cheerio.load(html)
      $('script, style, noscript, iframe, svg').remove()

      const markers: ImageCandidate[] = []
      let order = 0
      $('img').each((_: number, el: any) => {
        const $el = $(el)
        const candidates = ['data-src', 'data-pin-media', 'data-lazy-src', 'data-original', 'src']
          .map((a) => $el.attr(a))
          .filter(Boolean) as string[]
        const imageUrl = candidates[0]
        if (imageUrl?.startsWith('data:image')) {
          $el.remove()
          return
        }
        const absolute = imageUrl ? resolveUrl(url, imageUrl) : null
        if (absolute) {
          const wAttr = $el.attr('width')
          const hAttr = $el.attr('height')
          const w = toInt(wAttr)
          const h = toInt(hAttr)
          markers.push({ url: absolute, width: w, height: h, source: 'marker', order: order++ })
          $el.replaceWith(`<p>[IMAGE: ${absolute}${w && h ? ` (${w}x${h})` : ''}]</p>`)
        } else {
          $el.remove()
        }
      })

      const ogImages = extractMetaImages($, url)

      const pieces: string[] = []
      $('h1,h2,h3,h4,p,li').each((_: number, el: any) => {
        const tag = el.tagName?.toLowerCase?.() ?? ''
        let t = $(el).text().replace(/\s+/g, ' ').trim()
        if (!t) return
        if (tag === 'li') t = `- ${t}`
        pieces.push(t)
      })
      const text = pieces.join('\n').replace(/\n{3,}/g, '\n\n').trim()
      return { text, $, html, markers, ogImages }
    } catch (e) {
      clearTimeout(timeout)
      lastErr = e
      if (attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** (attempt - 1), 10000) + Math.random() * 500
        await delay(backoff)
      }
    }
  }
  throw lastErr ?? new Error('Fetch failed')
}

function cleanTextInput(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function extractJsonLd($: CheerioAPI): any[] {
  const recipes: any[] = []
  $('script[type="application/ld+json"]').each((_: number, el: any) => {
    try {
      const raw = $(el).contents().text()
      if (!raw) return
      const json = JSON.parse(raw)
      const items = Array.isArray(json) ? json : [json]
      for (const it of items) {
        const graph = it['@graph'] || items
        const arr = Array.isArray(graph) ? graph : [graph]
        for (const node of arr) {
          const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
          if (types?.includes?.('Recipe')) recipes.push(node)
        }
      }
    } catch { }
  })
  return recipes
}

function coerceNumber(n: any): number | undefined {
  if (n == null) return undefined
  if (typeof n === 'number' && Number.isFinite(n)) return n
  const m = String(n).match(/[-+]?\d*\.?\d+/)
  return m ? Number(m[0]) : undefined
}

function safeServings(yieldVal: any): number | undefined {
  const n = coerceNumber(yieldVal)
  if (n && n > 0 && n < 1000) return Math.round(n)
  return undefined
}

function bestImageFromJsonLd(img: any, baseUrl: string): ImageCandidate | null {
  if (!img) return null
  const asArray = Array.isArray(img) ? img : [img]
  let best: { url: string; score: number; width?: number; height?: number } | null = null
  for (const it of asArray) {
    if (!it) continue
    if (typeof it === 'string') {
      const url = resolveUrl(baseUrl, it)
      if (url) best = !best ? { url, score: 1 } : best
    } else if (typeof it === 'object') {
      const url = resolveUrl(baseUrl, it.url || it['@id'] || it.contentUrl || it.thumbnailUrl)
      const w = coerceNumber(it.width) ?? 0
      const h = coerceNumber(it.height) ?? 0
      const score = w * h || 1
      if (url && (!best || score > best.score)) best = { url, score, width: w, height: h }
    }
  }
  return best ? { url: best.url, width: best.width, height: best.height, source: 'jsonld' } : null
}

function mapJsonLdToImported(recipeNode: any, baseUrl: string): ImportedRecipeData {
  const title = recipeNode.name || ''
  const description = recipeNode.description || ''
  const imgCand = bestImageFromJsonLd(recipeNode.image, baseUrl)
  const image = imgCand?.url ?? null
  const servings = safeServings(recipeNode.recipeYield) ?? 1

  const steps: any[] = []
  const ri = recipeNode.recipeInstructions
  if (Array.isArray(ri)) {
    for (const entry of ri) {
      if (!entry) continue
      if (typeof entry === 'string') {
        steps.push({ text: entry, image: null })
      } else if (entry['@type'] === 'HowToSection' && Array.isArray(entry.itemListElement)) {
        for (const sub of entry.itemListElement) {
          const text = (sub.text || sub.name || '').toString()
          const stepImg = bestImageFromJsonLd(sub.image, baseUrl)
          if (text) steps.push({ text, image: stepImg?.url ?? null })
        }
      } else {
        const text = (entry.text || entry.name || '').toString()
        const stepImg = bestImageFromJsonLd(entry.image, baseUrl)
        if (text) steps.push({ text, image: stepImg?.url ?? null })
      }
    }
  } else if (typeof ri === 'string') {
    steps.push({ text: ri, image: null })
  }

  const rawTags: string[] = []
  const keywords = recipeNode.keywords
  if (typeof keywords === 'string') rawTags.push(...keywords.split(/[;,]/))
  if (Array.isArray(keywords)) rawTags.push(...keywords)
  if (recipeNode.recipeCuisine) rawTags.push(recipeNode.recipeCuisine)
  if (recipeNode.suitableForDiet) rawTags.push(
    ...(Array.isArray(recipeNode.suitableForDiet) ? recipeNode.suitableForDiet : [recipeNode.suitableForDiet])
  )
  const tags = Array.from(
    new Set(
      rawTags.map((t) => t?.toString()?.toLowerCase()?.trim()).filter(Boolean)
    )
  ).slice(0, 3)

  const n = recipeNode.nutrition || {}
  const calories = coerceNumber(n.calories)
  const protein = coerceNumber(n.proteinContent)
  const carbs = coerceNumber(n.carbohydrateContent)
  const fat = coerceNumber(n.fatContent)

  const nutritionComplete = [calories, protein, carbs, fat].every((v) => typeof v === 'number' && v >= 0 && v < 10000)
  const nutrition = nutritionComplete
    ? { calories: calories!, protein: protein!, carbs: carbs!, fat: fat! }
    : undefined

  const instructions = steps.map((s) => ({
    text: s.text || '',
    mediaUrl: s.image ?? null,
    mediaType: s.image ? ('image' as const) : null,
    ingredients: [] as { name: string; quantity: string; measurement: string }[]
  }))

  return {
    title,
    description,
    image,
    tags,
    servings,
    nutritionMode: nutrition ? 'manual' : 'auto',
    nutrition,
    instructions
  }
}

async function extractTextFromImages(imageBase64Array: string[]): Promise<string> {
  const prompt = `
  Extract all text from these recipe images. Preserve structure (title, ingredients with quantities, steps, nutrition, servings, times). Combine into a single coherent recipe. If non-recipe or unreadable, say so.`

  const messages: any[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...imageBase64Array.map((base64) => ({
          type: 'image_url' as const,
          image_url: { url: `data:image/jpeg;base64,${base64}` }
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

async function extractRecipeWithLLM(text: string, sourceUrlHint?: string): Promise<any> {
  const prompt = `
  Extract a recipe from the following text. 
  If you see [IMAGE: url (WxH)] markers, USE them for the main recipe image and to attach to relevant steps. 
  Always include mediaUrl and mediaType ("image" | "video" | null) in every instruction. 
  If missing info, set null/empty instead of guessing. 
  Title can be inferred from content if absent. 
  Use exactly up to 3 short, relevant tags.
  If nutrition facts are present, include them in the nutrition object.
  If a unit is specified, a quantity has to be specified as well. Measurements such as "to taste" go into the "quantity" field.
 
 IMPORTANT about step ingredients:
 - If a step reuses the same physical ingredient portion prepared in an earlier step (not adding more), set isPrepared=true for that ingredient and do not infer additional quantity/measurement for that step.
 - If the step calls for an additional amount of the ingredient, set isPrepared=false and include the new amount/unit.
 - Example: Step 1 "Cook 4 cups rice" (isPrepared=false with 4 cups). Step 2 "Mix the cooked rice with ..." (isPrepared=true for rice, no extra quantity).
  Source: ${sourceUrlHint ?? 'unknown'}
  \n
  Recipe text:
  """${text}"""
  `

  console.log(text)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'parse_recipe',
          description: 'Parses a recipe into structured fields',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              image: { type: ['string', 'null'] },
              tags: {
                type: 'array',
                items: { type: 'string' },
                maxItems: 3
              },
              servings: { type: 'number' },
              nutrition: {
                type: ['object', 'null'],
                properties: {
                  calories: { type: 'number' },
                  protein: { type: 'number' },
                  carbs: { type: 'number' },
                  fat: { type: 'number' }
                }
              },
              instructions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    mediaUrl: { type: ['string', 'null'] },
                    mediaType: { type: ['string', 'null'], enum: ['image', 'video', null] },
                    ingredients: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          quantity: { type: 'string' },
                          measurement: { type: 'string' },
                          isPrepared: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ['title', 'instructions', 'servings']
          }
        }
      }
    ],
    tool_choice: { type: 'function', function: { name: 'parse_recipe' } }
  })

  const toolCall = completion.choices[0].message.tool_calls?.[0]
  if (!toolCall?.function?.arguments) {
    throw new Error('No function call arguments returned')
  }

  const parsed = JSON.parse(toolCall.function.arguments)
  return parsed
}

function normalizeRecipe(parsed: any): ImportedRecipeData {
  const title = parsed.title || ''
  const description = parsed.description || ''
  const image = parsed.image ?? null
  const servings = parsed.servings ? Number(parsed.servings) : 1

  const rawTags: string[] = Array.isArray(parsed.tags) ? parsed.tags : []
  const tags = Array.from(new Set(rawTags.map((t) => t?.toString()?.toLowerCase()?.trim()).filter(Boolean))).slice(0, 3)

  const n = parsed.nutrition
  const nutOk = n && [n.calories, n.protein, n.carbs, n.fat].every((x: any) => typeof x === 'number' && x >= 0 && x < 10000)
  const nutrition = nutOk ? { calories: n.calories, protein: n.protein, carbs: n.carbs, fat: n.fat } : undefined

  const instructions = Array.isArray(parsed.instructions)
    ? parsed.instructions.map((inst: any) => ({
      text: inst.text || '',
      mediaUrl: inst.mediaUrl ?? null,
      mediaType: inst.mediaType ?? null,
      ingredients: Array.isArray(inst.ingredients)
        ? inst.ingredients.map((ing: any) => ({
          name: ing.name || '',
          quantity: typeof ing.quantity === 'string' ? ing.quantity : (ing.quantity ?? '').toString(),
          measurement: ing.measurement || '',
          isPrepared: typeof ing.isPrepared === 'boolean' ? ing.isPrepared : undefined
        }))
        : []
    }))
    : []

  return {
    title,
    description,
    image,
    tags,
    servings,
    nutritionMode: nutrition ? 'manual' : 'auto',
    nutrition,
    instructions
  }
}

function attachStepImagesIfMissing(instructions: ImportedRecipeData['instructions'], markers: ImageCandidate[], mainImage: string | null) {
  const filtered = markers
    .filter(m => m.url && m.url !== mainImage && !looksLikeLogo(m.url))
    .filter(m => ((m.width ?? 0) >= 300 || (m.height ?? 0) >= 250))
  let i = 0
  for (const step of instructions) {
    if (!step.mediaUrl && filtered[i]) {
      step.mediaUrl = filtered[i].url
      step.mediaType = 'image'
      i++
      if (i >= filtered.length) break
    }
  }
}

async function handleJob(job: any) {
  const { url, text, imageBase64Array, userId, username, inputType } = job.data as JobData
  console.log(`Processing import job for user ${username} (${userId}): ${inputType === 'url' ? url : inputType}`)

  try {
    let rawText = ''
    let parsed: any | null = null
    let markers: ImageCandidate[] = []
    let ogImages: ImageCandidate[] = []

    if (inputType === 'url') {
      if (!url) throw new Error('URL is required for URL-based imports')
      const fetched = await fetchAndCleanHtml(url)
      const { text: cleaned, $, markers: pageMarkers, ogImages: og } = fetched
      markers = pageMarkers
      ogImages = og

      const ld = extractJsonLd($)
      if (ld.length) {
        parsed = mapJsonLdToImported(ld[0], url)
      } else {
        rawText = cleaned
        parsed = await extractRecipeWithLLM(rawText, url)
      }
    } else if (inputType === 'text') {
      if (!text) throw new Error('Text content is required for text-based imports')
      rawText = cleanTextInput(text)
      parsed = await extractRecipeWithLLM(rawText)
    } else if (inputType === 'image') {
      if (!imageBase64Array || imageBase64Array.length === 0) throw new Error('Image data is required for image-based imports')
      rawText = await extractTextFromImages(imageBase64Array)
      parsed = await extractRecipeWithLLM(rawText)
    } else {
      throw new Error('Invalid input type. Must be either "url", "text", or "image"')
    }

    const recipe = normalizeRecipe(parsed)

    const candidates: ImageCandidate[] = []
    if (recipe.image) candidates.push({ url: recipe.image, source: 'jsonld' })
    candidates.push(...ogImages)
    candidates.push(...markers)
    const chosen = chooseMainImage(candidates)
    recipe.image = chosen ?? recipe.image ?? null

    attachStepImagesIfMissing(recipe.instructions, markers, recipe.image)

    const recipeData: ImportedRecipeData = {
      title: recipe.title,
      description: recipe.description,
      image: recipe.image ?? null,
      tags: recipe.tags,
      servings: recipe.servings,
      nutritionMode: recipe.nutrition ? 'manual' : 'auto',
      nutrition: recipe.nutrition ?? undefined,
      instructions: recipe.instructions
    }

    console.log(JSON.stringify(recipeData, null, 2))

    const resultKey = `import-recipe:result:${job.id}`
    await redis.set(resultKey, JSON.stringify({ status: 'completed', result: recipeData }), { ex: 3600 })

    if (inputType === 'url' && url) {
      const cacheKey = `imported-url:${userId}:${url}`
      await redis.del(cacheKey)
    }

    console.log(`Job ${job.id} completed successfully`)
    return recipeData
  } catch (err: any) {
    const resultKey = `import-recipe:result:${job.id}`
    await redis.set(resultKey, JSON.stringify({ status: 'failed', error: err.message ?? 'Internal error' }), { ex: 3600 })

    if (inputType === 'url' && url) {
      const cacheKey = `imported-url:${userId}:${url}`
      await redis.del(cacheKey)
    }

    console.error(`Job ${job?.id} failed:`, err?.message)
    throw err
  }
}

const worker = new Worker<JobData>(
  'import-recipe',
  async (job) => handleJob(job),
  {
    connection: { url: process.env.REDIS_URL },
    lockDuration: 30000,
    lockRenewTime: 15000,
    stalledInterval: 30000,
    maxStalledCount: 1,
    drainDelay: 5,
    concurrency: 1,
    removeOnComplete: { age: 24 * 3600, count: 100 },
    removeOnFail: { age: 24 * 3600, count: 100 }
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})
worker.on('active', (job) => {
  console.log(`Job ${job.id} started processing`)
})
worker.on('error', (err) => {
  console.error('Worker error:', err)
})
worker.on('stalled', (jobId) => {
  console.warn(`Job ${jobId} stalled`)
})

let isShuttingDown = false

async function closeRedisIfPossible() {
  try {
    // @ts-ignore – common clients expose quit() or disconnect()
    if (typeof (redis as any).quit === 'function') await (redis as any).quit()
    // @ts-ignore
    else if (typeof (redis as any).disconnect === 'function') await (redis as any).disconnect()
  } catch (e) {
    console.warn('Failed to close Redis client cleanly:', (e as Error)?.message)
  }
}

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress, forcing exit')
    process.exit(1)
  }
  isShuttingDown = true
  console.log(`Received ${signal}, shutting down gracefully...`)
  try {
    await worker.close()
    await closeRedisIfPossible()
    console.log('Worker and Redis closed successfully')
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

console.log('Import recipe worker started and waiting for jobs...')
