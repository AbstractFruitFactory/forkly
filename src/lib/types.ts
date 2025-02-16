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
  name: string
  quantity: number
  measurement: MeasurementUnit
}

export type Recipe = {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  createdAt: Date
  userId: string | null
}
