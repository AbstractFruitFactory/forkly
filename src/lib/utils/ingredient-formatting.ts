import type { MeasurementUnit } from '$lib/types'
import { measurementUnits } from '$lib/types'
import type { Ingredient } from '$lib/types'
import Fraction from 'fraction.js'

/** --- Unit Data --- **/

export const UNITS = {
  weight: {
    metric: ['grams', 'kilograms'],
    imperial: ['ounces', 'pounds']
  },
  volume: {
    metric: ['milliliters', 'liters', 'teaspoons', 'tablespoons'],
    imperial: ['cups', 'fluid_ounces', 'gallons', 'teaspoons', 'tablespoons']
  },
  length: {
    metric: ['millimeters', 'centimeters', 'meters'],
    imperial: ['inches', 'feet']
  }
}

export const METRIC_UNITS = [
  ...UNITS.weight.metric,
  ...UNITS.volume.metric,
  ...UNITS.length.metric
]

export const IMPERIAL_UNITS = [
  ...UNITS.weight.imperial,
  ...UNITS.volume.imperial,
  ...UNITS.length.imperial
]

// Units that should not be converted cross-system
const FIXED_UNITS = new Set<MeasurementUnit>(['teaspoons', 'tablespoons'])

const CONVERSION_FACTORS = {
  ounces_to_grams: 28.3495,
  pounds_to_kilograms: 0.45359237,
  teaspoons_to_milliliters: 4.92892,
  tablespoons_to_milliliters: 14.7868,
  cups_to_milliliters: 236.588,
  fluid_ounces_to_milliliters: 29.5735,
  gallons_to_liters: 3.78541,
  inches_to_centimeters: 2.54,
  feet_to_centimeters: 30.48
}

export const UNIT_DISPLAY_SINGULAR: Record<MeasurementUnit, string> = {
  grams: 'g',
  kilograms: 'kg',
  ounces: 'oz',
  pounds: 'lb',
  milliliters: 'ml',
  liters: 'L',
  teaspoons: 'tsp',
  tablespoons: 'tbsp',
  cups: 'cup',
  fluid_ounces: 'fl oz',
  gallons: 'gal',
  millimeters: 'mm',
  centimeters: 'cm',
  meters: 'm',
  inches: 'in',
  feet: 'ft',
  pieces: 'pc'
}

// Pluralize word-based units
function pluralize(unit: MeasurementUnit, qty: number): string {
  const pluralWords = new Set<MeasurementUnit>(['cups', 'gallons', 'pieces'])
  const base = UNIT_DISPLAY_SINGULAR[unit] ?? unit
  if (!pluralWords.has(unit)) return base
  return Math.abs(qty) === 1 ? base : `${base}s`
}

export const UNIT_EQUIVALENTS = {
  grams: { unit: 'ounces', factor: 1 / CONVERSION_FACTORS.ounces_to_grams },
  kilograms: { unit: 'pounds', factor: 1 / CONVERSION_FACTORS.pounds_to_kilograms },
  ounces: { unit: 'grams', factor: CONVERSION_FACTORS.ounces_to_grams },
  pounds: { unit: 'kilograms', factor: CONVERSION_FACTORS.pounds_to_kilograms },
  milliliters: { unit: 'fluid_ounces', factor: 1 / CONVERSION_FACTORS.fluid_ounces_to_milliliters },
  liters: { unit: 'gallons', factor: 1 / CONVERSION_FACTORS.gallons_to_liters },
  cups: { unit: 'milliliters', factor: CONVERSION_FACTORS.cups_to_milliliters },
  fluid_ounces: { unit: 'milliliters', factor: CONVERSION_FACTORS.fluid_ounces_to_milliliters },
  gallons: { unit: 'liters', factor: CONVERSION_FACTORS.gallons_to_liters },
  centimeters: { unit: 'inches', factor: 1 / CONVERSION_FACTORS.inches_to_centimeters },
  inches: { unit: 'centimeters', factor: CONVERSION_FACTORS.inches_to_centimeters },
  feet: { unit: 'centimeters', factor: CONVERSION_FACTORS.feet_to_centimeters }
} as const

/** --- Aliases for normalizing units --- **/
const UNIT_ALIASES: Record<string, MeasurementUnit> = {
  tsp: 'teaspoons', tspes: 'teaspoons', 'tsp.': 'teaspoons', tsps: 'teaspoons',
  tbsp: 'tablespoons', 'tbsp.': 'tablespoons', tbsps: 'tablespoons',
  cup: 'cups', cups: 'cups',
  oz: 'ounces', 'oz.': 'ounces', ounce: 'ounces', ounces: 'ounces',
  'fl oz': 'fluid_ounces', 'fl. oz': 'fluid_ounces', floz: 'fluid_ounces',
  ml: 'milliliters', millilitre: 'milliliters', millilitres: 'milliliters',
  l: 'liters', litre: 'liters', litres: 'liters',
  g: 'grams', gr: 'grams',
  kg: 'kilograms',
  in: 'inches', inch: 'inches', inches: 'inches',
  ft: 'feet', foot: 'feet', feet: 'feet',
  pc: 'pieces', pcs: 'pieces'
}

