<script lang="ts">
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import Trash from 'lucide-svelte/icons/trash-2'
	import Plus from 'lucide-svelte/icons/plus'
	import X from 'lucide-svelte/icons/x'
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import Input from '$lib/components/input/Input.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { IngredientRow, InstructionRow } from './NewRecipe.svelte'

	let {
		servings,
		ingredients,
		instructions,
		selectedTags,
		unitSystem,
		addIngredient,
		removeIngredient,
		addInstruction,
		removeInstruction,
		handleServingsChange,
		searchTags,
		handleTagSelect,
		removeTag,
		submitting
	}: {
		servings: number
		ingredients: IngredientRow[]
		instructions: InstructionRow[]
		selectedTags: string[]
		unitSystem: UnitSystem
		addIngredient: () => void
		removeIngredient: (id: string) => void
		addInstruction: () => void
		removeInstruction: (id: string) => void
		handleServingsChange: (newServings: number) => void
		searchTags: (query: string) => Promise<{ name: string }[]>
		handleTagSelect: (tag: string, selected: boolean) => void
		removeTag: (tag: string) => void
		submitting: boolean
	} = $props()

	type ItemWithAddButton = IngredientRow | { id: string; isAddButton: true }
	let items = $derived<ItemWithAddButton[]>([
		...ingredients,
		{ id: 'add-button', isAddButton: true }
	])

	type InstructionWithAddButton = InstructionRow | { id: string; isAddButton: true }
	let instructionItems = $derived<InstructionWithAddButton[]>([
		...instructions,
		{ id: 'add-instruction-button', isAddButton: true }
	])
</script>

<div class="form-grid">
	<div class="section-title">Title</div>
	<div class="section-content">
		<div class="header-content">
			<div class="text-content">
				<div>
					<Input>
						<input name="title" type="text" required placeholder="Enter recipe title" />
					</Input>
				</div>

				<Input>
					<textarea
						class="description-input"
						name="description"
						placeholder="Describe your recipe"
						rows="3"
					></textarea>
				</Input>
			</div>

			<div class="image-content">
				<MediaUpload name="image" type="image" previewAlt="Recipe preview" />
			</div>
		</div>
	</div>

	<div class="ingredients-grid" style="grid-column: 1 / span 2;">
		{#snippet servingsAdjuster()}
			<ServingsAdjuster {servings} onServingsChange={handleServingsChange} />
		{/snippet}

		<div class="servings">
			{@render servingsAdjuster()}
		</div>
		<div class="ingredients-title-row">
			<div class="section-title">Ingredients</div>
			<div class="mobile-servings">
				{@render servingsAdjuster()}
			</div>
		</div>
		<div class="ingredients-list" style="grid-column: 2; grid-row: 2;">
			{#each items as item, i (item.id)}
				<div
					class={'isAddButton' in item ? 'add-ingredient-button' : 'ingredient-group'}
					in:scale
					animate:flip={{ duration: 200 }}
				>
					{#if 'isAddButton' in item}
						<Button onclick={addIngredient} size="sm">
							<Plus size={16} color="var(--color-text-on-surface)" />
						</Button>
					{:else}
						<div class="ingredient-input">
							<IngredientInput
								bind:amount={item.amount}
								bind:unit={item.unit}
								bind:name={item.name}
								id={item.id}
								{unitSystem}
								canRemove={ingredients.length > 1}
								onRemove={() => removeIngredient(item.id)}
							/>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="section-title">Instructions</div>
	<div class="section-content">
		<div id="instructions">
			{#each instructionItems as item, i (item.id)}
				<div
					class={'isAddButton' in item ? 'add-instruction-button' : 'instruction-group'}
					in:scale
					animate:flip={{ duration: 200 }}
				>
					{#if 'isAddButton' in item}
						<Button onclick={addInstruction} size="sm">
							<Plus size={16} color="var(--color-text-on-surface)" />
						</Button>
					{:else}
						<div class="instruction-input">
							<div class="instruction-text">
								<Input>
									<textarea
										bind:value={item.text}
										name={`instructions-${item.id}-text`}
										placeholder="Enter instruction step"
									></textarea>
								</Input>
							</div>
							<div class="instruction-media">
								<MediaUpload name={`instructions-${item.id}-media`} />
							</div>
						</div>
						{#if instructions.length > 1}
							<button type="button" class="remove-btn" onclick={() => removeInstruction(item.id)}>
								<Trash size={16} color="var(--color-text-on-background)" />
							</button>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="section-title">Tags</div>
	<div class="section-content">
		<div class="tags">
			<div style:width="fit-content">
				<SuggestionSearch
					disabled={selectedTags.length >= 3}
					placeholder="Search for tags..."
					onSearch={searchTags}
					onSelect={(tag) => handleTagSelect(tag.name, true)}
					clearInput={true}
				/>
			</div>

			{#if selectedTags.length > 0}
				<div class="selected-tags">
					{#each selectedTags as tag (tag)}
						<div transition:scale|global={{ duration: 200 }} animate:flip={{ duration: 200 }}>
							<Button variant="pill" size="sm" onclick={() => removeTag(tag)}>
								{tag}
								<X size={14} color="var(--color-text-on-surface)" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="section-title"></div>
	<div class="section-content">
		<div class="submit-section">
			<Button loading={submitting} type="submit" color="primary">Create Recipe</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.form-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		justify-content: center;
		gap: var(--spacing-3xl) 40px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
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

	h3 {
		margin-bottom: var(--spacing-lg);
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

	.servings {
		grid-column: 2 / span 1;
		grid-row: 1;
		justify-self: end;
		width: fit-content;
	}

	.header-content {
		display: flex;
		gap: var(--spacing-xl);
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
		padding: var(--spacing-md);
		transition: all var(--transition-fast) var(--ease-in-out);
		border-radius: var(--border-radius-lg);

		&:hover {
			background-color: var(--color-background-dark);
		}
	}

	.instruction-group {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.instruction-input {
		flex: 1;
		display: flex;
		flex-direction: row;
		gap: var(--spacing-sm);

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
	}

	.ingredients-grid {
		display: grid;
		grid-template-columns: subgrid;
		row-gap: 8px;
		grid-column: 1 / span 2;
	}

	.ingredients-title-row {
		grid-column: 1 / span 2;
		grid-row: 2;
		display: grid;
		grid-template-columns: subgrid;
		align-items: center;
	}

	.mobile-servings {
		display: none;
		grid-column: 2;
		justify-self: end;
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

	@media (max-width: 1000px) {
		.form-grid {
			display: block;
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.servings {
			display: none;
		}

		.mobile-servings {
			display: block;
		}

		.section-title {
			text-align: left;
			margin-bottom: var(--spacing-md);
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

		.ingredients-title-row .section-title {
			margin-bottom: 0;
		}
	}
</style>
