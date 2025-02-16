<script lang="ts" module>
	import type { Ingredient, MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import type { IngredientSearchResult } from '$lib/server/food-api'
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

	let {
		errors,
		onSearchIngredients
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<IngredientSearchResult>
	} = $props()

	let ingredients = $state<
		(Omit<Ingredient, 'measurement'> & { measurement: Ingredient['measurement'] | undefined })[]
	>([
		{
			name: '',
			quantity: 0,
			measurement: undefined
		}
	])

	let instructions = $state([''])

	let suggestions = $state<Record<number, IngredientSearchResult>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let selectedIngredient = $state<Record<number, IngredientSearchResult[number] | null>>({})

	const addIngredient = () => {
		ingredients = [
			...ingredients,
			{
				name: '',
				quantity: 0,
				measurement: undefined
			}
		]
	}

	const removeIngredient = (index: number) => {
		ingredients = ingredients.filter((_, i) => i !== index)
	}

	const addInstruction = () => {
		instructions = [...instructions, '']
	}

	const removeInstruction = (index: number) => {
		instructions = instructions.filter((_, i) => i !== index)
	}

	const searchIngredients = async (query: string, index: number) => {
		if (!onSearchIngredients) return

		if (query.length < 2) {
			suggestions[index] = []
			return
		}

		isLoading[index] = true
		try {
			const results = await onSearchIngredients(query)
			suggestions[index] = results
		} catch (error) {
			suggestions[index] = []
		} finally {
			isLoading[index] = false
		}
	}

	const selectIngredient = (ingredient: IngredientSearchResult[number], index: number) => {
		ingredients[index].name = ingredient.name
		selectedIngredient[index] = ingredient
		suggestions[index] = []
	}
</script>

<div class="container">
	<h1>Create New Recipe</h1>

	<form method="POST" use:enhance>
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
				{#each ingredients as ingredient, i}
					<div class="ingredient-group">
						<Input>
							<input
								type="number"
								step="0.01"
								min="0"
								name={`ingredients${i}quantity`}
								placeholder="Qty"
								class="quantity-input"
								value={ingredient.quantity}
								oninput={(e) => {
									ingredients[i].quantity = Number((e.target as HTMLInputElement).value)
								}}
							/>
						</Input>

						<Input>
							<select name={`ingredients${i}measurement`}>
								<option value="">Unit</option>
								{#each measurementUnits as unit}
									<option value={unit}>{measurementUnitDisplayText[unit]}</option>
								{/each}
							</select>
						</Input>

						<div class="ingredient-input">
							<Autocomplete
								isLoading={isLoading[i]}
								suggestions={suggestions[i] ?? []}
								onSelect={(suggestion) => selectIngredient(suggestion, i)}
							>
								<Input>
									<input
										name={`ingredients${i}name`}
										placeholder="Ingredient name"
										value={ingredient.name}
										oninput={(e) => {
											const value = (e.target as HTMLInputElement).value
											ingredients[i].name = value
											selectedIngredient[i] = null
											searchIngredients(value, i)
										}}
									/>
								</Input>
							</Autocomplete>
						</div>

						<button type="button" class="remove-btn" onclick={() => removeIngredient(i)}>
							✕
						</button>
					</div>
				{/each}
				<button type="button" class="add-btn" onclick={addIngredient}> Add Ingredient </button>
			</div>
		</div>

		<div class="form-group">
			<label for="instructions">Instructions</label>
			<div id="instructions">
				{#each instructions as instruction, i}
					<div class="input-group">
						<div class="instruction-input">
							<Input>
								<textarea name={`instructions${i}`} placeholder="Enter instruction step" rows="2"
								></textarea>
							</Input>
						</div>
						<button type="button" class="remove-btn" onclick={() => removeInstruction(i)}>
							✕
						</button>
					</div>
				{/each}
				<button type="button" class="add-btn" onclick={addInstruction}> Add Instruction </button>
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
</style>
