<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import type { Component, ComponentProps } from 'svelte'
	import IngredientFilter from './IngredientFilter.svelte'

	type StoryProps = ComponentProps<typeof IngredientFilter>
	type IngredientItem = { label: string; include: boolean }

	const mockIngredients = ['Almonds', 'Apples', 'Bananas', 'Blackberries', 'Chicken', 'Eggs']

	const mockSearch = (query: string) => {
		return mockIngredients.filter((ingredient) =>
			ingredient.toLowerCase().includes(query.toLowerCase())
		)
	}

	const { Story } = defineMeta<Component<StoryProps>>({
		title: 'lib/components/IngredientFilter',
		component: IngredientFilter,
		tags: ['autodocs'],
		argTypes: {
			selected: {
				table: { disable: true }
			},
			onSearch: {
				table: { disable: true }
			}
		}
	})

	let selected = $state<IngredientItem[]>([])
</script>

<Story name="Default">
	{#snippet children(args)}
		start typing 'a' to see result
		<div style="padding: 20px;">
			<IngredientFilter bind:selected onSearch={mockSearch} {...args} />

			<div style="margin-top: 20px; color: #fff;">
				<div>
					Included ingredients: {selected
						.filter((i) => i.include)
						.map((i) => i.label)
						.join(', ') || 'None'}
				</div>
				<div>
					Excluded ingredients: {selected
						.filter((i) => !i.include)
						.map((i) => i.label)
						.join(', ') || 'None'}
				</div>
			</div>
		</div>
		<div class="height-div"></div>
	{/snippet}
</Story>

<Story name="With Pre-selected Items">
	{#snippet children(args)}
		<div style="padding: 20px;">
			<IngredientFilter
				selected={[
					{ label: 'Almonds', include: true },
					{ label: 'Eggs', include: false }
				]}
				onSearch={mockSearch}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Interactive Example">
	{#snippet children(args)}
		<div style="padding: 20px;">
			<IngredientFilter bind:selected onSearch={mockSearch} {...args} />

			<div style="margin-top: 20px; color: #fff;">
				<h3 style="margin-bottom: 10px;">Selected Ingredients:</h3>
				<div class="ingredient-list">
					{#each selected as item}
						<div class="ingredient-tag" class:excluded={!item.include}>
							<span>{item.label}</span>
							<span class="status">{item.include ? '✓' : '✕'}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style lang="scss">
	.height-div {
		height: 10rem;
	}
	.ingredient-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.ingredient-tag {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--color-success-dark);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-sm);

		&.excluded {
			background-color: var(--color-error-dark);
		}

		.status {
			opacity: 0.7;
		}
	}
</style>
