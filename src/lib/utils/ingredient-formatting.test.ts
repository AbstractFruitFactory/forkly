import { describe, it, expect } from 'vitest'
import { 
  scaleQuantity, 
  convertToSystem, 
  formatQuantityForDisplay, 
  formatIngredientDisplay,
  getDisplayIngredient 
} from './ingredient-formatting'

describe('Ingredient Formatting Pipeline', () => {
  describe('scaleQuantity', () => {
    it('should scale quantity correctly', () => {
      expect(scaleQuantity(2, 4, 2)).toBe(4)
      expect(scaleQuantity(1, 6, 3)).toBe(2)
      expect(scaleQuantity(0.5, 2, 4)).toBe(0.25)
    })

    it('should handle no scaling (same servings)', () => {
      expect(scaleQuantity(2, 2, 2)).toBe(2)
      expect(scaleQuantity(1.5, 4, 4)).toBe(1.5)
    })

    it('should handle negative quantities', () => {
      expect(scaleQuantity(-1, 4, 2)).toBe(-2)
      expect(scaleQuantity(-0.5, 6, 3)).toBe(-1)
    })

    it('should handle zero original servings', () => {
      expect(() => scaleQuantity(1, 4, 0)).toThrow()
    })

    it('should handle zero current servings', () => {
      expect(scaleQuantity(1, 0, 2)).toBe(0)
    })

    it('should handle fractional scaling', () => {
      expect(scaleQuantity(3, 1, 3)).toBe(1)
      expect(scaleQuantity(2, 1, 4)).toBe(0.5)
    })
  })

  describe('convertToSystem', () => {
    it('should convert metric to imperial', () => {
      const result = convertToSystem(100, 'grams', 'imperial')
      expect(result.unit).toBe('ounces')
      expect(result.quantity).toBeCloseTo(3.53, 2)
    })

    it('should keep imperial units when target is imperial', () => {
      const result = convertToSystem(16, 'ounces', 'imperial')
      expect(result.unit).toBe('ounces')
      expect(result.quantity).toBe(16)
    })

    it('should convert imperial to metric', () => {
      const result = convertToSystem(1, 'pounds', 'metric')
      expect(result.unit).toBe('kilograms')
      expect(result.quantity).toBeCloseTo(0.45, 2)
    })

    it('should handle metric volume to imperial conversion', () => {
      const result = convertToSystem(236.59, 'milliliters', 'imperial')
      expect(result.unit).toBe('cups')
      expect(result.quantity).toBeCloseTo(1, 2)
    })

    it('should handle non-standard units (return as-is)', () => {
      const result = convertToSystem(5, 'handfuls' as any, 'imperial')
      expect(result).toEqual({ quantity: 5, unit: 'handfuls' })
    })

    it('should handle empty unit input', () => {
      const result = convertToSystem(10, '' as any, 'metric')
      expect(result).toEqual({ quantity: 10, unit: '' })
    })

    it('should handle unknown units', () => {
      const result = convertToSystem(3, 'blorps' as any, 'imperial')
      expect(result).toEqual({ quantity: 3, unit: 'blorps' })
    })

    it('should handle teaspoons and tablespoons (no conversion)', () => {
      const tspResult = convertToSystem(2, 'teaspoons', 'metric')
      expect(tspResult).toEqual({ quantity: 2, unit: 'teaspoons' })
      
      const tbspResult = convertToSystem(1, 'tablespoons', 'imperial')
      expect(tbspResult).toEqual({ quantity: 1, unit: 'tablespoons' })
    })
  })

  describe('formatQuantityForDisplay', () => {
    it('should format whole numbers', () => {
      expect(formatQuantityForDisplay(5)).toBe('5')
      expect(formatQuantityForDisplay(0)).toBe('0')
    })

    it('should format small decimals', () => {
      expect(formatQuantityForDisplay(0.05)).toBe('0.05')
      expect(formatQuantityForDisplay(0.01)).toBe('0.01')
    })

    it('should format medium decimals', () => {
      expect(formatQuantityForDisplay(1.5)).toBe('1.5')
      expect(formatQuantityForDisplay(0.5)).toBe('0.5')
    })

    it('should handle trace amounts', () => {
      expect(formatQuantityForDisplay(0.0005)).toBe('trace')
      expect(formatQuantityForDisplay(0.001)).toBe('0.001')
    })

    it('should handle edge values around rounding thresholds', () => {
      expect(formatQuantityForDisplay(0.009)).toBe('0.009')
      expect(formatQuantityForDisplay(0.011)).toBe('0.01')
      expect(formatQuantityForDisplay(0.99)).toBe('1')
      expect(formatQuantityForDisplay(1.01)).toBe('1')
    })

    it('should handle large quantity rounding', () => {
      expect(formatQuantityForDisplay(123)).toBe('125')
      expect(formatQuantityForDisplay(127)).toBe('125')
      expect(formatQuantityForDisplay(128)).toBe('130')
    })

    it('should handle negative quantities', () => {
      expect(formatQuantityForDisplay(-1)).toBe('-1')
      expect(formatQuantityForDisplay(-0.5)).toBe('-0.5')
    })
  })

  describe('formatIngredientDisplay', () => {
    it('should format quantity with unit', () => {
      expect(formatIngredientDisplay(2, 'cups')).toBe('2 cup(s)')
      expect(formatIngredientDisplay(1.5, 'teaspoons')).toBe('1.5 tsp')
    })

    it('should format quantity without unit', () => {
      expect(formatIngredientDisplay(3)).toBe('3')
      expect(formatIngredientDisplay(0.5)).toBe('0.5')
    })

    it('should handle small quantity + unit with unit abbreviation', () => {
      expect(formatIngredientDisplay(0.5, 'liters')).toMatch(/ml|milliliters/i)
    })

    it('should handle edge rounding and display unit switch', () => {
      expect(formatIngredientDisplay(1000, 'milliliters')).toBe('1 L')
      expect(formatIngredientDisplay(999, 'milliliters')).toMatch(/ml/i)
    })

    it('should handle unknown unit fallback', () => {
      expect(formatIngredientDisplay(1, 'blorps' as any)).toBe('1 blorps')
      expect(formatIngredientDisplay(2.5, 'handfuls' as any)).toBe('2.5 handfuls')
    })

    it('should handle trace amounts with units', () => {
      expect(formatIngredientDisplay(0.0005, 'grams')).toMatch(/^trace/)
    })
  })

  describe('getDisplayIngredient', () => {
    it('should handle numeric quantity with measurement', () => {
      const ingredient = {
        quantity: { numeric: 2, text: '2' },
        measurement: 'cups',
        displayName: 'Flour'
      }
      
      const result = getDisplayIngredient(ingredient, 4, 2, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('4 cup(s)')
    })

    it('should handle text quantity with measurement', () => {
      const ingredient = {
        quantity: { text: 'some' },
        measurement: 'cups',
        displayName: 'Flour'
      }
      
      const result = getDisplayIngredient(ingredient, 4, 2, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('some cups')
    })

    it('should handle quantity without measurement', () => {
      const ingredient = {
        quantity: { numeric: 3, text: '3' },
        displayName: 'Eggs'
      }
      
      const result = getDisplayIngredient(ingredient, 4, 2, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('6')
    })

    it('should handle measurement without quantity', () => {
      const ingredient = {
        measurement: 'cups',
        displayName: 'Flour'
      }
      
      const result = getDisplayIngredient(ingredient, 4, 2, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('cups')
    })

    it('should handle fractional quantity input', () => {
      const ingredient = {
        quantity: { numeric: 0.5, text: '1/2' },
        measurement: 'cups',
        displayName: 'Milk'
      }
      
      const result = getDisplayIngredient(ingredient, 2, 1, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('1 cup(s)')
    })

    it('should handle tiny quantity with known unit → trace detection', () => {
      const ingredient = {
        quantity: { numeric: 0.0005, text: '0.0005' },
        measurement: 'grams',
        displayName: 'Saffron'
      }
      
      const result = getDisplayIngredient(ingredient, 1, 1, 'metric')
      expect(result.displayMeasurementAndQuantity).toMatch(/^trace/)
    })

    it('should handle unit switch after scaling (e.g. g → kg)', () => {
      const ingredient = {
        quantity: { numeric: 1500, text: '1500' },
        measurement: 'grams',
        displayName: 'Sugar'
      }
      
      const result = getDisplayIngredient(ingredient, 1, 1, 'metric')
      expect(result.displayMeasurementAndQuantity).toMatch(/1\.5 kg/)
    })

    it('should handle missing quantity and unit (should display nothing)', () => {
      const ingredient = { displayName: 'Water' }
      
      const result = getDisplayIngredient(ingredient, 1, 1, 'metric')
      expect(result.displayMeasurementAndQuantity).toBe('')
    })

    it('should handle NaN numeric quantity', () => {
      const ingredient = {
        quantity: { numeric: NaN, text: 'some' },
        measurement: 'cups',
        displayName: 'Flour'
      }
      
      const result = getDisplayIngredient(ingredient, 1, 1, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('some cups')
    })

    it('should handle undefined numeric quantity', () => {
      const ingredient = {
        quantity: { text: 'to taste' },
        measurement: 'salt',
        displayName: 'Salt'
      }
      
      const result = getDisplayIngredient(ingredient, 1, 1, 'imperial')
      expect(result.displayMeasurementAndQuantity).toBe('to taste salt')
    })
  })

  describe('Real-world edge cases', () => {
    it('should handle common user input patterns', () => {
      const testCases = [
        {
          ingredient: { quantity: { text: '1/2' }, measurement: 'cups', displayName: 'Milk' },
          expected: '1/2 cups'
        },
        {
          ingredient: { quantity: { text: '½' }, measurement: 'cups', displayName: 'Milk' },
          expected: '½ cups'
        },
        {
          ingredient: { quantity: { text: 'to taste' }, displayName: 'Salt' },
          expected: 'to taste'
        },
        {
          ingredient: { quantity: { text: 'some' }, measurement: 'cups', displayName: 'Flour' },
          expected: 'some cups'
        },
        {
          ingredient: { quantity: { text: 'g' }, measurement: 'flour', displayName: 'Flour' },
          expected: 'g flour'
        },
        {
          ingredient: { quantity: { text: 'ml' }, measurement: 'water', displayName: 'Water' },
          expected: 'ml water'
        }
      ]

      testCases.forEach(({ ingredient, expected }) => {
        const result = getDisplayIngredient(ingredient, 1, 1, 'imperial')
        expect(result.displayMeasurementAndQuantity).toBe(expected)
      })
    })

    it('should handle empty strings and nulls', () => {
      const testCases = [
        { ingredient: { measurement: '', displayName: 'Water' }, expected: '' }
      ]

      testCases.forEach(({ ingredient, expected }) => {
        const result = getDisplayIngredient(ingredient, 1, 1, 'imperial')
        expect(result.displayMeasurementAndQuantity).toBe(expected)
      })
    })

    it('should handle extreme scaling scenarios', () => {
      const ingredient = {
        quantity: { numeric: 0.001, text: '0.001' },
        measurement: 'grams',
        displayName: 'Saffron'
      }
      
      const result = getDisplayIngredient(ingredient, 1000, 1, 'metric')
      expect(result.displayMeasurementAndQuantity).toMatch(/1 g|1\.0 g/)
    })
  })
}) 