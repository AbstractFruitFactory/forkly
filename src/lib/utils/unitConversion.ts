import type { MeasurementUnit } from '$lib/types'
import { measurementUnits } from '$lib/types'
import Fraction from 'fraction.js'

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

const CONVERSION_FACTORS = {
  ounces_to_grams: 28.35,
  pounds_to_kilograms: 0.453592,
  teaspoons_to_milliliters: 4.93,
  tablespoons_to_milliliters: 14.79,
  cups_to_milliliters: 236.59,
  fluid_ounces_to_milliliters: 29.57,
  gallons_to_liters: 3.785,
  inches_to_centimeters: 2.54,
  feet_to_centimeters: 30.48
}


export const UNIT_DISPLAY_TEXT: Record<MeasurementUnit, string> = {
  grams: 'g',
  kilograms: 'kg',
  ounces: 'oz',
  pounds: 'lb',
  milliliters: 'ml',
  liters: 'L',
  teaspoons: 'tsp',
  tablespoons: 'tbsp',
  cups: 'cup(s)',
  fluid_ounces: 'fl oz',
  gallons: 'gal',
  millimeters: 'mm',
  centimeters: 'cm',
  meters: 'm',
  inches: 'in',
  feet: 'ft',
  pieces: 'pc'
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

// Add normalization function for user-entered units
const normalizeUnit = (input: string): MeasurementUnit | string => {
  const trimmed = input.trim().toLowerCase()
  // Try to match canonical unit keys
  for (const unit of measurementUnits) {
    if (unit.toLowerCase() === trimmed) return unit
  }
  // Try to match display text
  for (const [unit, display] of Object.entries(UNIT_DISPLAY_TEXT)) {
    if (display.toLowerCase() === trimmed) return unit as MeasurementUnit
  }
  return input
}

export const convertMeasurement = (
  quantity: number,
  fromUnit: MeasurementUnit,
  toSystem: 'metric' | 'imperial'
): { quantity: number; unit: MeasurementUnit } => {
  // Normalize user input unit
  const normalizedUnit = normalizeUnit(fromUnit as string) as MeasurementUnit
  // If the unit is not in our known units, return it as-is
  if (!measurementUnits.includes(normalizedUnit as any)) {
    return { quantity, unit: fromUnit }
  }
  const isMetricUnit = METRIC_UNITS.includes(normalizedUnit as string)
  const isImperialUnit = IMPERIAL_UNITS.includes(normalizedUnit as string)
  if ((isMetricUnit && toSystem === 'metric') || (isImperialUnit && toSystem === 'imperial')) {
    return { quantity, unit: normalizedUnit }
  }
  if (normalizedUnit === 'teaspoons' || normalizedUnit === 'tablespoons') {
    return { quantity, unit: normalizedUnit }
  }
  // Special handling for common recipe measurements
  if (normalizedUnit === 'milliliters' && toSystem === 'imperial') {
    if (quantity <= 5) {
      return { quantity: 1, unit: 'teaspoons' as MeasurementUnit }
    } else if (quantity <= 15) {
      return { quantity: 1, unit: 'tablespoons' as MeasurementUnit }
    } else if (quantity >= 230 && quantity <= 240) {
      return { quantity: 1, unit: 'cups' as MeasurementUnit }
    } else if (quantity >= 470 && quantity <= 480) {
      return { quantity: 2, unit: 'cups' as MeasurementUnit }
    }
  }
  if (normalizedUnit === 'grams' && toSystem === 'imperial') {
    if (quantity >= 450 && quantity <= 500) {
      return { quantity: 1, unit: 'pounds' as MeasurementUnit }
    } else if (quantity >= 225 && quantity <= 250) {
      return { quantity: 0.5, unit: 'pounds' as MeasurementUnit }
    } else if (quantity >= 110 && quantity <= 115) {
      return { quantity: 4, unit: 'ounces' as MeasurementUnit }
    }
  }
  const equivalent = UNIT_EQUIVALENTS[normalizedUnit as keyof typeof UNIT_EQUIVALENTS]
  if (!equivalent) {
    return { quantity, unit: normalizedUnit }
  }
  const convertedQuantity = quantity * equivalent.factor
  if (normalizedUnit === 'milliliters' && toSystem === 'imperial') {
    if (convertedQuantity < 0.1) {
      return {
        quantity: quantity / CONVERSION_FACTORS.teaspoons_to_milliliters,
        unit: 'teaspoons' as MeasurementUnit
      }
    }
  }
  if (normalizedUnit === 'liters' && toSystem === 'imperial') {
    if (convertedQuantity < 0.1) {
      return {
        quantity: quantity * 1000 / CONVERSION_FACTORS.fluid_ounces_to_milliliters,
        unit: 'fluid_ounces' as MeasurementUnit
      }
    }
  }
  return {
    quantity: convertedQuantity,
    unit: equivalent.unit as MeasurementUnit
  }
}

export const chooseBestUnit = (quantity: number, unit: MeasurementUnit): { quantity: number; unit: MeasurementUnit } => {
  const normalizedUnit = normalizeUnit(unit as string) as MeasurementUnit
  if (normalizedUnit === 'grams' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'kilograms' as MeasurementUnit }
  }
  if (normalizedUnit === 'kilograms' && quantity < 0.1) {
    return { quantity: quantity * 1000, unit: 'grams' as MeasurementUnit }
  }
  if (normalizedUnit === 'milliliters' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'liters' as MeasurementUnit }
  }
  if (normalizedUnit === 'liters' && quantity < 0.1) {
    return { quantity: quantity * 1000, unit: 'milliliters' as MeasurementUnit }
  }
  if (normalizedUnit === 'millimeters' && quantity >= 100) {
    return { quantity: quantity / 10, unit: 'centimeters' as MeasurementUnit }
  }
  if (normalizedUnit === 'centimeters' && quantity >= 100) {
    return { quantity: quantity / 100, unit: 'meters' as MeasurementUnit }
  }
  if (normalizedUnit === 'meters' && quantity < 0.1) {
    return { quantity: quantity * 100, unit: 'centimeters' as MeasurementUnit }
  }
  if (normalizedUnit === 'inches' && quantity >= 12) {
    return { quantity: quantity / 12, unit: 'feet' as MeasurementUnit }
  }
  if (normalizedUnit === 'feet' && quantity < 0.1) {
    return { quantity: quantity * 12, unit: 'inches' as MeasurementUnit }
  }
  if (normalizedUnit === 'gallons' && quantity < 0.1) {
    return { quantity: quantity * 128, unit: 'fluid_ounces' as MeasurementUnit }
  }
  if (normalizedUnit === 'fluid_ounces' && quantity < 1) {
    return { quantity: quantity * 6, unit: 'teaspoons' as MeasurementUnit }
  }
  return { quantity, unit: normalizedUnit }
}

