export type MeasurementUnit = typeof measurementUnits[number]

export const measurementUnits = [
  // Weight measurements
  // Metric
  'grams',
  'kilograms',
  // Imperial
  'ounces',
  'pounds',
  
  // Volume measurements
  // Metric
  'milliliters',
  'liters',
  // Imperial
  'cups',
  'fluid_ounces',
  'gallons',
  
  // Length measurements
  // Metric
  'millimeters',
  'centimeters',
  'meters',
  // Imperial
  'inches',
  'feet',
  
  // Common units (no conversion needed)
  'teaspoons',
  'tablespoons',
  'pieces',
  'to taste',
  'pinch'
] as const

export type Ingredient = {
  quantity: number
  name: string
  measurement: MeasurementUnit
  custom: boolean
  [key: string]: unknown
}
