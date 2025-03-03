export type TemperatureUnit = 'C' | 'F'

export interface TemperaturePart {
	text: string
	isTemperature: boolean
	value?: number
	unit?: TemperatureUnit
}

// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(celsius: number): number {
	return Math.round((celsius * 9 / 5) + 32)
}

// Convert Fahrenheit to Celsius
export function fahrenheitToCelsius(fahrenheit: number): number {
	return Math.round((fahrenheit - 32) * 5 / 9)
}

// Get conversion text for display
export function getConversionText(value: number, unit: TemperatureUnit): string {
	if (unit === 'C') {
		return `${celsiusToFahrenheit(value)}°F`
	} else {
		return `${fahrenheitToCelsius(value)}°C`
	}
}

// Parse text and identify temperature references
export function parseTemperature(text: string): TemperaturePart[] {
	const parts: TemperaturePart[] = []
	let currentIndex = 0

	// Regular expressions for temperature patterns
	const patterns = [
		/(\d+)\s*°?F(?:ahrenheit)?/i,  // Matches: 350F, 350°F, 350 Fahrenheit
		/(\d+)\s*°?C(?:elsius)?/i,  // Matches: 180C, 180°C, 180 Celsius
		/\((\d+)\s*°?C(?:elsius)?\)/i,  // Matches: (180C), (180°C)
		/\((\d+)\s*°?F(?:ahrenheit)?\)/i  // Matches: (350F), (350°F)
	]

	while (currentIndex < text.length) {
		let matchFound = false
		const remainingText = text.slice(currentIndex)

		for (const pattern of patterns) {
			const match = remainingText.match(pattern)
			if (match) {
				// Add text before the temperature
				if (match.index! > 0) {
					parts.push({
						text: text.slice(currentIndex, currentIndex + match.index!),
						isTemperature: false
					})
				}

				// Add the temperature
				const value = parseInt(match[1])
				const unit = match[0].toUpperCase().includes('C') ? 'C' : 'F'

				parts.push({
					text: match[0],
					isTemperature: true,
					value,
					unit
				})

				currentIndex += match.index! + match[0].length
				matchFound = true
				break
			}
		}

		if (!matchFound) {
			// If no match found, add the remaining text
			parts.push({
				text: text.slice(currentIndex),
				isTemperature: false
			})
			break
		}
	}

	return parts
} 