<script lang="ts" module>
	import type { MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import Autocomplete from '$lib/components/autocomplete/Autocomplete.svelte'
	import Input from '$lib/components/input/Input.svelte'

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
	let lookupIngredientInputs = $state<Record<number, HTMLInputElement>>({})
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
		lookupIngredientInputs[index].value = suggestion.name
		selectedLookupIngredients[index] = suggestion
		suggestions[index] = []
		isLoading[index] = false

		if (onIngredientSelect) {
			await onIngredientSelect(suggestion)
		}
	}

	const clearSelection = (index: number) => {
		delete selectedLookupIngredients[index]
	}

	const setCustomIngredientInput = (index: number) => {
		showCustomInput[index] = true
	}

	const handleBlur = (index: number) => {
		setTimeout(() => {
			if (!selectedLookupIngredients[index]) {
				inputValues[index] = ''
				lookupIngredientInputs[index].value = ''
			}
			suggestions[index] = []
		}, 200)
	}
</script>

<div class="container">
	<h1>Create New Recipe</h1>

	<form
		method="POST"
		use:enhance={({ formData }) => {
			Object.entries(selectedLookupIngredients).forEach(([index, ingredient]) => {
				if (ingredient) {
					formData.append(`ingredient-${index}-lookupdata`, JSON.stringify(ingredient))
				}
			})
		}}
	>
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

						<Input>
							<select name={`ingredient-${i}-measurement`}>
								<option value="">Unit</option>
								{#each measurementUnits as unit}
									<option value={unit}>{measurementUnitDisplayText[unit]}</option>
								{/each}
							</select>
						</Input>

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
									<Autocomplete
										isLoading={isLoading[i]}
										suggestions={suggestions[i] ?? []}
										onSelect={(suggestion) => handleSelect(i, suggestion)}
									>
										<Input>
											<div class="search-input-wrapper">
												<svg
													class="search-icon"
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<circle cx="11" cy="11" r="8"></circle>
													<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
												</svg>
												<input
													name={selectedLookupIngredients[i] ? `ingredient-${i}-name&lookup` : ''}
													placeholder="Search for ingredient"
													bind:this={lookupIngredientInputs[i]}
													value={inputValues[i] ?? ''}
													oninput={(e) => {
														clearSelection(i);
														searchIngredients((e.target as HTMLInputElement).value, i)
													}}
													onblur={() => handleBlur(i)}
												/>
											</div>
										</Input>
									</Autocomplete>

									{#if suggestions[i]?.length === 0 && !isLoading[i] && !selectedLookupIngredients[i]}
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
				<button type="button" class="add-btn" onclick={addIngredient}>Add Ingredient</button>
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
				<button type="button" class="add-btn" onclick={addInstruction}>Add Instruction</button>
			</div>
		</div>

		<button type="submit" class="submit-btn">Create Recipe</button>
	</form>
</div>

<style lang="scss">
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	h1 {
		font-size: 32px;
		margin-bottom: 40px;
		font-weight: 600;
		text-align: center;
	}

	.form-group {
		margin-bottom: 32px;
	}

	label {
		display: block;
		margin-bottom: 12px;
		font-weight: 500;
		font-size: 1.1rem;
	}

	.input-group {
		display: flex;
		gap: 12px;
		margin-bottom: 12px;
		align-items: flex-start;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		transition: all 0.2s ease;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 4px;
	}

	.remove-btn:hover {
		color: var(--color-error);
		background-color: var(--color-error-dark);
	}

	.add-btn {
		background: none;
		border: 2px dashed var(--color-neutral);
		padding: 12px 24px;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		margin-top: 16px;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.add-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.ingredient-group {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		align-items: flex-start;

		@media (max-width: 600px) {
			flex-direction: column;
			gap: 8px;

			:global(.input-wrapper) {
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
		gap: 8px;
		flex: 1;
		position: relative;
		display: flex;

		input {
			flex: 1;
			height: 40px;
		}
	}

	.error-container {
		margin-bottom: 24px;
		padding: 16px;
		border-radius: 8px;
		background-color: var(--color-error-light);
		border: 1px solid var(--color-error);
	}

	.error {
		color: var(--color-error-dark);
		margin: 0.25rem 0;
		font-size: 0.9rem;
	}

	.submit-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 16px 32px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 16px;
		width: 100%;
		transition: all 0.2s ease;
		font-weight: 600;
		margin-top: 16px;

		&:hover {
			background: var(--color-primary-dark);
			transform: translateY(-1px);
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		&:active {
			transform: translateY(0);
		}
	}

	.custom-ingredient {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.text-button {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 14px;
		padding: 4px 8px;
		cursor: pointer;
		text-align: left;

		&:hover {
			text-decoration: underline;
		}
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;

		input {
			padding-left: 36px;
		}
	}

	.search-icon {
		position: absolute;
		left: 12px;
		color: var(--color-neutral);
		pointer-events: none;
	}
</style>
