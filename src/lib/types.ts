export type MeasurementUnit = string

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

export const defaultMeasurementUnits = measurementUnits

// A tag can be any string less than 10 characters
export const isValidTag = (tag: string): boolean => {
  return typeof tag === 'string' && tag.length > 0 && tag.length < 10;
}

type BaseIngredient = {
  quantity: number
  measurement: MeasurementUnit
  name: string
}

type CustomIngredient = BaseIngredient & {
  custom: true
}

type LookupIngredient = BaseIngredient & {
  custom: false
}

export type Ingredient = CustomIngredient | LookupIngredient

export type RecipeData = {
  id: string
  userId?: string
  title: string
  description?: string
  servings: number
  ingredients: Ingredient[]
  instructions: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }[]
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
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
  isSaved: boolean
  user?: {
    username?: string
    avatarUrl?: string
  }
}
