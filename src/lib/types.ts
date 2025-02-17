export type MeasurementUnit = typeof measurementUnits[number]

export const measurementUnits = [
  'cups',
  'tablespoons',
  'teaspoons',
  'ounces',
  'pounds',
  'grams',
  'milliliters',
  'pieces',
  'to taste',
  'pinch',
  'kilograms',
  'liters'
] as const

export type Ingredient = {
  quantity: number
  name: string
  measurement: MeasurementUnit
  [key: string]: unknown
}