/** --- Helpers --- **/
function normalizeUnit(input: string): MeasurementUnit | undefined {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.]/g, '')
  if (UNIT_ALIASES[cleaned]) return UNIT_ALIASES[cleaned]
  for (const unit of measurementUnits) if (unit.toLowerCase() === cleaned) return unit
  for (const [unit, display] of Object.entries(UNIT_DISPLAY_SINGULAR)) {
    if (display.toLowerCase() === cleaned) return unit as MeasurementUnit
  }
  return undefined
}

function snapTo(value: number, target: number, pct = 0.05): number | undefined {
  return Math.abs(value - target) <= target * pct ? target : undefined
}

const GOOD_FRACTIONS = [1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 5 / 6, 7 / 8]
function snapToGoodFraction(x: number, tol = 0.02): number {
  const whole = Math.trunc(x)
  const dec = Math.abs(x - whole)
  for (const f of GOOD_FRACTIONS) {
    if (Math.abs(dec - f) < tol) return Math.sign(x) * (whole + f)
  }
  return x
}

/** --- Core Functions --- **/

export function scaleQuantity(quantity: number, current: number, original: number): number {
  if (original === 0) throw new Error('Cannot scale quantity: original servings cannot be zero')
  return quantity * (current / original)
}

export function convertToSystem(
  quantity: number,
  unit: MeasurementUnit,
  targetSystem: 'metric' | 'imperial'
): { quantity: number; unit: MeasurementUnit } {
  const normalizedUnit = normalizeUnit(unit as string)
  if (!normalizedUnit) return { quantity, unit }

  const isMetricUnit = METRIC_UNITS.includes(normalizedUnit)
  const isImperialUnit = IMPERIAL_UNITS.includes(normalizedUnit)

  if ((isMetricUnit && targetSystem === 'metric') || (isImperialUnit && targetSystem === 'imperial')) {
    return { quantity, unit: normalizedUnit }
  }
  if (FIXED_UNITS.has(normalizedUnit)) return { quantity, unit: normalizedUnit }

  // Special tolerant snaps
  if (normalizedUnit === 'milliliters' && targetSystem === 'imperial') {
    const cupMl = CONVERSION_FACTORS.cups_to_milliliters
    const snapped = snapTo(quantity, cupMl) ?? snapTo(quantity, 2 * cupMl)
    if (snapped) return { quantity: Math.round(snapped / cupMl), unit: 'cups' }
  }
  if (normalizedUnit === 'grams' && targetSystem === 'imperial') {
    const lbG = CONVERSION_FACTORS.pounds_to_kilograms * 1000
    if (snapTo(quantity, lbG)) return { quantity: 1, unit: 'pounds' }
    if (snapTo(quantity, lbG / 2)) return { quantity: 0.5, unit: 'pounds' }
    if (snapTo(quantity, CONVERSION_FACTORS.ounces_to_grams * 4)) return { quantity: 4, unit: 'ounces' }
  }

  const eq = UNIT_EQUIVALENTS[normalizedUnit as keyof typeof UNIT_EQUIVALENTS]
  return eq ? { quantity: quantity * eq.factor, unit: eq.unit } : { quantity, unit: normalizedUnit }
}

export function chooseDisplayUnit(
  quantity: number,
  unit: MeasurementUnit
): { quantity: number; unit: MeasurementUnit } {
  const normalizedUnit = normalizeUnit(unit as string)
  if (!normalizedUnit) return { quantity, unit }

  if (FIXED_UNITS.has(normalizedUnit)) return { quantity, unit: normalizedUnit }

  // Simple g→kg, ml→L, etc.
  if (normalizedUnit === 'grams' && quantity >= 1000) return { quantity: quantity / 1000, unit: 'kilograms' }
  if (normalizedUnit === 'kilograms' && quantity < 0.1) return { quantity: quantity * 1000, unit: 'grams' }
  if (normalizedUnit === 'milliliters' && quantity >= 1000) return { quantity: quantity / 1000, unit: 'liters' }
  if (normalizedUnit === 'liters' && quantity < 1) return { quantity: quantity * 1000, unit: 'milliliters' }
  return { quantity, unit: normalizedUnit }
}

