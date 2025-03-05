import type { Ingredient } from '$lib/types'
import type { UnitSystem } from '$lib/state/unitPreference.svelte'
import {
  convertMeasurement,
  formatMeasurement,
  UNIT_DISPLAY_TEXT,
  UNITS
} from '$lib/utils/unitConversion'

/**
 * Formats an ingredient with the appropriate unit system
 */
export const getFormattedIngredient = (ingredient: Ingredient, unitSystem: UnitSystem) => {
  if (
    UNITS.other.includes(ingredient.measurement as string) ||
    ingredient.measurement === 'teaspoons' ||
    ingredient.measurement === 'tablespoons'
  ) {
    const displayUnit = UNIT_DISPLAY_TEXT[ingredient.measurement] || ingredient.measurement
    return {
      ...ingredient,
      displayQuantity: ingredient.quantity,
      displayUnit: ingredient.measurement,
      displayUnitText: displayUnit,
      formattedMeasurement: formatMeasurement(ingredient.quantity, ingredient.measurement)
    }
  }

  const { quantity, unit } = convertMeasurement(
    ingredient.quantity,
    ingredient.measurement,
    unitSystem
  )

  const displayUnit = UNIT_DISPLAY_TEXT[unit] || unit

  return {
    ...ingredient,
    displayQuantity: quantity,
    displayUnit: unit,
    displayUnitText: displayUnit,
    formattedMeasurement: formatMeasurement(quantity, unit)
  }
} 