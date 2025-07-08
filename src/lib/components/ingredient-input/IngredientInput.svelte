<script lang="ts">
	import Input from '$lib/components/input/Input.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { UNITS, UNIT_DISPLAY_TEXT } from '$lib/utils/unitConversion'
	import SuggestionSearch from '../search/SuggestionSearch.svelte'
	import Trash from 'lucide-svelte/icons/trash-2'

	let {
		amount = $bindable(''),
		unit = $bindable(''),
		name = $bindable(''),
		unitSystem = 'imperial',
		id,
		placeholder = 'Amount',
		canRemove = false,
		onRemove = () => {},
		onIngredientSelect = () => {}
	}: {
		amount?: string
		unit?: string
		name?: string
		unitSystem?: UnitSystem
		id: string
		placeholder?: string
		canRemove?: boolean
		onRemove?: () => void
		onIngredientSelect?: (ingredient: { id: string; name: string }) => void
	} = $props()

	let ingredientId = $state<string>()

	const getUnits = (system: UnitSystem) => {
		const units: string[] = []

		// Add weight units
		units.push(...(system === 'metric' ? UNITS.weight.metric : UNITS.weight.imperial))

		// Add volume units
		units.push(...(system === 'metric' ? UNITS.volume.metric : UNITS.volume.imperial))

		// Add length units
		units.push(...(system === 'metric' ? UNITS.length.metric : UNITS.length.imperial))

		// Add other units
		units.push(...UNITS.other)

		return units
	}

	const handleAmountInput = (e: Event) => {
		const input = e.target as HTMLInputElement
		const numericValue = input.value.replace(/[^0-9.]/g, '')
		if (numericValue !== input.value) {
			input.value = numericValue
		}
		amount = numericValue
	}

	const searchIngredients = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (query.length < 2) return []

		try {
			const response = await fetch(`/api/ingredients/search/${encodeURIComponent(query)}`)
			if (response.ok) {
				return await response.json()
			}
		} catch (error) {
			console.error('Error searching ingredients:', error)
		}
		return []
	}

	const handleIngredientSelect = (ingredient: { id: string; name: string }) => {
		name = ingredient.name
		ingredientId = ingredient.id
		onIngredientSelect(ingredient)
	}
</script>

<div class="ingredient-input">
	<div>
		<input type="hidden" name="ingredient-{id}-name" value={name} />
		<div class="search">
			<SuggestionSearch
				placeholder="Enter ingredient"
				onSearch={searchIngredients}
				onSelect={handleIngredientSelect}
				clearInput={false}
				bind:searchValue={name}
			/>
		</div>
	</div>

	<div class="quantity-input">
		<Input>
			<input
				type="text"
				inputmode="decimal"
				name="ingredient-{id}-quantity"
				{placeholder}
				bind:value={amount}
				oninput={handleAmountInput}
			/>
		</Input>
	</div>

	<div class="unit-input">
		<Input>
			<input
				type="text"
				list="ingredient-{id}-units"
				name="ingredient-{id}-measurement"
				placeholder="Unit"
				bind:value={unit}
			/>
			<datalist id="ingredient-{id}-units">
				{#each getUnits(unitSystem) as unitOption}
					<option value={unitOption}
						>{UNIT_DISPLAY_TEXT[unitOption as keyof typeof UNIT_DISPLAY_TEXT]}</option
					>
				{/each}
			</datalist>
		</Input>
	</div>

	{#if canRemove}
		<button type="button" class="remove-btn" onclick={onRemove}>
			<Trash size={16} color="var(--color-text-on-background)" />
		</button>
	{/if}
</div>

<style lang="scss">
	.ingredient-input {
		width: 100%;
		display: flex;
		gap: 1px;
		align-items: center;
	}

	.search {
		flex: 1;
		min-width: 0;

		:global(.input-container) {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		:global(.search-wrapper) {
			max-width: none;
		}
	}

	.quantity-input {
		flex: 0 0 auto;

		:global(.input-container) {
			border-radius: 0;
			border-left: none;
			border-right: none;
		}
	}

	.unit-input {
		flex: auto;
		position: relative;

		:global(.input-container) {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
			border-left: none;
		}

		input {
			width: 100%;
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

	.remove-btn {
		height: 36px;
		width: 36px;
		margin-left: var(--spacing-xs);
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-fast) var(--ease-in-out);
		&:hover {
			background-color: var(--color-background-dark);
		}
	}
</style>