export function formatQuantityForDisplay(quantity: number, useFractions = false): string {
  // negative/zero guard
  if (quantity <= 0) return '0'

  // trace
  if (quantity < 0.001) return 'trace'

  // If caller wants fractions, prefer them for “cook-sized” amounts (< 10).
  if (useFractions && quantity < 10) {
    return formatQuantityAsFraction(quantity, { useUnicode: true, maxDenominator: 8 })
  }

  // Otherwise keep your banded rounding behavior:
  if (quantity < 0.01) return quantity.toFixed(3).replace(/\.0+$/, '')
  if (quantity < 0.1) return quantity.toFixed(2).replace(/\.0+$/, '')
  if (quantity < 1) return (Math.round(quantity * 10) / 10).toFixed(1).replace(/\.0$/, '')
  if (quantity < 10) return (Math.round(quantity * 2) / 2).toFixed(1).replace(/\.0$/, '')
  if (quantity < 100) return Math.round(quantity).toString()
  return (Math.round(quantity / 5) * 5).toString()
}


export function formatIngredientDisplay(quantity: number, unit?: MeasurementUnit, useFractions = false): string {
  if (!unit) return formatQuantityForDisplay(quantity, useFractions)
  const { quantity: adjQty, unit: bestUnit } = chooseDisplayUnit(quantity, unit)
  return `${formatQuantityForDisplay(adjQty, useFractions)} ${pluralize(bestUnit as MeasurementUnit, adjQty)}`
}


export function parseQuantityToNumber(
  input: string | number | undefined,
  opts: { rangeMode?: 'avg' | 'first' | 'last'; clampNegative?: boolean } = {}
): number | undefined {
  const rangeMode = opts.rangeMode ?? 'avg'
  const clampNegative = opts.clampNegative ?? false

  // Numbers directly
  if (typeof input === 'number') {
    if (Number.isNaN(input)) return undefined
    return clampNegative ? Math.max(input, 0) : input
  }

  if (input == null) return undefined
  let s = String(input).trim()
  if (!s) return undefined

  // 1) Normalize unicode vulgar fractions to ASCII
  const UNICODE_FRAC: Record<string, string> = {
    '¼': '1/4', '½': '1/2', '¾': '3/4',
    '⅐': '1/7', '⅑': '1/9', '⅒': '1/10',
    '⅓': '1/3', '⅔': '2/3',
    '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5',
    '⅙': '1/6', '⅚': '5/6',
    '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8'
  }
  s = s.replace(/[\u00BC-\u00BE\u2150-\u215E]/g, ch => UNICODE_FRAC[ch] ?? ch)

  // 2) Decimal comma → dot when it’s digit,comma,digit
  //    "1,5" -> "1.5", "2,25" -> "2.25"
  s = s.replace(/(\d),(?=\d)/g, '$1.')

  // 3) Ranges: "1-3", "1 – 3", "1 to 3"
  const rangeMatch = s.match(/^\s*(.+?)\s*(?:-|–|to)\s*(.+?)\s*$/i)
  if (rangeMatch) {
    const a = parseQuantityToNumber(rangeMatch[1], { rangeMode, clampNegative })
    const b = parseQuantityToNumber(rangeMatch[2], { rangeMode, clampNegative })
    if (typeof a === 'number' && typeof b === 'number') {
      const val = rangeMode === 'first' ? a : rangeMode === 'last' ? b : (a + b) / 2
      return clampNegative ? Math.max(val, 0) : val
    }
    // If one side failed, fall through to single parse
  }

  // Helper: parse a single numeric token (fraction/mixed/decimal/int)
  function parseSingle(str: string): number | undefined {
    const t = str.trim()
    if (!t) return undefined

    // Pure fraction: "-?N/D"
    const fracOnly = t.match(/^\s*([-+])?\s*(\d+)\/(\d+)\s*$/)
    if (fracOnly) {
      const sign = fracOnly[1] === '-' ? -1 : 1
      const num = +fracOnly[2], den = +fracOnly[3]
      if (den === 0) return undefined
      const v = sign * (num / den)
      return clampNegative ? Math.max(v, 0) : v
    }

    // Mixed number: "-?W N/D"
    const mixed = t.match(/^\s*([-+])?\s*(\d+)\s+(\d+)\/(\d+)\s*$/)
    if (mixed) {
      const sign = mixed[1] === '-' ? -1 : 1
      const whole = +mixed[2], num = +mixed[3], den = +mixed[4]
      if (den === 0) return undefined
      const v = sign * (whole + num / den)
      return clampNegative ? Math.max(v, 0) : v
    }

    // Decimal or integer: "-?12.34" or ".5"
    const dec = t.match(/^\s*([-+])?(?:\d+(?:\.\d+)?|\.\d+)\s*$/)
    if (dec) {
      const v = parseFloat(t)
      if (Number.isNaN(v)) return undefined
      return clampNegative ? Math.max(v, 0) : v
    }

    // If string has words, find the first numeric-looking token anywhere
    // Order matters: mixed → fraction → decimal → integer
    const token = t.match(/([-+])?(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\.\d+|\d+)/)
    if (token) {
      return parseSingle(token[0])
    }

    return undefined
  }

  const val = parseSingle(s)
  return typeof val === 'number'
    ? (clampNegative ? Math.max(val, 0) : val)
    : undefined
}



