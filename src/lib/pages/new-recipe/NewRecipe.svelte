<script lang="ts" module>
	import type { Ingredient, MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import type { ValidationError } from '$lib/form-validation/types'

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

	let { errors }: { errors: ValidationError[] } = $props()

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
			<input id="title" type="text" name="title" required placeholder="Enter recipe title" />
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<textarea id="description" name="description" placeholder="Describe your recipe" rows="3"
			></textarea>
		</div>

		<div class="form-group">
			<label for="ingredients">Ingredients</label>
			<div id="ingredients">
				{#each ingredients as ingredient, i}
					<div class="ingredient-group">
						<div class="quantity-measure">
							<input
								type="number"
								step="0.01"
								min="0"
								name={`ingredients${i}quantity`}
								placeholder="Qty"
								class="quantity-input"
							/>
							<select name={`ingredients${i}measurement`} class="measure-select">
								<option value="">Unit</option>
								{#each measurementUnits as unit}
									<option value={unit}>{measurementUnitDisplayText[unit]}</option>
								{/each}
							</select>
						</div>
						<div class="ingredient-input">
							<input type="text" name={`ingredients${i}name`} placeholder="Ingredient name" />
							<button type="button" class="remove-btn" onclick={() => removeIngredient(i)}>
								✕
							</button>
						</div>
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
						<textarea name={`instructions${i}`} placeholder="Enter instruction step" rows="2"
						></textarea>
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

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	h1 {
		font-size: 36px;
		margin-bottom: 32px;
		font-weight: 600;
		color: var(--color-neutral-dark);
	}

	.form-group {
		margin-bottom: 24px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: var(--color-neutral-dark);
	}

	input,
	textarea,
	.measure-select {
		width: 100%;
		padding: 8px;
		border: 1px solid var(--color-neutral);
		border-radius: 4px;
		font-size: 16px;
		font-family: var(--font-sans);
		transition: border-color 0.2s ease;
		background-color: var(--color-neutral-lighter);
		color: var(--color-neutral-dark);
	}

	textarea {
		resize: none;
		height: 100px;
	}

	input:focus,
	textarea:focus,
	.measure-select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.input-group {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--color-neutral);
		cursor: pointer;
		padding: 0 8px;
		transition: color 0.2s ease;
	}

	.remove-btn:hover {
		color: var(--color-error);
	}

	.add-btn {
		background: none;
		border: 1px solid var(--color-neutral);
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		width: 100%;
		margin-top: 8px;
		transition: all 0.2s ease;
		font-weight: 500;
		color: var(--color-neutral-dark);
	}

	.add-btn:hover {
		background: var(--color-neutral-lighter);
		border-color: var(--color-neutral);
	}

	.submit-btn {
		background: var(--color-primary);
		color: var(--color-neutral-dark);
		border: none;
		padding: 16px 32px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		width: 100%;
		transition: background-color 0.2s ease;
		font-weight: 600;
	}

	.submit-btn:hover {
		background: var(--color-primary-dark);
	}

	.ingredient-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.quantity-measure {
		display: flex;
		gap: 8px;
	}

	.quantity-input {
		width: 80px;
	}

	.ingredient-input {
		display: flex;
		gap: 8px;
		flex: 1;
	}

	@media (min-width: 640px) {
		.ingredient-group {
			flex-direction: row;
			align-items: start;
		}

		.quantity-measure {
			width: 220px;
			flex-shrink: 0;
		}
	}

	.error-container {
		margin-bottom: 1rem;
		padding: 1rem;
		border-radius: 4px;
		background-color: var(--color-error-light);
		border: 1px solid var(--color-error);
	}

	.error {
		color: var(--color-error-dark);
		margin: 0.25rem 0;
	}
</style>
