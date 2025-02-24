<script lang="ts" module>
	import type { MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import Input from '$lib/components/input/Input.svelte'
	import Search from '$lib/components/search/Search.svelte'

	const measurementUnitDisplayText: Record<MeasurementUnit, string> = {
		cups: 'cups (c)',
		tablespoons: 'tablespoons (tbsp)',
		teaspoons: 'teaspoons (tsp)',
		ounces: 'ounces (oz)',
		pounds: 'pounds (lb)',
		grams: 'grams (g)',
		milliliters: 'milliliters (ml)',
		pieces: 'pieces (pc)',
		'to taste': 'to taste',
		pinch: 'pinch',
		kilograms: 'kilograms (kg)',
		liters: 'liters (L)'
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import ImageUpload from '$lib/components/image-upload/ImageUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'

	type T = $$Generic<{ name: string; custom: false }>
	type Ingredient = T | { name: string; custom: true }

	let {
		errors,
		onSearchIngredients,
		onIngredientSelect
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<T[]>
		onIngredientSelect?: (ingredient: T) => Promise<void>
	} = $props()

	let ingredientCount = $state(1)
	let instructionCount = $state(1)
	let inputValues = $state<Record<number, string>>({})
	let suggestions = $state<Record<number, T[]>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let showCustomInput = $state<Record<number, boolean>>({})
	let selectedLookupIngredients = $state<Record<number, Ingredient>>({})

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
		if (!onSearchIngredients) return

		inputValues[index] = query

		if (query.length < 3) {
			suggestions[index] = []
			isLoading[index] = false
			return
		}

		isLoading[index] = true
		suggestions[index] = await onSearchIngredients(query)
		isLoading[index] = false
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
</script>

<div class="container">
	<h1>Create New Recipe</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			Object.entries(selectedLookupIngredients).forEach(([index, ingredient]) => {
				if (ingredient) {
					formData.append(`ingredient-${index}-lookupdata`, JSON.stringify(ingredient))
				}
			})
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
			<label for="ingredients">Ingredients</label>
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
									{#each measurementUnits as unit}
										<option value={unit}>{measurementUnitDisplayText[unit]}</option>
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
										suggestions={suggestions[i] ?? []}
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
			<Button fullWidth type="submit" variant="primary">Create Recipe</Button>
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

	.error-container {
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		background-color: var(--color-error-light);
		border: var(--border-width-thin) solid var(--color-error);
	}

	.error {
		color: var(--color-error-dark);
		margin: var(--spacing-xs) 0;
	}

	.text-button {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		cursor: pointer;
		text-align: left;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