// Converts a numeric quantity into a fraction string (mixed where needed).
// Uses Unicode glyphs when available (½ ⅓ ¼ ¾ ...), else falls back to "1/2".
function formatQuantityAsFraction(
  value: number,
  opts: { useUnicode?: boolean; maxDenominator?: number } = {}
): string {
  const useUnicode = opts.useUnicode ?? true
  const maxDenominator = BigInt(opts.maxDenominator ?? 8)

  if (value <= 0) return '0'

  // ✅ Snap decimals to nice culinary fractions first (⅛, ⅙, ¼, ⅓, ½, etc.)
  const snapped = snapToGoodFraction(value, 0.02)

  const frac = new Fraction(snapped)
  const whole = Math.floor(frac.valueOf())
  const remainder = frac.sub(whole)

  if (remainder.n === 0n) return `${whole}`

  // If denominator too hairy, fallback to rounded decimal
  if (remainder.d > maxDenominator) {
    return (Math.round(snapped * 100) / 100).toString().replace(/\.00$/, '')
  }

  const ascii = `${remainder.n}/${remainder.d}`

  if (!useUnicode) return whole === 0 ? ascii : `${whole} ${ascii}`

  const unicodeMap: Record<string, string> = {
    '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
    '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
    '1/6': '⅙', '5/6': '⅚',
    '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞'
  }

  const glyph = unicodeMap[ascii] ?? ascii
  return whole === 0 ? glyph : `${whole} ${glyph}`
}

/**
 * Parse a free-form ingredient line into name, quantity text, and normalized measurement.
 */
export function parseIngredientLine(input: string): { name: string; quantity?: string; measurement?: MeasurementUnit } {
  const original = (input || '').trim()
  if (!original) return { name: '' }

  let rest = original
  let quantityText: string | undefined

  const qtyMatch = rest.match(/^\s*([\d]+\s+[\d]+\/[\d]+|[\d]+\/[\d]+|[\u00BC-\u00BE\u2150-\u215E]|[\d]*\.?[\d]+(?:\s+[\d]+\/[\d]+)?|[\d]+(?:\s*-\s*[\d]+)?)/)
  if (qtyMatch) {
    const candidate = qtyMatch[1].trim()
    const numeric = parseQuantityToNumber(candidate)
    if (typeof numeric === 'number') {
      quantityText = candidate
      rest = rest.slice(qtyMatch[0].length).trim()
    }
  }

  let foundUnit: MeasurementUnit | undefined
  const tokens = rest.toLowerCase().replace(/[.]/g, '').split(/\s+/).filter(Boolean)
  for (let take = Math.min(3, tokens.length); take >= 1; take--) {
    const cand = tokens.slice(0, take).join(' ')
    const norm = normalizeUnit(cand)
    if (norm) {
      foundUnit = norm
      rest = rest.slice(cand.length).trim()
      break
    }
  }

  if (foundUnit) rest = rest.replace(/^of\s+/, '').trim()

  return { name: rest, quantity: quantityText, measurement: foundUnit }
}

export function getDisplayIngredient(
  ingredient: Ingredient,
  currentServings: number,
  originalServings: number,
  unitSystem: 'metric' | 'imperial'
): Ingredient & { displayMeasurementAndQuantity: string } {
  if (!ingredient.quantity?.numeric || isNaN(ingredient.quantity.numeric)) {
    const textPart = ingredient.quantity?.text?.trim()
    const unitPart = ingredient.measurement?.toString().trim()
    const fallback = [textPart, unitPart].filter(Boolean).join(' ')
    return { ...ingredient, displayMeasurementAndQuantity: fallback }
  }
  const scaled = scaleQuantity(ingredient.quantity.numeric, currentServings, originalServings)
  const useFractions = scaled < 10
  const converted = ingredient.measurement
    ? convertToSystem(scaled, ingredient.measurement as MeasurementUnit, unitSystem)
    : { quantity: scaled, unit: undefined }
  return {
    ...ingredient,
    displayMeasurementAndQuantity: converted.unit
      ? formatIngredientDisplay(converted.quantity, converted.unit, useFractions)
      : formatQuantityForDisplay(converted.quantity, useFractions)
  }
}
