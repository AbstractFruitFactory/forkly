<script lang="ts">
	import SearchFilterSelect from '../filter-select/SearchFilterSelect.svelte'
	import { Plus, Check } from 'lucide-svelte'
	import TagIcon from 'lucide-svelte/icons/tag'
	import { onMount } from 'svelte'

	type Tag = {
		label: string
		selected: boolean
	}

	let {
		selected = $bindable<Tag[]>([]),
		onSearch,
		onSelect
	}: {
		selected: Tag[]
		onSearch: (query: string) => Promise<string[]>
		onSelect?: (tag: Tag) => void
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

	const handleSelect = (tag: { label: string }, selected: boolean) => {
		if (onSelect) {
			onSelect({ ...tag, selected })
		}
	}
</script>

<div class="tag-filter">
	<SearchFilterSelect
		buttonLabel={selected.length ? `Add tag (${selected.length})` : 'Add tag'}
		searchPlaceholder="Search tags"
		bind:selected
		onSearch={searchTags}
		{initialResults}
		{isLoading}
	>
		{#snippet icon()}
			<TagIcon size={16} />
		{/snippet}

		{#snippet item(result, select)}
			{@const isSelected = selected.find((s: Tag) => s.label === result.label)?.selected ?? false}

			<div class="tag-item">
				<span class="tag-label">
					{result.label}
				</span>
				<button
					type="button"
					class="action-button"
					onclick={() => {
						select({ selected: isSelected })
						handleSelect(result, isSelected)
					}}
					aria-label={isSelected ? 'Remove tag' : 'Add tag'}
					data-active={isSelected}
				>
					{#if isSelected}
						<Check size={16} />
					{:else}
						<Plus size={16} />
					{/if}
				</button>
			</div>
		{/snippet}
	</SearchFilterSelect>
</div>

<style lang="scss">
	.tag-filter {
		display: inline-block;
	}

	.tag-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-xs) var(--spacing-sm);
		cursor: pointer;

		&:hover {
			background-color: var(--color-neutral);
		}
	}

	.tag-label {
		color: var(--color-white);
		font-size: var(--font-size-sm);
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

		&[data-active='true'] {
			background-color: var(--color-success);
			border-color: var(--color-success);
			color: var(--color-white);
		}
	}
</style>
