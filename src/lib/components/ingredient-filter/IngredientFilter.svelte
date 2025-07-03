<script lang="ts">
	import SearchFilterSelect from '../filter-select/SearchFilterSelect.svelte'
	import Carrot from 'lucide-svelte/icons/carrot'
	import FilterActionButton from '../tag-filter/FilterActionButton.svelte'

	type IngredientFilter = {
		label: string
		include: boolean
	}

	let { selected = $bindable<IngredientFilter[]>([]), onSearch } = $props<{
		selected: IngredientFilter[]
		onSearch: (query: string) => Promise<string[]> | string[]
	}>()

	const searchIngredients = async (query: string) => {
		const results = await Promise.resolve(onSearch(query))
		return results.map((ingredient: string) => ({ label: ingredient }))
	}
</script>

<div class="ingredient-filter">
	<SearchFilterSelect
		buttonLabel="Ingredients"
		searchPlaceholder="Search ingredients"
		bind:selected
		onSearch={searchIngredients}
		title="Add/remove ingredients"
	>
		{#snippet icon()}
			<Carrot size={16} />
		{/snippet}
		{#snippet filterItem(result: { label: string }, select: (item: { include: boolean }) => void)}
			{@const state = selected.find((s: IngredientFilter) => s.label === result.label)}
			<div class="ingredient-item">
				<span class="ingredient-label" class:excluded={state?.include === false}>
					{result.label}
				</span>
				<div class="actions">
					<FilterActionButton
						isSelected={state?.include === true}
						onClick={() => select({ include: true })}
						variant="include"
					/>
					<FilterActionButton
						isSelected={state?.include === false}
						onClick={() => select({ include: false })}
						variant="exclude"
					/>
				</div>
			</div>
		{/snippet}
	</SearchFilterSelect>
</div>

<style lang="scss">
	.ingredient-filter {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.count {
		margin-left: var(--spacing-xs);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
	}

	.ingredient-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
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
</style>
