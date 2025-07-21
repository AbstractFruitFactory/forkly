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

export type MeasurementUnit = typeof measurementUnits[number]

export const defaultMeasurementUnits = measurementUnits

// A tag can be any string less than 15 characters
export const isValidTag = (tag: string): boolean => {
  return typeof tag === 'string' && tag.length > 0 && tag.length < 15
}

export type Ingredient = {
  quantity?: number
  measurement?: MeasurementUnit
  name: string
  displayName: string
}

export type InstructionIngredient = {
  quantity?: number
  measurement?: MeasurementUnit
  name: string
  displayName: string
}

export type Instruction = {
  id: string
  text: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  ingredients?: InstructionIngredient[]
}

export type RecipeData = {
  id: string
  userId?: string
  title: string
  description?: string
  servings: number
  ingredients: Ingredient[]
  instructions: Instruction[]
  imageUrl?: string | null
  tags?: string[]
  totalNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: string
  likes: number
  isLiked: boolean
  isSaved: boolean
  user?: {
    username?: string
    avatarUrl?: string
  }
}
