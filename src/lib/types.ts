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
  'gluten-free',
  'dairy-free',
  'nut-free',
  'vegan',
  'vegetarian',
  'pescatarian'
] as const

export type DietType = typeof dietTypes[number]

export const dietColors: Record<DietType, string> = {
  'gluten-free': '#E57373',
  'dairy-free': '#64B5F6',
  'nut-free': '#FFB74D',
  'vegan': '#81C784',
  'vegetarian': '#4DB6AC',
  'pescatarian': '#7986CB'
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
  instructions: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }[]
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
  bookmarks: number
  isBookmarked?: boolean
}
