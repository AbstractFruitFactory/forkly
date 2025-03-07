<script lang="ts">
	import type { MeasurementUnit } from '$lib/types'
	import Input from '$lib/components/input/Input.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { UNITS, UNIT_DISPLAY_TEXT } from '$lib/utils/unitConversion'

	let {
		value = $bindable(''),
		unit = $bindable<MeasurementUnit>(),
		unitSystem = 'imperial',
		name,
		placeholder = 'Amount'
	}: {
		value?: string
		unit?: MeasurementUnit
		unitSystem?: UnitSystem
		name?: string
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
			<input type="text" inputmode="decimal" {name} {placeholder} {value} oninput={handleInput} />
			<select name={name ? `${name}-unit` : undefined} bind:value={unit}>
				<option value="">Unit</option>
				{#each getUnits(unitSystem) as unit}
					<option value={unit}>{UNIT_DISPLAY_TEXT[unit]}</option>
				{/each}
			</select>
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

		select {
			position: absolute;
			cursor: pointer;
			right: 0;
			top: 0;
			bottom: 0;
			width: 80px;
			border: none;
			border-left: var(--border-width-thin) solid var(--color-neutral);
			background-color: var(--color-neutral-dark);
			padding-right: var(--spacing-xl);
			padding-left: var(--spacing-sm);
			font-size: var(--font-size-sm);
			color: var(--color-neutral-light);
			cursor: pointer;
			z-index: 1;
			appearance: none;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right var(--spacing-sm) center;
			background-size: var(--spacing-sm);
			background-color: var(--color-neutral-darker);

			&:focus {
				box-shadow: none;
			}

			option {
				cursor: pointer;
				background-color: var(--color-neutral-dark);
				color: var(--color-neutral-light);
			}
		}
	}
</style>
