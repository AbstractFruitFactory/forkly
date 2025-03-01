<script lang="ts" module>
	import type { MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import Input from '$lib/components/input/Input.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { UNITS, UNIT_DISPLAY_TEXT } from '$lib/utils/unitConversion'
	import PillSelector from '$lib/components/pill-selector/PillSelector.svelte'

	// Create a mapping for display text that works with our MeasurementUnit type
	const measurementUnitDisplayText: Record<MeasurementUnit, string> = {
		// Weight
		grams: UNIT_DISPLAY_TEXT.grams,
		kilograms: UNIT_DISPLAY_TEXT.kilograms,
		ounces: UNIT_DISPLAY_TEXT.ounces,
		pounds: UNIT_DISPLAY_TEXT.pounds,

		// Volume
		milliliters: UNIT_DISPLAY_TEXT.milliliters,
		liters: UNIT_DISPLAY_TEXT.liters,
		cups: UNIT_DISPLAY_TEXT.cups,
		fluid_ounces: UNIT_DISPLAY_TEXT.fluid_ounces,
		tablespoons: UNIT_DISPLAY_TEXT.tablespoons,
		teaspoons: UNIT_DISPLAY_TEXT.teaspoons,
		gallons: UNIT_DISPLAY_TEXT.gallons,

		// Length
		millimeters: UNIT_DISPLAY_TEXT.millimeters,
		centimeters: UNIT_DISPLAY_TEXT.centimeters,
		meters: UNIT_DISPLAY_TEXT.meters,
		inches: UNIT_DISPLAY_TEXT.inches,
		feet: UNIT_DISPLAY_TEXT.feet,

		// Other
		pieces: UNIT_DISPLAY_TEXT.pieces,
		'to taste': UNIT_DISPLAY_TEXT['to taste'],
		pinch: UNIT_DISPLAY_TEXT.pinch
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import ImageUpload from '$lib/components/image-upload/ImageUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import { dietTypes, dietColors } from '$lib/types'

	type T = $$Generic<{ name: string; custom: false }>
	type Ingredient = T | { name: string; custom: true }

	let {
		errors,
		onSearchIngredients,
		onIngredientSelect,
		unitSystem,
		onUnitChange
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<T[]>
		onIngredientSelect?: (ingredient: T) => Promise<void>
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
	} = $props()

	let ingredientCount = $state(1)
	let instructionCount = $state(1)
	let inputValues = $state<Record<number, string>>({})
	let suggestions = $state<Record<number, T[]>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let showCustomInput = $state<Record<number, boolean>>({})
	let selectedLookupIngredients = $state<Record<number, Ingredient>>({})
	let selectedDiets = $state<string[]>([])

	const addIngredient = () => {
		ingredientCount++
	}

	const removeIngredient = (index: number) => {
		if (ingredientCount > 1) {
			ingredientCount--
		}
	}

	const addInstruction = () => {
		instructionCount++
	}

	const removeInstruction = (index: number) => {
		if (instructionCount > 1) {
			instructionCount--
		}
	}

	const searchIngredients = async (query: string, index: number) => {
		if (!onSearchIngredients) return []

		inputValues[index] = query

		if (query.length < 3) {
			isLoading[index] = false
			return []
		}

		isLoading[index] = true
		const results = await onSearchIngredients(query)
		suggestions[index] = results
		isLoading[index] = false

		return results
	}

	const handleSelect = async (index: number, suggestion: T) => {
		inputValues[index] = suggestion.name
		selectedLookupIngredients[index] = suggestion

		if (onIngredientSelect) {
			await onIngredientSelect(suggestion)
		}
	}

	const setCustomIngredientInput = (index: number) => {
		showCustomInput[index] = true
	}

	let submitting = $state(false)
</script>

<div class="container">
	<h1>Create New Recipe</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			submitting = true
			Object.entries(selectedLookupIngredients).forEach(([index, ingredient]) => {
				if (ingredient) {
					formData.append(`ingredient-${index}-lookupdata`, JSON.stringify(ingredient))
				}
			})

			return async ({ update }) => {
				submitting = false
				update()
			}
		}}
	>
		<ImageUpload />

		{#if errors}
			<div class="error-container">
				{#each errors as error}
					<p class="error">{error.path}: {error.message}</p>
				{/each}
			</div>
		{/if}

		<div class="form-group">
			<label for="title">Recipe Title</label>
			<Input>
				<input id="title" name="title" type="text" required placeholder="Enter recipe title" />
			</Input>
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<Input>
				<textarea id="description" name="description" placeholder="Describe your recipe" rows="3"
				></textarea>
			</Input>
		</div>

		<div class="form-group">
			<label for="diets">Diets</label>
			<PillSelector
				items={dietTypes}
				bind:selectedItems={selectedDiets}
				name="diets"
				colorMap={dietColors}
			/>
		</div>

		<div class="form-group">
			<div class="ingredients-header">
				<label for="ingredients">Ingredients</label>
				<div class="unit-toggle-container">
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				</div>
			</div>
			<div id="ingredients">
				{#each Array(ingredientCount) as _, i}
					<div class="ingredient-group">
						<div class="quantity-wrapper">
							<Input>
								<input
									type="number"
									step="0.01"
									min="0"
									name={`ingredient-${i}-quantity`}
									placeholder="Qty"
									class="quantity-input"
								/>
							</Input>
						</div>

						<div class="unit-wrapper">
							<Input>
								<select name={`ingredient-${i}-measurement`}>
									<option value="">Unit</option>

									{#if unitSystem === 'metric'}
										{#each UNITS.weight.metric as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{:else}
										{#each UNITS.weight.imperial as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{/if}

									{#if unitSystem === 'metric'}
										{#each UNITS.volume.metric as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{:else}
										{#each UNITS.volume.imperial as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{/if}

									{#if unitSystem === 'metric'}
										{#each UNITS.length.metric as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{:else}
										{#each UNITS.length.imperial as unit}
											{#if measurementUnits.includes(unit as any)}
												<option value={unit}
													>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
												>
											{/if}
										{/each}
									{/if}

									{#each UNITS.other as unit}
										{#if measurementUnits.includes(unit as any)}
											<option value={unit}
												>{measurementUnitDisplayText[unit as MeasurementUnit]}</option
											>
										{/if}
									{/each}
								</select>
							</Input>
						</div>

						<div class="ingredient-input">
							{#if showCustomInput[i] || !browser}
								<div class="custom-ingredient">
									<Input>
										<input
											name={`ingredient-${i}-name&custom`}
											placeholder="Enter custom ingredient"
											value={inputValues[i] ?? ''}
										/>
									</Input>
									<button
										type="button"
										class="text-button"
										onclick={() => (showCustomInput[i] = false)}
									>
										Search instead
									</button>
								</div>
							{:else}
								<div class="custom-ingredient">
									<Search
										placeholder="Search for ingredient"
										isLoading={isLoading[i]}
										onSearch={(query) => searchIngredients(query, i)}
										onSelect={(suggestion) => handleSelect(i, suggestion)}
									/>

									{#if suggestions[i]?.length === 0 && !isLoading[i] && !selectedLookupIngredients[i] && inputValues[i]?.length >= 3}
										<button
											type="button"
											class="text-button"
											onclick={() => setCustomIngredientInput(i)}
										>
											Ingredient not found? Add it manually
										</button>
									{/if}
								</div>
							{/if}
						</div>

						<button
							type="button"
							class="remove-btn"
							onclick={() => removeIngredient(i)}
							disabled={ingredientCount === 1}
						>
							✕
						</button>
					</div>
				{/each}
				<Button variant="dotted" onclick={addIngredient} size="sm">Add Ingredient</Button>
			</div>
		</div>

		<div class="form-group">
			<label for="instructions">Instructions</label>
			<div id="instructions">
				{#each Array(instructionCount) as _, i}
					<div class="input-group">
						<div class="instruction-input">
							<Input>
								<textarea name={`instructions-${i}`} placeholder="Enter instruction step" rows="2"
								></textarea>
							</Input>
						</div>
						<button
							type="button"
							class="remove-btn"
							onclick={() => removeInstruction(i)}
							disabled={instructionCount === 1}
						>
							✕
						</button>
					</div>
				{/each}
				<Button variant="dotted" onclick={addInstruction} size="sm">Add Instruction</Button>
			</div>
		</div>
		<div style:margin-top="2rem">
			<Button loading={submitting} fullWidth type="submit" variant="primary">Create Recipe</Button>
		</div>
	</form>
</div>

<style lang="scss">
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	h1 {
		font-size: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
		font-weight: 600;
		text-align: center;
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);
	}

	label {
		display: block;
		margin-bottom: var(--spacing-md);
		font-weight: 500;
		font-size: var(--spacing-lg);
	}

	.input-group {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		align-items: flex-start;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-sm);
		transition: all var(--transition-fast) var(--ease-in-out);
		border-radius: 50%;
		width: var(--spacing-lg);
		height: var(--spacing-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: var(--spacing-xs);
	}

	.remove-btn:hover {
		color: var(--color-error);
		background-color: var(--color-error-dark);
	}

	.ingredient-group {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		align-items: flex-start;

		.quantity-wrapper {
			flex: 0 0 100px;
		}

		.unit-wrapper {
			flex: 0 0 150px;
		}

		.ingredient-input {
			flex: 1;
			min-width: 0;

			.custom-ingredient {
				width: 100%;
				height: 100%;

				:global(.search),
				:global(.input-wrapper) {
					width: 100%;
				}
			}
		}

		@media (max-width: 600px) {
			flex-direction: column;
			gap: var(--spacing-sm);

			> div {
				width: 100%;
			}
		}
	}

	.instruction-input {
		flex: 1;
	}

	.quantity-input {
		width: 100px !important;
	}

	.ingredient-input {
		position: relative;
		width: 100%;
	}

	.custom-ingredient {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.text-button {
		background: none;
		border: none;
		color: var(--color-primary);
		cursor: pointer;
		font-size: var(--font-size-sm);
		padding: 0;
		text-align: left;
		text-decoration: underline;
		margin-top: var(--spacing-xs);

		&:hover {
			color: var(--color-primary-dark);
		}
	}

	.error-container {
		background-color: var(--color-error-dark);
		border-radius: var(--border-radius);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.error {
		color: var(--color-error);
		font-size: var(--font-size-sm);
		margin: var(--spacing-xs) 0;
	}

	@media (max-width: 640px) {
		.ingredients-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.unit-toggle-container {
			margin-left: 0;
			margin-top: var(--spacing-sm);
		}
	}

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background-color: var(--color-neutral-darker);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
	}

	.checkbox-item input[type='checkbox'] {
		accent-color: var(--color-primary);
	}

	.checkbox-item label {
		margin-bottom: 0;
		font-size: var(--font-size-md);
		font-weight: normal;
	}
</style>
