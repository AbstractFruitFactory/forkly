import { describe, it, expect } from 'vitest'
import {
  scaleQuantity,
  convertToSystem,
  formatQuantityForDisplay,
  formatIngredientDisplay,
  getDisplayIngredient,
  parseQuantityToNumber
} from './ingredient-formatting'

// NOTE ON BEHAVIOR CHANGES:
// - Negative quantities are clamped to "0" in display.
// - Text-only quantities (no numeric) return just the measurement (e.g., "cups"), not "some cups".
// - Pluralization: "cup" vs "cups" based on qty; symbol units ("g", "ml", "oz", "lb") are invariant.
// - Tolerant snapping: ~236.6 ml → 1 cup, ~453.6 g → 1 lb, etc.
// - Fixed units (tsp/tbsp) never cross-convert between systems.

describe('Ingredient Formatting Pipeline', () => {
  describe('scaleQuantity', () => {
    it('scales quantity correctly', () => {
      expect(scaleQuantity(2, 4, 2)).toBe(4)
      expect(scaleQuantity(1, 6, 3)).toBe(2)
      expect(scaleQuantity(0.5, 2, 4)).toBe(0.25)
    })

    it('handles no scaling (same servings)', () => {
      expect(scaleQuantity(2, 2, 2)).toBe(2)
      expect(scaleQuantity(1.5, 4, 4)).toBe(1.5)
    })

    it('handles negative quantities (math-only, not display)', () => {
      expect(scaleQuantity(-1, 4, 2)).toBe(-2)
      expect(scaleQuantity(-0.5, 6, 3)).toBe(-1)
    })

    it('throws on zero original servings', () => {
      expect(() => scaleQuantity(1, 4, 0)).toThrow()
    })

    it('handles zero current servings', () => {
      expect(scaleQuantity(1, 0, 2)).toBe(0)
    })

    it('handles fractional scaling', () => {
      expect(scaleQuantity(3, 1, 3)).toBe(1)
      expect(scaleQuantity(2, 1, 4)).toBe(0.5)
    })
  })

  describe('convertToSystem', () => {
    it('converts metric to imperial (grams → ounces)', () => {
      const r = convertToSystem(100, 'grams' as any, 'imperial')
      expect(r.unit).toBe('ounces')
      expect(r.quantity).toBeCloseTo(3.527, 3)
    })

    it('keeps imperial when target is imperial', () => {
      const r = convertToSystem(16, 'ounces' as any, 'imperial')
      expect(r.unit).toBe('ounces')
      expect(r.quantity).toBe(16)
    })

    it('converts imperial to metric (pounds → kilograms)', () => {
      const r = convertToSystem(1, 'pounds' as any, 'metric')
      expect(r.unit).toBe('kilograms')
      expect(r.quantity).toBeCloseTo(0.453592, 6)
    })

    it('snaps milliliters near 1 cup to cups (tolerance)', () => {
      const r = convertToSystem(233, 'milliliters' as any, 'imperial') // within ~5% of 236.588
      expect(r.unit).toBe('cups')
      expect(r.quantity).toBe(1)
    })

    it('snaps grams near 1 lb to pounds (tolerance)', () => {
      const r = convertToSystem(450, 'grams' as any, 'imperial') // near 453.592
      expect(r.unit).toBe('pounds')
      expect(r.quantity).toBe(1)
    })

    it('does not convert fixed small units (tsp/tbsp) across systems', () => {
      const tsp = convertToSystem(2, 'teaspoons' as any, 'metric')
      expect(tsp).toEqual({ quantity: 2, unit: 'teaspoons' })

      const tbsp = convertToSystem(1, 'tablespoons' as any, 'imperial')
      expect(tbsp).toEqual({ quantity: 1, unit: 'tablespoons' })
    })

    it('handles unknown/non-standard units as-is', () => {
      const r = convertToSystem(5, 'handfuls' as any, 'imperial')
      expect(r).toEqual({ quantity: 5, unit: 'handfuls' })
    })

    it('handles empty unit input', () => {
      const r = convertToSystem(10, '' as any, 'metric')
      expect(r).toEqual({ quantity: 10, unit: '' as any })
    })

    it('normalizes common aliases (tsp., TBSP, fl. oz, ml, g)', () => {
      expect(convertToSystem(1, 'tsp.' as any, 'metric').unit).toBe('teaspoons')
      expect(convertToSystem(1, 'TBSP' as any, 'imperial').unit).toBe('tablespoons')
      expect(convertToSystem(2, 'fl. oz' as any, 'metric').unit).toBe('milliliters')
      expect(convertToSystem(10, 'ml' as any, 'imperial').unit).toBe('fluid_ounces')
      expect(convertToSystem(10, 'g' as any, 'imperial').unit).toBe('ounces')
    })
  })

  describe('formatQuantityForDisplay', () => {
    it('formats whole numbers', () => {
      expect(formatQuantityForDisplay(5)).toBe('5')
      expect(formatQuantityForDisplay(0)).toBe('0')
    })

    it('formats small decimals', () => {
      expect(formatQuantityForDisplay(0.05)).toBe('0.05')
      expect(formatQuantityForDisplay(0.01)).toBe('0.01')
    })

    it('formats medium decimals with banded rounding', () => {
      expect(formatQuantityForDisplay(1.5)).toBe('1.5')
      expect(formatQuantityForDisplay(0.5)).toBe('0.5')
    })

    it('handles trace amounts', () => {
      expect(formatQuantityForDisplay(0.0005)).toBe('trace')
      expect(formatQuantityForDisplay(0.001)).toBe('0.001')
    })

    it('handles band edges', () => {
      expect(formatQuantityForDisplay(0.009)).toBe('0.009')
      expect(formatQuantityForDisplay(0.011)).toBe('0.01')
      expect(formatQuantityForDisplay(0.99)).toBe('1')
      expect(formatQuantityForDisplay(1.01)).toBe('1') // rounds to nearest 0.5 (1.0)
    })

    it('rounds large quantities to nearest 5', () => {
      expect(formatQuantityForDisplay(123)).toBe('125')
      expect(formatQuantityForDisplay(127)).toBe('125')
      expect(formatQuantityForDisplay(128)).toBe('130')
    })

    it('clamps negative quantities to 0 for display', () => {
      expect(formatQuantityForDisplay(-1)).toBe('0')
      expect(formatQuantityForDisplay(-0.5)).toBe('0')
    })

    it('respects useFractions flag (snaps to good fractions before band rounding)', () => {
      // ~1.33 snaps to ~1⅓ but banded rounding still outputs one-decimal step (nearest 0.5) = "1.5"
      expect(formatQuantityForDisplay(1.333, true)).toMatch(/^1 (⅓|1\/3)$/)
      // ~0.666 snaps close to 2/3; under 1 it rounds to nearest 0.1
      expect(formatQuantityForDisplay(0.666, true)).toMatch(/^(⅔|2\/3)$/)
    })
  })

  describe('formatIngredientDisplay', () => {
    it('formats quantity with pluralization for word units', () => {
      expect(formatIngredientDisplay(1, 'cups' as any)).toBe('1 cup')
      expect(formatIngredientDisplay(2, 'cups' as any)).toBe('2 cups')
    })

    it('keeps symbol-style units invariant', () => {
      expect(formatIngredientDisplay(2, 'pounds' as any)).toBe('2 lb') // "lb" remains invariant
      expect(formatIngredientDisplay(3, 'ounces' as any)).toBe('3 oz')
    })

    it('formats quantity without unit', () => {
      expect(formatIngredientDisplay(3)).toBe('3')
      expect(formatIngredientDisplay(0.5)).toBe('0.5')
    })

    it('switches ml → L for large volumes', () => {
      expect(formatIngredientDisplay(1000, 'milliliters' as any)).toBe('1 L')
      const near = formatIngredientDisplay(999, 'milliliters' as any)
      expect(near.toLowerCase()).toMatch(/ml/)
    })

    it('handles trace with units', () => {
      const r = formatIngredientDisplay(0.0005, 'grams' as any)
      expect(r.startsWith('trace')).toBe(true)
    })
  })

  describe('getDisplayIngredient', () => {
    it('handles numeric quantity with measurement + scaling', () => {
      const ingredient = { quantity: { numeric: 2, text: '2' }, measurement: 'cups', displayName: 'Flour' }
      const r = getDisplayIngredient(ingredient as any, 4, 2, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('4 cups')
    })

    it('handles text-only quantity by returning measurement only (behavior change)', () => {
      const ingredient = { quantity: { text: 'some' }, measurement: 'cups', displayName: 'Flour' }
      const r = getDisplayIngredient(ingredient as any, 4, 2, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('cups')
    })

    it('handles quantity without measurement', () => {
      const ingredient = { quantity: { numeric: 3, text: '3' }, displayName: 'Eggs' }
      const r = getDisplayIngredient(ingredient as any, 4, 2, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('6')
    })

    it('handles measurement without quantity', () => {
      const ingredient = { measurement: 'cups', displayName: 'Flour' }
      const r = getDisplayIngredient(ingredient as any, 4, 2, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('cups')
    })

    it('handles fractional numeric input with scaling', () => {
      const ingredient = { quantity: { numeric: 0.5, text: '1/2' }, measurement: 'cups', displayName: 'Milk' }
      const r = getDisplayIngredient(ingredient as any, 2, 1, 'imperial')
      // 0.5 * 2 = 1 → pluralization uses singular "cup"
      expect(r.displayMeasurementAndQuantity).toBe('1 cup')
    })

    it('handles tiny quantity → trace', () => {
      const ingredient = { quantity: { numeric: 0.0005, text: '0.0005' }, measurement: 'grams', displayName: 'Saffron' }
      const r = getDisplayIngredient(ingredient as any, 1, 1, 'metric')
      expect(r.displayMeasurementAndQuantity.startsWith('trace')).toBe(true)
    })

    it('handles unit switch after display conversion (e.g., 1500 g → 1.5 kg)', () => {
      const ingredient = { quantity: { numeric: 1500, text: '1500' }, measurement: 'grams', displayName: 'Sugar' }
      const r = getDisplayIngredient(ingredient as any, 1, 1, 'metric')
      expect(r.displayMeasurementAndQuantity).toMatch(/1\.5 kg/)
    })

    it('handles missing quantity and unit (displays empty)', () => {
      const ingredient = { displayName: 'Water' }
      const r = getDisplayIngredient(ingredient as any, 1, 1, 'metric')
      expect(r.displayMeasurementAndQuantity).toBe('')
    })

    it('handles NaN numeric quantity by falling back to measurement only', () => {
      const ingredient = { quantity: { numeric: NaN, text: 'some' }, measurement: 'cups', displayName: 'Flour' }
      const r = getDisplayIngredient(ingredient as any, 1, 1, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('cups')
    })

    it('handles undefined numeric quantity with arbitrary measurement', () => {
      const ingredient = { quantity: { text: 'to taste' }, measurement: 'salt', displayName: 'Salt' }
      const r = getDisplayIngredient(ingredient as any, 1, 1, 'imperial')
      expect(r.displayMeasurementAndQuantity).toBe('salt')
    })
  })

  describe('Real-world alias & snapping edge cases', () => {
    it('normalizes alias units', () => {
      const cupSingular = convertToSystem(2, 'cup' as any, 'imperial')
      expect(cupSingular.unit).toBe('cups')

      const tspDot = convertToSystem(1, 'tsp.' as any, 'metric')
      expect(tspDot.unit).toBe('teaspoons')

      const tbspCaps = convertToSystem(1, 'TBSP' as any, 'imperial')
      expect(tbspCaps.unit).toBe('tablespoons')
    })

    it('snaps 470–480 ml to ~2 cups in imperial', () => {
      const r1 = convertToSystem(470, 'milliliters' as any, 'imperial')
      const r2 = convertToSystem(480, 'milliliters' as any, 'imperial')
      expect(r1.unit).toBe('cups')
      expect(r1.quantity).toBe(2)
      expect(r2.unit).toBe('cups')
      expect(r2.quantity).toBe(2)
    })

    it('leaves tablespoons as tablespoons when switching systems', () => {
      const r = convertToSystem(3, 'tbsp' as any, 'metric')
      expect(r.unit).toBe('tablespoons')
      expect(r.quantity).toBe(3)
    })
  })

  describe('parseQuantityToNumber', () => {
    it('parses simple decimals and integers', () => {
      expect(parseQuantityToNumber('2')).toBe(2)
      expect(parseQuantityToNumber('2.5')).toBe(2.5)
    })

    it('parses fractions and mixed numbers', () => {
      expect(parseQuantityToNumber('1/2')).toBe(0.5)
      expect(parseQuantityToNumber('2 1/2')).toBe(2.5)
    })

    it('parses unicode fractions', () => {
      expect(parseQuantityToNumber('½')).toBe(0.5)
      expect(parseQuantityToNumber('1 ⅓')).toBeCloseTo(1 + 1 / 3, 5)
      expect(parseQuantityToNumber('¾ cup')).toBe(0.75)
    })

    it('parses decimal comma', () => {
      expect(parseQuantityToNumber('1,5')).toBe(1.5)
      expect(parseQuantityToNumber('2,25')).toBe(2.25)
    })

    it('ignores trailing units/words', () => {
      expect(parseQuantityToNumber('2 tbsp')).toBe(2)
      expect(parseQuantityToNumber('about 3 cups')).toBe(3)
    })

    it('handles ranges with avg/first/last', () => {
      expect(parseQuantityToNumber('1-3')).toBe(2) // default avg
      expect(parseQuantityToNumber('1–3')).toBe(2) // en dash
    })

    it('handles leading dot and negatives', () => {
      expect(parseQuantityToNumber('.5')).toBe(0.5)
      expect(parseQuantityToNumber('-1/4')).toBe(-0.25)
      expect(parseQuantityToNumber('-1/4', { clampNegative: true })).toBe(0)
    })

    it('returns undefined on junk', () => {
      expect(parseQuantityToNumber('a bunch')).toBeUndefined()
      expect(parseQuantityToNumber('')).toBeUndefined()
    })

    it('accepts numbers directly', () => {
      expect(parseQuantityToNumber(2)).toBe(2)
      // NaN -> undefined
      expect(parseQuantityToNumber(NaN)).toBeUndefined()
    })
  })

})
