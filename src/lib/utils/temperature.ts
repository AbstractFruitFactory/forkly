export type TemperatureUnit = 'C' | 'F'

export interface TemperaturePart {
	text: string
	isTemperature: boolean
	value?: number
	unit?: TemperatureUnit
}

export function celsiusToFahrenheit(c: number): number {
	return Math.round((c * 9) / 5 + 32)
}
export function fahrenheitToCelsius(f: number): number {
	return Math.round(((f - 32) * 5) / 9)
}
export function getConversionText(value: number, unit: TemperatureUnit): string {
	return unit === 'C' ? `${celsiusToFahrenheit(value)}°F` : `${fahrenheitToCelsius(value)}°C`
}

function normalizeUnit(u: string): TemperatureUnit {
	return u.trim().toUpperCase().startsWith('C') ? 'C' : 'F'
}

const UNIT = '(?:c|f|celsius|fahrenheit)'
const DEG = '\\s*[°º]\\s*'
const SEP_A = '(?<r_sepA>\\s*(?:-|–|—|to)\\s*)'
const SEP_B = '(?<r_sepB>\\s*(?:-|–|—|to)\\s*)'

const RANGE_WITH_DEG = `(?<r_val1a>-?\\d+(?:\\.\\d+)?)${DEG}(?<r_unit1a>${UNIT})(?![A-Za-z])${SEP_A}(?<r_val2a>-?\\d+(?:\\.\\d+)?)(?:${DEG}(?<r_unit2a>${UNIT})(?![A-Za-z]))?`
const RANGE_NO_DEG   = `(?<r_val1b>-?\\d{2,3}(?:\\.\\d+)?)\\s*(?<r_unit1b>${UNIT})(?![A-Za-z])${SEP_B}(?<r_val2b>-?\\d{2,3}(?:\\.\\d+)?)(?:\\s*(?<r_unit2b>${UNIT})(?![A-Za-z]))?`
const SINGLE_WITH_DEG= `(?<s_valA>-?\\d+(?:\\.\\d+)?)${DEG}(?<s_unitA>${UNIT})(?![A-Za-z])`
const SINGLE_NO_DEG  = `(?<s_valB>-?\\d{2,3}(?:\\.\\d+)?)\\s*(?<s_unitB>${UNIT})(?![A-Za-z])`

const CORE = `(?:${RANGE_WITH_DEG}|${RANGE_NO_DEG}|${SINGLE_WITH_DEG}|${SINGLE_NO_DEG})`
const TEMP_PATTERN = `(?<![A-Za-z0-9])\\(?\\s*${CORE}(?:\\s*\\))?`
const TEMP_REGEX = new RegExp(TEMP_PATTERN, 'gi')

export function parseTemperature(text: string): TemperaturePart[] {
	const parts: TemperaturePart[] = []
	let last = 0
	TEMP_REGEX.lastIndex = 0

	let m: RegExpExecArray | null
	while ((m = TEMP_REGEX.exec(text)) !== null) {
		const start = m.index
		const matchText = m[0]

		if (start > last) {
			parts.push({ text: text.slice(last, start), isTemperature: false })
		}

		const g = m.groups ?? {}
		const isRange = g.r_val1a || g.r_val1b

		if (isRange) {
			const val1 = parseFloat((g.r_val1a ?? g.r_val1b)!)
			const unit1 = normalizeUnit((g.r_unit1a ?? g.r_unit1b)!)
			const val2 = parseFloat((g.r_val2a ?? g.r_val2b)!)
			const unit2Raw = g.r_unit2a ?? g.r_unit2b
			const unit2 = normalizeUnit(unit2Raw ?? (g.r_unit1a ?? g.r_unit1b)!)
			const sepText = (g.r_sepA ?? g.r_sepB) || '–'

			const splitIdx = matchText.indexOf(sepText)
			const leftText = matchText.slice(0, splitIdx)
			const rightText = matchText.slice(splitIdx + sepText.length)

			parts.push({ text: leftText, isTemperature: true, value: val1, unit: unit1 })
			parts.push({ text: sepText, isTemperature: false })
			parts.push({ text: rightText, isTemperature: true, value: val2, unit: unit2 })
		} else {
			const rawValue = g.s_valA ?? g.s_valB
			const rawUnit = g.s_unitA ?? g.s_unitB
			const value = parseFloat(rawValue!)
			const unit = normalizeUnit(rawUnit!)
			parts.push({ text: matchText, isTemperature: true, value, unit })
		}

		last = start + matchText.length
	}

	if (last < text.length) {
		parts.push({ text: text.slice(last), isTemperature: false })
	}

	return parts
}
