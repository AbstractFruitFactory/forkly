import type { MeasurementUnit } from '$lib/types'

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
  },
  other: ['pieces', 'to taste', 'pinch']
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
  pieces: 'pc',
  'to taste': 'to taste',
  pinch: 'pinch'
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

export const convertMeasurement = (
  quantity: number,
  fromUnit: MeasurementUnit,
  toSystem: 'metric' | 'imperial'
): { quantity: number; unit: MeasurementUnit } => {
  if (UNITS.other.includes(fromUnit as string)) {
    return { quantity, unit: fromUnit }
  }

  const isMetricUnit = METRIC_UNITS.includes(fromUnit as string)
  const isImperialUnit = IMPERIAL_UNITS.includes(fromUnit as string)

  if ((isMetricUnit && toSystem === 'metric') || (isImperialUnit && toSystem === 'imperial')) {
    return { quantity, unit: fromUnit }
  }

  if (fromUnit === 'teaspoons' || fromUnit === 'tablespoons') {
    return { quantity, unit: fromUnit }
  }

  const equivalent = UNIT_EQUIVALENTS[fromUnit as keyof typeof UNIT_EQUIVALENTS]
  if (!equivalent) {
    return { quantity, unit: fromUnit }
  }

  const convertedQuantity = quantity * equivalent.factor

  if (fromUnit === 'milliliters' && toSystem === 'imperial') {
    if (convertedQuantity < 0.1) {
      return {
        quantity: quantity / CONVERSION_FACTORS.teaspoons_to_milliliters,
        unit: 'teaspoons' as MeasurementUnit
      }
    }
  }

  if (fromUnit === 'liters' && toSystem === 'imperial') {
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
  if (unit === 'grams' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'kilograms' as MeasurementUnit }
  }
  if (unit === 'kilograms' && quantity < 0.1) {
    return { quantity: quantity * 1000, unit: 'grams' as MeasurementUnit }
  }
  if (unit === 'milliliters' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'liters' as MeasurementUnit }
  }
  if (unit === 'liters' && quantity < 0.1) {
    return { quantity: quantity * 1000, unit: 'milliliters' as MeasurementUnit }
  }
  if (unit === 'millimeters' && quantity >= 100) {
    return { quantity: quantity / 10, unit: 'centimeters' as MeasurementUnit }
  }
  if (unit === 'centimeters' && quantity >= 100) {
    return { quantity: quantity / 100, unit: 'meters' as MeasurementUnit }
  }
  if (unit === 'meters' && quantity < 0.1) {
    return { quantity: quantity * 100, unit: 'centimeters' as MeasurementUnit }
  }
  if (unit === 'inches' && quantity >= 12) {
    return { quantity: quantity / 12, unit: 'feet' as MeasurementUnit }
  }
  if (unit === 'feet' && quantity < 0.1) {
    return { quantity: quantity * 12, unit: 'inches' as MeasurementUnit }
  }

  // Handle small volumes in imperial units - prefer smaller units for better readability
  if (unit === 'gallons' && quantity < 0.1) {
    // Convert to fluid ounces for very small amounts
    return { quantity: quantity * 128, unit: 'fluid_ounces' as MeasurementUnit }
  }
  if (unit === 'fluid_ounces' && quantity < 1) {
    // For very small fluid ounces, convert to teaspoons
    return { quantity: quantity * 6, unit: 'teaspoons' as MeasurementUnit }
  }

  return { quantity, unit }
}

export const formatMeasurement = (quantity: number, unit: MeasurementUnit): string => {
  const { quantity: adjustedQuantity, unit: adjustedUnit } = chooseBestUnit(quantity, unit)

  const displayUnit = UNIT_DISPLAY_TEXT[adjustedUnit] || adjustedUnit

  let formattedQuantity: string

  if (Number.isInteger(adjustedQuantity)) {
    formattedQuantity = adjustedQuantity.toString()
  } else if (adjustedQuantity < 0.01) {
    if (adjustedQuantity < 0.001) {
      return `trace ${displayUnit}`
    }
    formattedQuantity = adjustedQuantity.toFixed(3)
  } else if (adjustedQuantity < 0.1) {
    formattedQuantity = adjustedQuantity.toFixed(2)
  } else if (adjustedQuantity < 1) {
    formattedQuantity = adjustedQuantity.toFixed(1)
  } else if (adjustedQuantity < 10) {
    formattedQuantity = adjustedQuantity.toFixed(1).replace(/\.0$/, '')
  } else {
    formattedQuantity = Math.round(adjustedQuantity).toString()
  }

  return `${formattedQuantity} ${displayUnit}`
} 