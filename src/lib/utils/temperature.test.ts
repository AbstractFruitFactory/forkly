import { describe, it, expect } from 'vitest'
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  getConversionText,
  parseTemperature,
  type TemperaturePart
} from './temperature'

function temps(parts: TemperaturePart[]) {
  return parts.filter((p) => p.isTemperature)
}

describe('temperature conversions', () => {
  it('celsiusToFahrenheit', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
    expect(celsiusToFahrenheit(100)).toBe(212)
    expect(celsiusToFahrenheit(-40)).toBe(-40)
  })

  it('fahrenheitToCelsius', () => {
    expect(fahrenheitToCelsius(32)).toBe(0)
    expect(fahrenheitToCelsius(212)).toBe(100)
    expect(fahrenheitToCelsius(-40)).toBe(-40)
  })

  it('getConversionText', () => {
    expect(getConversionText(0, 'C')).toBe('32°F')
    expect(getConversionText(212, 'F')).toBe('100°C')
  })
})

describe('parseTemperature - single values', () => {
  it('parses with degree symbol and compact form', () => {
    const text = 'Preheat to 180°C.'
    const parts = parseTemperature(text)
    expect(parts.length).toBe(3)
    expect(parts[1]).toEqual({ text: '180°C', isTemperature: true, value: 180, unit: 'C' })
  })

  it('parses with degree symbol and spaced form', () => {
    const text = 'Bake at 5 ° C for best results.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([{ text: '5 ° C', isTemperature: true, value: 5, unit: 'C' }])
  })

  it('parses with parentheses', () => {
    const text = 'Set oven to (200 ° Fahrenheit) now.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([
      { text: '(200 ° Fahrenheit)', isTemperature: true, value: 200, unit: 'F' }
    ])
  })

  it('parses without degree (2–3 digits only)', () => {
    const text = 'Try 180 C or 350F or 400 fahrenheit depending on your oven.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([
      { text: '180 C', isTemperature: true, value: 180, unit: 'C' },
      { text: '350F', isTemperature: true, value: 350, unit: 'F' },
      { text: '400 fahrenheit', isTemperature: true, value: 400, unit: 'F' }
    ])
  })

  it('does not parse 1-digit without degree (avoid cups like "2 c")', () => {
    const text = 'Add 2 c sugar and stir.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([])
  })

  it('accepts decimals', () => {
    const text = 'Warm to 98.6°F and hold.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([{ text: '98.6°F', isTemperature: true, value: 98.6, unit: 'F' }])
  })

  it('does not match when unit is followed by letters', () => {
    const text = 'Bad pattern like 180Cdeg should not count.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([])
  })

  it('is case-insensitive for unit words', () => {
    const text = 'Heat to 200 CELSIUS then cool to 32 fahrenheit.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([
      { text: '200 CELSIUS', isTemperature: true, value: 200, unit: 'C' },
      { text: '32 fahrenheit', isTemperature: true, value: 32, unit: 'F' }
    ])
  })
})

describe('parseTemperature - ranges', () => {
  it('parses simple degree range with hyphen', () => {
    const text = 'Bake at 180°C-200°C.'
    const p = parseTemperature(text)
    expect(p.length).toBe(5)
    expect(p[1]).toEqual({ text: '180°C', isTemperature: true, value: 180, unit: 'C' })
    expect(p[2]).toEqual({ text: '-', isTemperature: false })
    expect(p[3]).toEqual({ text: '200°C', isTemperature: true, value: 200, unit: 'C' })
    expect(p[4]).toEqual({ text: '.', isTemperature: false })
  })

  it('parses spaced range with en dash and mixed spacing', () => {
    const text = 'Target 180 °C – 200 ° C for baking.'
    const p = parseTemperature(text)
    const t = temps(p)
    expect(t[0]).toEqual({ text: '180 °C', isTemperature: true, value: 180, unit: 'C' })
    expect(t[1]).toEqual({ text: '200 ° C', isTemperature: true, value: 200, unit: 'C' })

    const sepPart = p.find((q) => !q.isTemperature && q.text?.includes('–'))
    expect(sepPart).toEqual({ text: ' – ', isTemperature: false })
  })

  it('parses "to" separator and mixed units', () => {
    const text = 'Range is 180°F to 200 ° C.'
    const p = parseTemperature(text)
    const t = temps(p)
    expect(t[0]).toEqual({ text: '180°F', isTemperature: true, value: 180, unit: 'F' })
    expect(t[1]).toEqual({ text: '200 ° C', isTemperature: true, value: 200, unit: 'C' })

    const sepPart = p.find((q) => !q.isTemperature && q.text?.toLowerCase().includes('to'))
    expect(sepPart).toEqual({ text: ' to ', isTemperature: false })
  })

  it('falls back to first unit when second unit is omitted (no degree branch)', () => {
    const text = 'Aim for 180 C to 200.'
    const p = parseTemperature(text)
    const t = temps(p)
    expect(t).toHaveLength(2)
    expect(t[0]).toEqual({ text: '180 C', isTemperature: true, value: 180, unit: 'C' })
    expect(t[1]).toEqual({ text: '200', isTemperature: true, value: 200, unit: 'C' })
  })

  it('falls back to first unit when second unit is omitted (degree branch)', () => {
    const text = 'Aim for 180 °F - 200.'
    const p = parseTemperature(text)
    const t = temps(p)
    expect(t).toHaveLength(2)
    expect(t[0]).toEqual({ text: '180 °F', isTemperature: true, value: 180, unit: 'F' })
    expect(t[1]).toEqual({ text: '200', isTemperature: true, value: 200, unit: 'F' })
  })
})

describe('parseTemperature - multiple matches and boundaries', () => {
  it('handles multiple temperatures in a sentence', () => {
    const text = 'Start at 180°C for 10m, then 350F if using imperial.'
    const p = parseTemperature(text)
    expect(p[0]).toEqual({ text: 'Start at ', isTemperature: false })
    expect(p[1]).toEqual({ text: '180°C', isTemperature: true, value: 180, unit: 'C' })
    expect(p[2]).toEqual({ text: ' for 10m, then ', isTemperature: false })
    expect(p[3]).toEqual({ text: '350F', isTemperature: true, value: 350, unit: 'F' })
    expect(p[4]).toEqual({ text: ' if using imperial.', isTemperature: false })
  })

  it('parses negative values', () => {
    const text = 'Do not use -10°C in this context.'
    const p = parseTemperature(text)
    expect(temps(p)).toEqual([{ text: '-10°C', isTemperature: true, value: -10, unit: 'C' }])
  })
}) 