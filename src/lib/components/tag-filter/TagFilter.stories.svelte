<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import TagFilter from './TagFilter.svelte'

	type Tag = { label: string; selected?: boolean }

	const mockTags = [
		'5 ingredient or fewer',
		'Under 30 mins',
		'One pot meals',
		'Sheet-pan dinners',
		'Weeknight meals',
		'Gluten-free'
	]

	const mockSearch = (query: string) => {
		return Promise.resolve(
			mockTags.filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
		)
	}

	const { Story } = defineMeta({
		title: 'lib/components/TagFilter',
		component: TagFilter,
		tags: ['autodocs']
	})

	let selected = $state<Tag[]>([])
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 20px; ">
			<TagFilter bind:selected onSearch={mockSearch} {...args} />

			<div style="margin-top: 20px; color: #fff;">
				<div>
					Selected tags: {selected
						.filter((t) => t.selected)
						.map((t) => t.label)
						.join(', ') || 'None'}
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style lang="scss">
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--color-success-dark);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-sm);

		.status {
			opacity: 0.7;
		}
	}
</style>
