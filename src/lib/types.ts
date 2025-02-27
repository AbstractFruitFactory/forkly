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

export const dietTypes = [
  // Allergen-related diets
  'gluten-free',
  'dairy-free',
  'nut-free',
  // Lifestyle diets
  'vegan',
  'vegetarian',
  'pescatarian'
] as const

export type DietType = typeof dietTypes[number]

// Color mapping for diet types
export const dietColors: Record<DietType, string> = {
  'gluten-free': '#E57373', // Light red
  'dairy-free': '#64B5F6', // Light blue
  'nut-free': '#FFB74D', // Light orange
  'vegan': '#81C784', // Light green
  'vegetarian': '#4DB6AC', // Light teal
  'pescatarian': '#7986CB' // Light indigo
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
  title: string
  description?: string
  ingredients: Ingredient[]
  instructions: string[]
  imageUrl?: string | null
  diets?: DietType[]
  totalNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  likes: number
  isLiked?: boolean
}
