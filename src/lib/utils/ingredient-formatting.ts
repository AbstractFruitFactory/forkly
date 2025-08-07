import type { MeasurementUnit } from '$lib/types'
import { measurementUnits } from '$lib/types'
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

const GOOD_FRACTIONS = [1/8, 1/6, 1/5, 1/4, 1/3, 1/2, 2/3, 3/4, 5/6, 7/8]
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
  if (quantity <= 0) return '0'
  if (useFractions) quantity = snapToGoodFraction(quantity)

  if (quantity < 0.001) return 'trace'
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

export function getDisplayIngredient(
  ingredient: { quantity?: { numeric?: number; text?: string }, measurement?: string },
  currentServings: number,
  originalServings: number,
  unitSystem: 'metric' | 'imperial'
) {
  if (!ingredient.quantity?.numeric || isNaN(ingredient.quantity.numeric)) {
    return { ...ingredient, displayMeasurementAndQuantity: ingredient.measurement || '' }
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
