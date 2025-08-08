<script lang="ts">
	import SearchFilterSelect from '../filter-select/SearchFilterSelect.svelte'
	import Carrot from 'lucide-svelte/icons/carrot'
	import FilterActionButton from '../tag-filter/FilterActionButton.svelte'

	type IngredientFilter = {
		label: string
		include: boolean
	}

	let {
		selected = $bindable<IngredientFilter[]>([]),
		onSearch
	}: {
		selected: IngredientFilter[]
		onSearch: (query: string) => Promise<string[]> | string[]
	} = $props()

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
			<Carrot size={16} color="var(--color-text-on-surface)" />
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
		height: 100%;
	}

	.ingredient-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.ingredient-label {
		color: var(--color-text-on-surface);
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
