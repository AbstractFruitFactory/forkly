<script lang="ts">
	import SearchFilterSelect from '../filter-select/SearchFilterSelect.svelte'
	import TagIcon from 'lucide-svelte/icons/tag'
	import FilterActionButton from './FilterActionButton.svelte'
	import { onMount } from 'svelte'

	type Tag = {
		label: string
		selected: boolean
	}

	let {
		selected = $bindable<Tag[]>([]),
		onSearch
	}: {
		selected: Tag[]
		onSearch: (query: string) => Promise<string[]>
	} = $props()

	let initialResults = $state<{ label: string }[]>([])
	let isLoading = $state(true)

	onMount(async () => {
		const results = await onSearch('')
		initialResults = results
			.filter((tag: string) => !selected.some((s: Tag) => s.label === tag))
			.map((tag: string) => ({ label: tag }))
		isLoading = false
	})

	const searchTags = async (query: string) => {
		const results = await onSearch(query)
		return results
			.filter((tag: string) => !selected.some((s: Tag) => s.label === tag))
			.map((tag: string) => ({ label: tag }))
	}
</script>

<div class="tag-filter">
	<SearchFilterSelect
		buttonLabel="Tags"
		searchPlaceholder="Search tags"
		bind:selected
		onSearch={searchTags}
		{initialResults}
		{isLoading}
		title="Add tags"
	>
		{#snippet icon()}
			<TagIcon size={16} />
		{/snippet}

		{#snippet filterItem(result, select)}
			{@const isSelected = selected.find((s: Tag) => s.label === result.label)?.selected ?? false}

			<div class="tag-item">
				<span class="tag-label">
					{result.label}
				</span>
				<FilterActionButton
					{isSelected}
					onClick={() => select({ selected: !isSelected })}
					variant="include"
				/>
			</div>
		{/snippet}
	</SearchFilterSelect>
</div>

<style lang="scss">
	.tag-filter {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.count {
		margin-left: var(--spacing-xs);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
	}

	.tag-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.tag-label {
		color: var(--color-white);
		font-size: var(--font-size-sm);
	}
</style>
