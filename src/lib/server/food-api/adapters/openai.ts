import OpenAI from 'openai'
import { OPENAI_API_KEY } from '$env/static/private'
import type { FoodAPI } from '..'

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

function buildPrompt(ingredients: { amount?: number; unit?: string; name: string }[], instructions: string, servings?: number) {
  const servingsText = typeof servings === 'number' && servings > 0 ? servings : 1
  const ingLines = ingredients.map((ing) => {
    const qty = typeof ing.amount === 'number' ? ing.amount : ''
    const unit = ing.unit ? ` ${ing.unit}` : ''
    return `- ${qty}${unit} ${ing.name}`.trim()
  })

  return [
    'Estimate nutrition for the recipe below. Use reliable nutrition databases implicitly. Do not hallucinate units.',
    `Return STRICT JSON with this shape (numbers only): { "calories": number, "protein": number, "carbs": number, "fat": number, "ingredients": [] }`,
    'Values should be per serving. If servings is provided, divide totals accordingly.',
    `Servings: ${servingsText}`,
    'Ingredients:',
    ingLines.join('\n') || '(none)',
    'Instructions:',
    instructions || '(none)'
  ].join('\n')
}

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error('Failed to parse JSON from OpenAI response')
  }
}

function toNumber(x: any): number {
  const n = typeof x === 'string' ? parseFloat(x) : Number(x)
  return Number.isFinite(n) ? n : 0
}

export const getRecipeInfo: FoodAPI['getRecipeInfo'] = async (ingredients, instructions, servings = 1) => {
  const prompt = buildPrompt(ingredients, instructions, servings)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    messages: [
      { role: 'system', content: 'You are a nutrition analysis assistant. Respond with strict JSON only.' },
      { role: 'user', content: prompt }
    ]
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI API')
  }

  const parsed = tryParseJson(content)

  const calories = toNumber(parsed.calories)
  const protein = toNumber(parsed.protein)
  const carbs = toNumber(parsed.carbs)
  const fat = toNumber(parsed.fat)

  return {
    calories,
    protein,
    carbs,
    fat,
    ingredients: []
  }
} 