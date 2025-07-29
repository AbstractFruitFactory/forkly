<script lang="ts">
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import type { Snippet } from 'svelte'

	let {
		instructions,
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
		submitButton,
		saveDraftButton
	}: {
		instructions: {
			id: string
			ingredients: {
				id: string
				name?: string
				quantity?: { text: string; numeric: number }
				unit?: string
			}[]
			text?: string
			mediaUrl?: string
			mediaType?: 'image' | 'video'
		}[]
		title: Snippet
		description: Snippet
		recipeImage: Snippet
		tags: Snippet
		nutrition: Snippet
		servingsAdjuster: Snippet
		unitToggle: Snippet
		ingredientRow: Snippet<
			[
				id: string,
				instructionId: string,
				nameValue?: string,
				amountValue?: string,
				unitValue?: string
			]
		>
		instructionInput: Snippet<[id: string, value?: string]>
		instructionMedia: Snippet<[id: string, initialMedia?: { url: string; type: 'image' | 'video' }]>
		addInstructionButton: Snippet
		addIngredientButton: Snippet<[instructionId: string]>
		removeInstructionButton: Snippet<[instructionId: string]>
		submitButton: Snippet
		saveDraftButton: Snippet<[fullWidth?: boolean]>
	} = $props()
</script>

<div class="form-grid">
	<div class="section-title">Info</div>
	<div class="section-content">
		<div class="header-content">
			<div class="text-content">
				<div>
					{@render title()}
				</div>

				{@render description()}
			</div>

			<div class="image-content">
				{@render recipeImage()}
			</div>
		</div>
	</div>

	<div class="steps-grid" style="grid-column: 1 / span 2;">
		<div class="servings-controls desktop">
			<div class="unit-toggle-container">
				{@render unitToggle()}
			</div>
			<div class="servings">
				{@render servingsAdjuster()}
			</div>
		</div>

		<div class="section-title">Steps</div>

		<div class="servings-controls tablet">
			<div class="unit-toggle-container">
				{@render unitToggle()}
			</div>
			<div class="servings">
				{@render servingsAdjuster()}
			</div>
		</div>

		<div class="section-content">
			<div id="instructions">
				{#each [...instructions, { id: '', isAddButton: true }] as item, i (item.id)}
					<div class={'isAddButton' in item ? undefined : 'instruction-group'}>
						{#if 'isAddButton' in item}
							{@render addInstructionButton()}
						{:else}
							<div class="instruction-content">
								<div class="instruction-header">
									<div class="step-title">Step {i + 1}</div>
									{@render removeInstructionButton(item.id)}
								</div>
								<div class="instruction-content-body">
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

								<div class="instruction-ingredients">
									<h4>Ingredients for this step:</h4>
									{#each [...item.ingredients, { id: `add-ingredient-${item.id}`, isAddButton: true }] as ingredientItem (ingredientItem.id)}
										<div class="ingredient-input" in:scale animate:flip={{ duration: 200 }}>
											{#if 'isAddButton' in ingredientItem}
												{@render addIngredientButton(item.id)}
											{:else}
												{@render ingredientRow(
													ingredientItem.id,
													item.id,
													ingredientItem.name,
													ingredientItem.quantity?.text,
													ingredientItem.unit
												)}
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="section-title">Tags</div>
	<div class="section-content">
		<div class="tags">
			{@render tags()}
		</div>
	</div>

	<div class="section-title">Nutrition</div>
	<div class="section-content">
		{@render nutrition()}
	</div>

	<div class="section-title"></div>
	<div class="section-content">
		<div class="submit-section">
			{@render saveDraftButton?.()}
			{@render submitButton()}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.form-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		justify-content: center;
		gap: var(--spacing-3xl) 40px;
		margin: 0 auto;
	}

	.section-title {
		grid-column: 1;
		text-align: right;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		align-self: start;
		margin-top: var(--spacing-md);
		opacity: 0.8;
	}

	.section-content {
		grid-column: 2;
	}

	h4 {
		margin-bottom: var(--spacing-sm);
	}

	.subgrid {
		display: grid;
		grid-template-columns: subgrid;
		grid-template-rows: auto auto;
		row-gap: var(--spacing);
	}

	.servings-controls {
		grid-column: 2 / span 1;
		grid-row: 1;
		justify-self: end;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.servings {
		width: fit-content;
	}

	.header-content {
		display: flex;
		gap: var(--spacing-sm);
	}

	.text-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.description-input {
		flex: 1;
	}

	.image-content {
		flex-shrink: 0;
		width: 300px;
	}

	.submit-section {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);
	}

	.ingredients-header {
		grid-column: 1 / span 2;
		grid-row: 1;
		margin-bottom: 0;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.selected-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.remove-btn {
		padding: var(--spacing-sm);
		transition: all var(--transition-fast) var(--ease-in-out);
		border-radius: var(--border-radius-lg);
		color: white;
		border: none;
		cursor: pointer;

		&:hover {
			background-color: var(--color-secondary);
		}
	}

	.instruction-group {
		display: flex;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: var(--color-background-dark);
		border-radius: var(--border-radius-2xl);
		border: 1px solid var(--color-neutral-darker);
		position: relative;
	}

	.instruction-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.instruction-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.step-title {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
	}

	.instruction-content-body {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-sm);
		align-items: flex-start;

		@media (max-width: 600px) {
			flex-direction: column;

			.instruction-media {
				width: 100%;
				margin-bottom: var(--spacing-sm);
			}
		}
	}

	.instruction-media {
		flex-basis: 40%;
	}

	.instruction-text {
		flex: 1;
		height: 100%;
	}

	.instruction-ingredients {
		margin-top: var(--spacing-lg);
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
		&:hover {
			background-color: var(--color-background-dark);
		}

		@include tablet-desktop {
			margin-left: var(--spacing-xs);
		}
	}

	.steps-grid {
		display: grid;
		grid-template-columns: subgrid;
		row-gap: 8px;
		grid-column: 1 / span 2;
	}

	.mobile-servings {
		display: none;
		grid-column: 2;
		justify-self: end;
	}

	.unit-toggle-container {
		flex-shrink: 0;
	}

	.ingredients-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.ingredient-group {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.ingredient-input {
		flex: 1;
	}

	.tablet {
		display: none;
	}

	@media (max-width: 1000px) {
		.desktop {
			display: none;
		}

		.tablet {
			display: flex;
		}

		.servings-controls {
			margin-bottom: var(--spacing-md);
		}

		.form-grid {
			display: block;
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.steps-grid {
			display: block;
		}

		.steps-grid .section-content {
			width: 100%;
		}

		.mobile-servings {
			display: none;
		}

		.section-title {
			text-align: left;
			margin-bottom: var(--spacing-md);
			margin-top: var(--spacing-xl);
			opacity: 1;
			font-size: var(--font-size-md);
		}

		.ingredients-grid {
			display: block;
		}

		.ingredients-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: var(--spacing-md);
			margin-top: var(--spacing-md);
		}
	}

	.steps-grid .section-title {
		grid-row: 2;
		grid-column: 1;
	}

	.steps-grid .section-content {
		grid-row: 2;
		grid-column: 2;
	}
</style>
