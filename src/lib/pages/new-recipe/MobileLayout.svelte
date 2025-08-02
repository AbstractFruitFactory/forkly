<script lang="ts">
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import type { Snippet } from 'svelte'

	let {
		instructions,
		submitButton,
		title,
		description,
		recipeImage,
		tags,
		nutrition,
		servingsAdjuster,
		unitToggle,
		instructionInput,
		instructionMedia,
		ingredientRow,
		addInstructionButton,
		addIngredientButton,
		removeInstructionButton,
		saveDraftButton
	}: {
		instructions: {
			id: string
			ingredients: {
				id: string
				name?: string
				quantity?: string
				unit?: string
			}[]
			text?: string
			mediaUrl?: string
			mediaType?: 'image' | 'video'
		}[]
		submitButton: Snippet<[fullWidth?: boolean]>
		servingsAdjuster: Snippet
		title: Snippet
		description: Snippet
		recipeImage: Snippet
		tags: Snippet
		nutrition: Snippet
		unitToggle: Snippet
		instructionInput: Snippet<[id: string, value?: string]>
		instructionMedia: Snippet<[id: string, initialMedia?: { url: string; type: 'image' | 'video' }]>
		ingredientRow: Snippet<
			[
				id: string,
				instructionId: string,
				nameValue?: string,
				amountValue?: string,
				unitValue?: string
			]
		>
		addInstructionButton: Snippet<[fullWidth?: boolean]>
		addIngredientButton: Snippet<[instructionId: string, fullWidth?: boolean]>
		removeInstructionButton: Snippet<[instructionId: string]>
		saveDraftButton: Snippet<[fullWidth?: boolean]>
	} = $props()
</script>

<div class="form-section">
	{@render recipeImage()}

	<div class="form-group">
		<div>
			{@render title()}
		</div>
		<div style:height="var(--spacing-md)"></div>

		{@render description()}
	</div>
</div>

<div class="form-section">
	<div class="servings-unit-row">
		<div class="servings-adjuster">
			{@render servingsAdjuster()}
		</div>
		<div class="unit-toggle-container">
			{@render unitToggle()}
		</div>
	</div>
</div>

<div class="form-section">
	<h4>Steps</h4>
	<div class="form-group">
		{#each instructions as item, i (item.id)}
			<div class="instruction-card">
				<div class="instruction-card-header">
					<div class="instruction-step">Step {i + 1}</div>
					{@render removeInstructionButton(item.id)}
				</div>
				<div class="instruction-card-content">
					<div class="instruction-info">
						<div class="instruction-text">
							{@render instructionInput(item.id, item.text)}
						</div>
						<div class="instruction-media">
							{@render instructionMedia(
								item.id,
								item.mediaUrl ? { url: item.mediaUrl!, type: item.mediaType! } : undefined
							)}
						</div>
					</div>

					<div>
						<h5>Ingredients for this step:</h5>
						<div class="instruction-ingredients">
							{#each [...item.ingredients, { id: `add-ingredient-${item.id}`, isAddButton: true }] as ingredientItem (ingredientItem.id)}
								<div class="ingredient-input" in:scale animate:flip={{ duration: 200 }}>
									{#if 'isAddButton' in ingredientItem}
										{@render addIngredientButton(item.id, true)}
									{:else}
										{@render ingredientRow(
											ingredientItem.id,
											item.id,
											ingredientItem.name,
											ingredientItem.quantity,
											ingredientItem.unit
										)}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/each}
		{@render addInstructionButton(true)}
	</div>
</div>

<div class="form-section">
	<h4>Tags</h4>
	<div class="form-group tags">
		{@render tags()}
	</div>
</div>

<div class="form-section">
	<h4>Nutrition</h4>
	<div class="form-group">
		{@render nutrition()}
	</div>
</div>

<div class="submit-section">
	{@render saveDraftButton?.(true)}
	{@render submitButton(true)}
</div>

<style lang="scss">
	h3 {
		margin: 0;
	}

	h4 {
		margin-bottom: var(--spacing-sm);
	}

	.form-section {
		margin-bottom: var(--spacing-xl);
	}

	.form-group {
		margin-top: var(--spacing-lg);
	}

	.servings-unit-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
	}

	.unit-toggle-container {
		flex-shrink: 0;
	}

	.instruction-card {
		background: var(--color-background-dark);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	}

	.instruction-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xs);
	}

	.instruction-step {
		font-weight: 600;
		color: var(--color-text-on-surface);
	}

	.instruction-card-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction-text {
		min-height: 140px;
		width: 100%;
	}

	.instruction-media {
		width: 100%;
	}

	.instruction-ingredients {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-neutral-darker);
	}

	.ingredient-input {
		margin-bottom: var(--spacing-md);

		&:last-child {
			margin-bottom: var(--spacing-lg);
		}
	}

	.remove-btn {
		height: 36px;
		width: 36px;
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-fast) var(--ease-in-out);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);

		&:hover {
			background-color: var(--color-background-dark);
		}
	}

	.submit-section {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);
	}

	.add-instruction-button {
		margin-top: var(--spacing-lg);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}
</style>
