import { Worker } from 'bullmq'
import { redis } from '../src/lib/server/redis'
import { createLlmClient, type LlmFunctionTool } from '../src/lib/llm'
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
    hint?: string | null
    ingredients: {
      name: string
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

const llm = createLlmClient('anthropic')

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
  if (recipes.length > 0) {
    try { console.log('JSON-LD found:', JSON.stringify(recipes, null, 2)) } catch { console.log('JSON-LD found (non-serializable)') }
  }
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
    ingredients: [] as { name: string }[]
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

async function attachIngredientsByLLM(imported: ImportedRecipeData, jsonLdIngredients: any): Promise<ImportedRecipeData> {
  try {
    const ingredientsArray: string[] = Array.isArray(jsonLdIngredients)
      ? jsonLdIngredients.map((x) => (typeof x === 'string' ? x : '')).filter(Boolean)
      : []
    if (!ingredientsArray.length || !imported.instructions?.length) return imported

    const stepTexts = imported.instructions.map((s) => s.text || '')

    const sys = `You will assign each ingredient line from a flat list (recipeIngredient) to one or more instruction steps.
Rules:
- Use only the provided ingredient lines EXACTLY as written for the 'name' field; do not invent or rephrase.
- Choose the first step where the ingredient is ADDED. If the same ingredient is referenced later without adding more, include it again with isPrepared=true.
- Do not attach ingredients to unrelated steps. It's fine if some steps have zero ingredients.
- IMPORTANT: Return step indexes as zero-based integers (step 1 => index 0, step 2 => index 1, ...).
Output JSON strictly via the provided function schema.`

    const messages = [
      { role: 'system' as const, content: sys },
      {
        role: 'user' as const,
        content: [
          'Ingredients:',
          ...ingredientsArray.map((s, i) => `${i + 1}. ${s}`),
          '',
          'Steps:',
          ...stepTexts.map((s, i) => `${i + 1}. ${s}`)
        ].join('\n')
      }
    ]

    const attachTools: LlmFunctionTool[] = [
      {
        name: 'attach_ingredients_to_instructions',
        description: 'Returns ingredient assignments per instruction index',
        parameters: {
          type: 'object',
          properties: {
            instructions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: { type: 'number' },
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        isPrepared: { type: 'boolean' }
                      }
                    }
                  }
                },
                required: ['index', 'ingredients']
              }
            }
          },
          required: ['instructions']
        }
      }
    ]
    const rr = await llm.chat(messages as any, { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0, tools: attachTools, toolChoice: { type: 'function', function: { name: 'attach_ingredients_to_instructions' } } })
    const toolCall = rr.toolCalls?.[0]
    // @ts-ignore
    if (!toolCall?.function?.arguments) return imported
    // @ts-ignore
    const result = JSON.parse(toolCall.function.arguments) as { instructions: Array<{ index: number; ingredients: Array<{ name: string; isPrepared?: boolean }> }> }

    const stepCount = imported.instructions.length
    const mapping = new Map<number, Array<{ name: string; isPrepared?: boolean }>>()
    for (const it of result.instructions || []) {
      const idx = Math.trunc(Number((it as any)?.index))
      if (!Number.isFinite(idx) || idx < 0 || idx >= stepCount) continue
      if (!Array.isArray((it as any)?.ingredients)) continue
      const existing = mapping.get(idx) ?? []
      for (const ing of (it as any).ingredients) {
        const name = String((ing as any)?.name ?? '').trim()
        if (!name) continue
        const isPrepared = typeof (ing as any)?.isPrepared === 'boolean' ? (ing as any).isPrepared : undefined
        if (!existing.some((e) => e.name === name && e.isPrepared === isPrepared)) existing.push({ name, isPrepared })
      }
      mapping.set(idx, existing)
    }

    const updated: ImportedRecipeData = {
      ...imported,
      instructions: imported.instructions.map((ins, idx) => ({
        ...ins,
        ingredients: mapping.get(idx) ?? []
      }))
    }
    try {
      const assignedTotal = updated.instructions.reduce((acc, s) => acc + (s.ingredients?.length ?? 0), 0)
      console.log(`LLM ingredient mapping: steps=${stepCount}, assigned=${assignedTotal}`)
    } catch { }
    return updated
  } catch (e) {
    console.warn('Failed to attach ingredients by LLM:', (e as Error)?.message)
    return imported
  }
}