// Helper to get the best numeric value from an ingredient object
export function getIngredientNumericQuantity(ingredient: { numericQuantity?: number; quantity?: number }): number | undefined {
  if (typeof ingredient.numericQuantity === 'number' && !isNaN(ingredient.numericQuantity)) return ingredient.numericQuantity;
  if (typeof ingredient.quantity === 'number' && !isNaN(ingredient.quantity)) return ingredient.quantity;
  return undefined;
}

export const formatMeasurement = (quantity: number, unit?: MeasurementUnit): string => {
  if (!unit) {
    return quantity.toString()
  }

  const { quantity: adjustedQuantity, unit: adjustedUnit } = chooseBestUnit(quantity, unit)

  // For custom units, use the unit as is
  const displayUnit = measurementUnits.includes(adjustedUnit as any) 
    ? UNIT_DISPLAY_TEXT[adjustedUnit as keyof typeof UNIT_DISPLAY_TEXT] 
    : adjustedUnit

  let formattedQuantity: string

  if (Number.isInteger(adjustedQuantity)) {
    formattedQuantity = adjustedQuantity.toString()
  } else {
    // More aggressive rounding for common measurements
    if (adjustedQuantity < 0.01) {
      if (adjustedQuantity < 0.001) {
        return `trace ${displayUnit}`
      }
      // Very small amounts
      formattedQuantity = adjustedQuantity.toFixed(3)
    } else if (adjustedQuantity < 0.1) {
      // Round to nearest 0.05 for small amounts
      formattedQuantity = (Math.round(adjustedQuantity * 20) / 20).toFixed(2).replace(/\.00$/, '')
    } else if (adjustedQuantity < 1) {
      // Round to nearest 0.1 for amounts less than 1
      formattedQuantity = (Math.round(adjustedQuantity * 10) / 10).toFixed(1).replace(/\.0$/, '')
    } else if (adjustedQuantity < 10) {
      // Round to nearest 0.5 for amounts between 1 and 10
      formattedQuantity = (Math.round(adjustedQuantity * 2) / 2).toFixed(1).replace(/\.0$/, '')
    } else if (adjustedQuantity < 100) {
      // Round to nearest whole number for amounts between 10 and 100
      formattedQuantity = Math.round(adjustedQuantity).toString()
    } else {
      // Round to nearest 5 for large amounts
      formattedQuantity = (Math.round(adjustedQuantity / 5) * 5).toString()
    }
  }

  return `${formattedQuantity} ${displayUnit}`
} 

// Helper to parse a quantity string to a number using fraction.js
export function parseQuantityToNumber(input: string | undefined): number | undefined {
  if (!input) return undefined
  try {
    const frac = new Fraction(input)
    return frac.valueOf()
  } catch (e) {
    const num = parseFloat(input)
    return isNaN(num) ? undefined : num
  }
} 

export function formatQuantity(value: number): string {
  const frac = new Fraction(value)
  const whole = Math.floor(frac.valueOf())
  const remainder = frac.sub(whole)

  // If the denominator is too large, just show a rounded decimal
  const maxDenominator = 8n
  if (remainder.n === 0n) {
    return `${whole}`
  } else if (whole === 0) {
    if (remainder.d > maxDenominator) {
      return value.toFixed(2).replace(/\.00$/, '')
    }
    return `${remainder.toFraction(false)}`
  } else {
    if (remainder.d > maxDenominator) {
      return value.toFixed(2).replace(/\.00$/, '')
    }
    return `${whole} ${remainder.toFraction(false)}`
  }
} 