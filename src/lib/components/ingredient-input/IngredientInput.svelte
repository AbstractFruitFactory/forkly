<script lang="ts">
	import type { MeasurementUnit } from '$lib/types'
	import Input from '$lib/components/input/Input.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { UNITS, UNIT_DISPLAY_TEXT } from '$lib/utils/unitConversion'

	let {
		value = $bindable(''),
		unit = $bindable(''),
		unitSystem = 'imperial',
		name,
		placeholder = 'Amount'
	}: {
		value?: string
		unit?: string
		unitSystem?: UnitSystem
		name: string
		placeholder?: string
	} = $props()

	const getUnits = (system: UnitSystem) => {
		const units: MeasurementUnit[] = []

		// Add weight units
		units.push(
			...(system === 'metric'
				? (UNITS.weight.metric as MeasurementUnit[])
				: (UNITS.weight.imperial as MeasurementUnit[]))
		)

		// Add volume units
		units.push(
			...(system === 'metric'
				? (UNITS.volume.metric as MeasurementUnit[])
				: (UNITS.volume.imperial as MeasurementUnit[]))
		)

		// Add length units
		units.push(
			...(system === 'metric'
				? (UNITS.length.metric as MeasurementUnit[])
				: (UNITS.length.imperial as MeasurementUnit[]))
		)

		// Add other units
		units.push(...(UNITS.other as MeasurementUnit[]))

		return units
	}

	const handleInput = (e: Event) => {
		const input = e.target as HTMLInputElement
		const numericValue = input.value.replace(/[^0-9.]/g, '')
		if (numericValue !== input.value) {
			input.value = numericValue
		}
		value = numericValue
	}
</script>

<div class="ingredient-input">
	<Input>
		<div class="input-container">
			<input
				type="text"
				inputmode="decimal"
				name="{name}-quantity"
				{placeholder}
				{value}
				oninput={handleInput}
			/>
			<input
				type="text"
				list="{name}-units"
				name="{name}-measurement"
				placeholder="Unit"
				bind:value={unit}
				class="unit-input"
			/>
			<datalist id="{name}-units">
				{#each getUnits(unitSystem) as unitOption}
					<option value={unitOption}>{UNIT_DISPLAY_TEXT[unitOption]}</option>
				{/each}
			</datalist>
		</div>
	</Input>
</div>

<style lang="scss">
	.ingredient-input {
		width: 100%;
	}

	.input-container {
		display: flex;
		align-items: center;
		width: 100%;
		position: relative;

		input {
			width: 100%;
			padding-right: 80px;
		}

		.unit-input {
			position: absolute;
			right: 0;
			top: 0;
			bottom: 0;
			width: 80px;
			border: none;
			border-left: var(--border-width-thin) solid var(--color-neutral);
			background-color: var(--color-neutral-darker);
			padding-right: var(--spacing-sm);
			padding-left: var(--spacing-sm);
			font-size: var(--font-size-sm);
			color: var(--color-neutral-light);
			z-index: 1;

			&:focus {
				box-shadow: none;
			}
		}
	}
</style>
