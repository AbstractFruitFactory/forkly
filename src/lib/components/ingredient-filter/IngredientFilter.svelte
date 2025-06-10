<script lang="ts">
	import SearchFilterSelect from '../filter-select/SearchFilterSelect.svelte'
	import { Plus, Minus, Check } from 'lucide-svelte'
	import Carrot from 'lucide-svelte/icons/carrot'

	type IngredientFilter = {
		label: string
		include: boolean
	}

	let {
		selected = $bindable<IngredientFilter[]>([]),
		onSearch,
		onSelect
	} = $props<{
		selected: IngredientFilter[]
		onSearch: (query: string) => Promise<string[]> | string[]
		onSelect?: (ingredient: IngredientFilter) => void
	}>()

	const searchIngredients = async (query: string) => {
		const results = await Promise.resolve(onSearch(query))
		return results.map((ingredient: string) => ({ label: ingredient }))
	}

	const handleSelect = (ingredient: { label: string }, include: boolean) => {
		if (onSelect) {
			onSelect({ ...ingredient, include })
		}
	}
</script>

<div class="ingredient-filter">
	<SearchFilterSelect
		buttonLabel={selected.length
			? `Add/remove ingredient (${selected.length})`
			: 'Add/remove ingredient'}
		searchPlaceholder="Search ingredients"
		bind:selected
		onSearch={searchIngredients}
	>
		{#snippet icon()}
			<Carrot size={16} />
		{/snippet}
		{#snippet item(result: { label: string }, select: (item: { include: boolean }) => void)}
			{@const state = selected.find((s: IngredientFilter) => s.label === result.label)}
			<div class="ingredient-item">
				<span class="ingredient-label" class:excluded={state?.include === false}>
					{result.label}
				</span>
				<div class="actions">
					<button
						type="button"
						class="action-button include"
						onclick={() => {
							select({ include: true })
							handleSelect(result, true)
						}}
						aria-label="Include ingredient"
						data-active={state?.include === true}
					>
						{#if state?.include === true}
							<Check size={14} />
						{:else}
							<Plus size={14} />
						{/if}
					</button>
					<button
						type="button"
						class="action-button exclude"
						onclick={() => {
							select({ include: false })
							handleSelect(result, false)
						}}
						aria-label="Exclude ingredient"
						data-active={state?.include === false}
					>
						<Minus size={14} />
					</button>
				</div>
			</div>
		{/snippet}
	</SearchFilterSelect>
</div>

<style lang="scss">
	.ingredient-filter {
		display: inline-block;
	}

	.ingredient-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-xs) var(--spacing-sm);
	}

	.ingredient-label {
		color: var(--color-white);
		font-size: var(--font-size-sm);

		&.excluded {
			text-decoration: line-through;
			color: var(--color-error);
		}
	}

	.actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid var(--color-neutral-light);
		background: none;
		cursor: pointer;
		color: var(--color-neutral-light);
		transition: all 0.2s ease;
		padding: 0;

		&:hover {
			background-color: var(--color-neutral);
		}

		&.include {
			&[data-active='true'] {
				background-color: var(--color-success);
				border-color: var(--color-success);
				color: var(--color-white);
			}
		}

		&.exclude {
			&[data-active='true'] {
				background-color: var(--color-error);
				border-color: var(--color-error);
				color: var(--color-white);
			}
		}
	}
</style>
