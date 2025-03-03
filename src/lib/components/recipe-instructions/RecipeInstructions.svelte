<script lang="ts">
	import Popover from '$lib/components/popover/Popover.svelte'

	interface Props {
		instructions: string[]
	}

	let { instructions } = $props<Props>()

	// Function to convert Celsius to Fahrenheit
	function celsiusToFahrenheit(celsius: number): number {
		return Math.round((celsius * 9/5) + 32)
	}

	// Function to convert Fahrenheit to Celsius
	function fahrenheitToCelsius(fahrenheit: number): number {
		return Math.round((fahrenheit - 32) * 5/9)
	}

	// Function to parse text and identify temperature references
	function parseTemperature(text: string): { text: string; isTemperature: boolean; value?: number; unit?: 'C' | 'F' }[] {
		const parts: { text: string; isTemperature: boolean; value?: number; unit?: 'C' | 'F' }[] = []
		let currentIndex = 0

		// Regular expressions for temperature patterns
		const patterns = [
			/(\d+)\s*°?\s*C(?:elsius)?/i,  // Matches: 180C, 180°C, 180 Celsius
			/(\d+)\s*°?\s*F(?:ahrenheit)?/i  // Matches: 350F, 350°F, 350 Fahrenheit
		]

		while (currentIndex < text.length) {
			let matchFound = false
			for (const pattern of patterns) {
				const match = text.slice(currentIndex).match(pattern)
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

	// Function to get conversion text
	function getConversionText(value: number, unit: 'C' | 'F'): string {
		if (unit === 'C') {
			return `${value}°C = ${celsiusToFahrenheit(value)}°F`
		} else {
			return `${value}°F = ${fahrenheitToCelsius(value)}°C`
		}
	}
</script>

<div class="instructions">
	{#each instructions as instruction, index}
		<div class="instruction">
			<span class="step-number">{index + 1}.</span>
			{#each parseTemperature(instruction) as part}
				{#if part.isTemperature && part.value !== undefined && part.unit}
					<Popover
						trigger={() => (
							<span class="temperature">{part.text}</span>
						)}
						content={() => (
							<span class="conversion">{getConversionText(part.value, part.unit)}</span>
						)}
					/>
				{:else}
					<span>{part.text}</span>
				{/if}
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	.instructions {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction {
		display: flex;
		gap: var(--spacing-sm);
		line-height: 1.5;
		color: var(--color-neutral-light);
	}

	.step-number {
		font-weight: 600;
		color: var(--color-primary);
	}

	.temperature {
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
	}

	.conversion {
		font-size: var(--font-size-sm);
		white-space: nowrap;
	}
</style> 