const unescapeHtml = (s: string): string =>
  s
    .replace(/&quot;/g, '"').replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&').replace(/&#38;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")

function* walk(obj: any): any {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) { for (const v of obj) yield* walk(v); return }
  yield obj
  for (const v of Object.values(obj)) yield* walk(v)
}

function isRecipeType(t: any): boolean {
  if (!t) return false
  const arr = Array.isArray(t) ? t : [t]
  return arr.map(String).some((x) => x.toLowerCase() === 'recipe')
}

function pickBestRecipe(root: any): any {
  let best: any = null
  let bestScore = -1
  for (const node of walk(root)) {
    if (!isRecipeType((node as any)?.['@type'])) continue
    const ingredientsLen = Array.isArray((node as any).recipeIngredient) ? (node as any).recipeIngredient.length : 0
    const ri = (node as any).recipeInstructions
    const stepsLen = Array.isArray(ri)
      ? ri.length
      : Array.isArray((ri as any)?.itemListElement)
        ? (ri as any).itemListElement.length
        : 0
    const score = ingredientsLen * 2 + stepsLen + ((node as any).name ? 1 : 0) + ((node as any).image ? 1 : 0)
    if (score > bestScore) { best = node; bestScore = score }
  }
  return best
}

function salvageMultiJsonObjects(raw: string): any[] {
  const cleaned = raw.replace(/^\s*<!--|-->\s*$/g, '')
  try {
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {}
  const parts = cleaned
    .split(/}\s*{\s*/g)
    .map((p, i, a) => (i === 0 ? p : '{' + p) + (i === a.length - 1 ? '' : '}'))
  const out: any[] = []
  for (const p of parts) {
    try { out.push(JSON.parse(p)) } catch {}
  }
  return out
}

const sniffJsonLd = async (url: string, opts?: { byteLimit?: number; timeLimitMs?: number }): Promise<{ data: ImportedRecipeData; recipeIngredient?: any } | null> => {
  const byteLimit = opts?.byteLimit ?? 600 * 1024
  const timeLimitMs = opts?.timeLimitMs ?? 500
  let u: URL
  try { u = new URL(url) } catch { return null }
  if (!/^https?:$/.test(u.protocol)) return null
  const hostLC = u.hostname.toLowerCase()
  const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(hostLC)
  if (
    hostLC === 'localhost' ||
    hostLC.endsWith('.localhost') ||
    (isIPv4 && (
      hostLC.startsWith('10.') ||
      hostLC.startsWith('127.') ||
      hostLC.startsWith('169.254.') ||
      hostLC.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostLC)
    ))
  ) return null
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 ForklyImporter/1.0 (+importer)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br'
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Math.max(100, timeLimitMs))
  const started = Date.now()
  let reader: any
  try {
    const res = await fetch(u.toString(), { headers, redirect: 'follow', signal: controller.signal })
    if (!res.ok || !res.body) return null
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    if (!/html|xhtml|ld\+json/.test(contentType)) return null
    reader = (res.body as any).getReader?.()
    if (!reader) return null
    const decoder = new TextDecoder()
    let buffer = ''
    let total = 0
    let collecting = false
    let ldBuffer = ''

    const typeHint = 'application/ld+json'
    const hasLdJson = (s: string) => s.toLowerCase().includes(typeHint)
    const scriptRe = /<script[^>]*type=["']application\/ld\+json[^"'>]*["'][^>]*>([\s\S]*?)<\/script>/gi
    const startRe = /<script[^>]*type=["']application\/ld\+json[^"'>]*["'][^>]*>/i
    const endRe = /<\/script>/i

    while (true) {
      const now = Date.now()
      if (now - started > timeLimitMs) break
      const { value, done } = await reader.read()
      if (done) break
      total += value?.byteLength ?? 0
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      if (collecting) ldBuffer += chunk

      if (!collecting && hasLdJson(buffer) && /Recipe/i.test(buffer)) {
        let m: RegExpExecArray | null
        let matched = false
        while ((m = scriptRe.exec(buffer))) {
          matched = true
          const raw = unescapeHtml(m[1])
          try {
            const json = JSON.parse(raw)
            const node = pickBestRecipe(json)
            if (node) {
              const mapped = mapJsonLdToImported(node, url)
              console.log(`Sniff JSON-LD hit in ${Date.now() - started}ms, bytes=${total}`)
              try { await reader.cancel() } catch {}
              controller.abort()
              return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
            }
          } catch {
            const salvaged = salvageMultiJsonObjects(raw)
            for (const j of salvaged) {
              try {
                const node = pickBestRecipe(j)
                if (node) {
                  const mapped = mapJsonLdToImported(node, url)
                  console.log(`Sniff JSON-LD hit in ${Date.now() - started}ms, bytes=${total}`)
                  try { await reader.cancel() } catch {}
                  controller.abort()
                  return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
                }
              } catch {}
            }
          }
        }
        if (!matched) {
          const openIdx = buffer.search(startRe)
          if (openIdx >= 0) {
            collecting = true
            ldBuffer = buffer.slice(openIdx)
          }
        }
      } else if (collecting) {
        if (endRe.test(ldBuffer)) {
          const firstCloseIdx = ldBuffer.toLowerCase().indexOf('</script>')
          let content = ldBuffer.slice(0, firstCloseIdx)
          const gtIdx = content.indexOf('>')
          if (gtIdx >= 0) content = content.slice(gtIdx + 1)
          const raw = unescapeHtml(content)
          try {
            const json = JSON.parse(raw)
            const node = pickBestRecipe(json)
            if (node) {
              const mapped = mapJsonLdToImported(node, url)
              console.log(`Sniff JSON-LD hit in ${Date.now() - started}ms, bytes=${total}`)
              try { await reader.cancel() } catch {}
              controller.abort()
              return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
            }
          } catch {
            const salvaged = salvageMultiJsonObjects(raw)
            for (const j of salvaged) {
              try {
                const node = pickBestRecipe(j)
                if (node) {
                  const mapped = mapJsonLdToImported(node, url)
                  console.log(`Sniff JSON-LD hit in ${Date.now() - started}ms, bytes=${total}`)
                  try { await reader.cancel() } catch {}
                  controller.abort()
                  return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
                }
              } catch {}
            }
          }
          collecting = false
          ldBuffer = ''
        }
      }

      if (!collecting && total >= byteLimit) break
      if (!collecting && buffer.length > 2 * byteLimit) buffer = buffer.slice(-byteLimit)
    }

    buffer += decoder.decode()
    if (hasLdJson(buffer) && /Recipe/i.test(buffer)) {
      let m2: RegExpExecArray | null
      while ((m2 = scriptRe.exec(buffer))) {
        const raw = unescapeHtml(m2[1])
        try {
          const json = JSON.parse(raw)
          const node = pickBestRecipe(json)
          if (node) {
            const mapped = mapJsonLdToImported(node, url)
            try { await reader.cancel() } catch {}
            controller.abort()
            return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
          }
        } catch {
          const salvaged = salvageMultiJsonObjects(raw)
          for (const j of salvaged) {
            try {
              const node = pickBestRecipe(j)
              if (node) {
                const mapped = mapJsonLdToImported(node, url)
                try { await reader.cancel() } catch {}
                controller.abort()
                return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
              }
            } catch {}
          }
        }
      }
    }
    if (collecting && ldBuffer) {
      const afterGT = ldBuffer.slice(ldBuffer.indexOf('>') + 1)
      const raw = unescapeHtml(afterGT)
      try {
        const json = JSON.parse(raw)
        const node = pickBestRecipe(json)
        if (node) {
          const mapped = mapJsonLdToImported(node, url)
          try { await reader.cancel() } catch {}
          controller.abort()
          return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
        }
      } catch {
        const salvaged = salvageMultiJsonObjects(raw)
        for (const j of salvaged) {
          try {
            const node = pickBestRecipe(j)
            if (node) {
              const mapped = mapJsonLdToImported(node, url)
              try { await reader.cancel() } catch {}
              controller.abort()
              return { data: mapped, recipeIngredient: (node as any)?.recipeIngredient }
            }
          } catch {}
        }
      }
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
    try { controller.abort() } catch {}
  }
}

const getOgTitle = ($: CheerioAPI): string | null => {
  const og = $('meta[property="og:title"], meta[name="og:title"]').attr('content')
  return og ? og.toString().trim() : null
}

const normalizeHeuristic = (input: { title: string; description?: string; image?: string | null; steps: string[] }): ImportedRecipeData => {
  return {
    title: input.title || '',
    description: input.description || '',
    image: input.image ?? null,
    tags: [],
    servings: 1,
    nutritionMode: 'auto',
    instructions: (input.steps || []).map((t) => ({ text: t, mediaUrl: null, mediaType: null, hint: null, ingredients: [] }))
  }
}

const heuristicExtract = ($: CheerioAPI, baseUrl: string): { result: ImportedRecipeData; confidence: number; extractedText: string } => {
  let title = ($('h1').first().text() || '').trim()
  if (!title) title = getOgTitle($) || ''
  const ogImages = extractMetaImages($, baseUrl)

  const quantityRe = /(^|\s)(\d+[\-\s]?\d*\/?\d*|[¼½¾⅓⅔⅛⅜⅝⅞])(\s*[a-zA-Z]+)?\s+.+/
  const headerNodes = $('h2,h3,h4,h5').toArray().filter((el) => /ingredient/i.test($(el).text()))
  let ingItems: string[] = []
  for (const h of headerNodes) {
    const nextList = $(h).nextAll('ul,ol').first()
    if (nextList && nextList.length) {
      const items = nextList.find('li').toArray().map((li) => $(li).text().replace(/\s+/g, ' ').trim()).filter(Boolean)
      if (items.length >= 2) { ingItems = items; break }
    }
  }
  if (ingItems.length < 2) {
    const lists = $('ul,ol').toArray()
    let best: string[] = []
    for (const lst of lists) {
      const items = $(lst).find('li').toArray().map((li) => $(li).text().replace(/\s+/g, ' ').trim()).filter(Boolean)
      const hits = items.filter((t) => quantityRe.test(t)).length
      if (items.length >= 2 && hits >= Math.max(2, Math.floor(items.length * 0.4))) {
        if (items.length > best.length) best = items
      }
    }
    if (best.length) ingItems = best
  }

  const stepHeader = $('h2,h3,h4,h5').toArray().find((el) => /(instruction|method|direction|step)/i.test($(el).text()))
  let steps: string[] = []
  if (stepHeader) {
    const ol = $(stepHeader).nextAll('ol').first()
    if (ol && ol.length) steps = ol.find('li').toArray().map((li) => $(li).text().replace(/\s+/g, ' ').trim()).filter(Boolean)
    if (!steps.length) {
      const pBlock: string[] = []
      let sib = $(stepHeader).next()
      for (let i = 0; i < 12 && sib && sib.length; i++) {
        const tag = sib[0]?.tagName?.toLowerCase?.() || ''
        if (tag === 'p') pBlock.push(sib.text().replace(/\s+/g, ' ').trim())
        if (/^h[1-6]$/.test(tag)) break
        sib = sib.next()
      }
      const joined = pBlock.filter(Boolean).join('\n')
      if (joined) {
        const split = joined.split(/\n|(?<=\.)\s+(?=[A-Z])|\s*\d+[\).\-\s]+/).map((s) => s.trim()).filter((s) => s.length > 3)
        steps = split
      }
    }
  }
  if (!steps.length) {
    const ol = $('ol').first()
    if (ol && ol.length) steps = ol.find('li').toArray().map((li) => $(li).text().replace(/\s+/g, ' ').trim()).filter(Boolean)
  }
  if (!steps.length) {
    const paragraphs = $('p').toArray().map((p) => $(p).text().replace(/\s+/g, ' ').trim()).filter((t) => t.length > 20).slice(0, 8)
    const joined = paragraphs.join('\n')
    const split = joined.split(/\n|(?<=\.)\s+(?=[A-Z])|\s*\d+[\).\-\s]+/).map((s) => s.trim()).filter((s) => s.length > 3)
    steps = split.slice(0, 12)
  }

  const imageCand = chooseMainImage(ogImages)
  const heur = normalizeHeuristic({ title, description: '', image: imageCand, steps })
  const ingConfidence = ingItems.length >= 3 ? 0.5 : ingItems.length >= 2 ? 0.3 : 0
  const stepConfidence = steps.length >= 3 ? 0.5 : steps.length >= 2 ? 0.3 : 0
  const titleConfidence = heur.title.length > 3 ? 0.2 : 0
  const confidence = Math.min(1, ingConfidence + stepConfidence + titleConfidence)
  const extractedText = [
    heur.title ? `Title: ${heur.title}` : '',
    ingItems.length ? `Ingredients:\n${ingItems.map((x) => `- ${x}`).join('\n')}` : '',
    steps.length ? `Instructions:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''
  ].filter(Boolean).join('\n\n')
  return { result: heur, confidence, extractedText }
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

  const r = await llm.chat(messages as any, { provider: 'openai', model: 'gpt-4o', temperature: 0.1 })
  const content = r.content
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

  Honor the original recipe and don't make changes to the instructions.
 
 IMPORTANT about step ingredients:
 - If a step reuses the same physical ingredient portion prepared in an earlier step (not adding more), set isPrepared=true for that ingredient.
 - If the step calls for an additional amount of the ingredient, set isPrepared=false. Do not parse or include amounts/units; keep only the ingredient text in 'name'.
 - Example: Step 1 "Cook 4 cups rice" (isPrepared=false, name: "Cook 4 cups rice"). Step 2 "Mix the cooked rice with ..." (isPrepared=true, name: "cooked rice").
  Source: ${sourceUrlHint ?? 'unknown'}
  \n
  Recipe text:
  """${text}"""
  `

  console.log(text)

  const tools: LlmFunctionTool[] = [
    {
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
  ]
  const r = await llm.chat([{ role: 'user', content: prompt }], { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', temperature: 0, tools, toolChoice: { type: 'function', function: { name: 'parse_recipe' } } })
  const toolCall = r.toolCalls?.[0]

  //@ts-ignore
  if (!toolCall?.function?.arguments) {
    throw new Error('No function call arguments returned')
  }

  //@ts-ignore
  const parsed = JSON.parse(toolCall.function.arguments)
  return parsed
}

const extractRecipeWithTinyLLM = async (text: string, sourceUrlHint?: string): Promise<any> => {
  const prompt = `Return strict JSON only with keys: title, description, image, tags, servings, nutrition, instructions[]. Do not reword content. Use the provided text only. If uncertain, leave fields empty or null. Source: ${sourceUrlHint ?? 'unknown'}\n\nText:\n"""${text.slice(0, 8000)}"""`
  const tools2: LlmFunctionTool[] = [
    {
      name: 'parse_recipe',
      description: 'Parses a recipe into structured fields',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: ['string', 'null'] },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 3 },
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
  ]
  const r2 = await llm.chat([{ role: 'user', content: prompt }], { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0, maxTokens: 1200, tools: tools2, toolChoice: { type: 'function', function: { name: 'parse_recipe' } } })
  const toolCall = r2.toolCalls?.[0]
  // @ts-ignore
  if (!toolCall?.function?.arguments) throw new Error('No function call arguments returned')
  // @ts-ignore
  return JSON.parse(toolCall.function.arguments)
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
          name: ing.name,
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

const processUrlInput = async (url: string): Promise<{ parsed: ImportedRecipeData; markers: ImageCandidate[]; ogImages: ImageCandidate[]; rawText: string }> => {
  let localRawText = ''
  let localMarkers: ImageCandidate[] = []
  let localOgImages: ImageCandidate[] = []
  let localParsed: ImportedRecipeData

  const sniffStart = Date.now()
  const sniff = await sniffJsonLd(url, { byteLimit: 800 * 1024, timeLimitMs: 500 })
  if (sniff) {
    const mapped = sniff.data
    const jsonLdIngredients = sniff.recipeIngredient
    localParsed = jsonLdIngredients ? await attachIngredientsByLLM(mapped, jsonLdIngredients) : mapped
    console.log(`URL import resolved by JSON-LD sniff in ${Date.now() - sniffStart}ms`)
  } else {
    const fetched = await fetchAndCleanHtml(url)
    const { text: cleaned, $, html, markers: pageMarkers, ogImages: og } = fetched
    localMarkers = pageMarkers
    localOgImages = og
    const ld = extractJsonLd(cheerio.load(html))
    if (ld.length) {
      const mapped = mapJsonLdToImported(ld[0], url)
      localParsed = await attachIngredientsByLLM(mapped, (ld[0] as any)?.recipeIngredient)
      console.log('Resolved by full JSON-LD parse')
    } else {
      const heur = heuristicExtract($, url)
      localParsed = heur.result
      console.log(`Heuristic extraction confidence=${heur.confidence.toFixed(2)} items=${localParsed.instructions.length}`)
      if (heur.confidence < 0.7 || localParsed.instructions.length < 2) {
        localRawText = heur.extractedText
        const tiny = await extractRecipeWithTinyLLM(localRawText, url)
        localParsed = tiny
        console.log('Upgraded with tiny LLM structurizer')
      }
    }
  }

  return { parsed: localParsed, markers: localMarkers, ogImages: localOgImages, rawText: localRawText }
}

const processTextInput = async (theText: string): Promise<{ parsed: ImportedRecipeData; rawText: string }> => {
  const localRawText = cleanTextInput(theText)
  const heurText = localRawText.slice(0, 8000)
  const tiny = await extractRecipeWithTinyLLM(heurText)
  const localParsed = tiny
  return { parsed: localParsed, rawText: localRawText }
}

const processImageInput = async (images: string[]): Promise<{ parsed: ImportedRecipeData; rawText: string }> => {
  const extracted = await extractTextFromImages(images)
  const tiny = await extractRecipeWithTinyLLM(extracted.slice(0, 8000))
  return { parsed: tiny, rawText: extracted }
}

async function handleJob(job: any) {
  const { url, text, imageBase64Array, userId, username, inputType } = job.data as JobData
  console.log(`Processing import job for user ${username} (${userId}): ${inputType === 'url' ? url : inputType}`)

  let rawText = ''
  let parsed: ImportedRecipeData
  let markers: ImageCandidate[] = []
  let ogImages: ImageCandidate[] = []

  switch (inputType) {
    case 'url': {
      if (!url) throw new Error('URL is required for URL-based imports')
      const r = await processUrlInput(url)
      parsed = r.parsed
      markers = r.markers
      ogImages = r.ogImages
      rawText = r.rawText
      break
    }
    case 'text': {
      if (!text) throw new Error('Text content is required for text-based imports')
      const r = await processTextInput(text)
      parsed = r.parsed
      rawText = r.rawText
      break
    }
    case 'image': {
      if (!imageBase64Array || imageBase64Array.length === 0) throw new Error('Image data is required for image-based imports')
      const r = await processImageInput(imageBase64Array)
      parsed = r.parsed
      rawText = r.rawText
      break
    }
    default: {
      throw new Error('Invalid input type. Must be either "url", "text", or "image"')
    }
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
  return recipeData
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

worker.on('completed', async (job, result) => {
  try {
    const resultKey = `import-recipe:result:${job.id}`
    await redis.set(resultKey, JSON.stringify({ status: 'completed', result }), { ex: 3600 })
  } catch (e) {
    console.warn('Failed to persist completion result:', (e as Error)?.message)
  }
  try {
    const { inputType, url, userId } = job.data as JobData
    if (inputType === 'url' && url) {
      const cacheKey = `imported-url:${userId}:${url}`
      await redis.del(cacheKey)
    }
  } catch (e) {
    console.warn('Failed to clear cache on completion:', (e as Error)?.message)
  }
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', async (job, err) => {
  try {
    const resultKey = `import-recipe:result:${job?.id}`
    await redis.set(resultKey, JSON.stringify({ status: 'failed', error: (err as any)?.message ?? 'Internal error' }), { ex: 3600 })
  } catch (e) {
    console.warn('Failed to persist failure result:', (e as Error)?.message)
  }
  try {
    if (job?.data) {
      const { inputType, url, userId } = job.data as JobData
      if (inputType === 'url' && url) {
        const cacheKey = `imported-url:${userId}:${url}`
        await redis.del(cacheKey)
      }
    }
  } catch (e) {
    console.warn('Failed to clear cache on failure:', (e as Error)?.message)
  }
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
