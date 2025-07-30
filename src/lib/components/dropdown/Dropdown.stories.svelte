<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Dropdown from './Dropdown.svelte'
	import type { Component, ComponentProps } from 'svelte'

	type StoryProps = ComponentProps<typeof Dropdown>

	const { Story } = defineMeta<Component<StoryProps>>({
		title: 'lib/components/Dropdown',
		component: Dropdown,
		tags: ['autodocs'],
		argTypes: {
			isOpen: { table: { disable: true } },
			nbrOfItems: { table: { disable: true } },
			hasHighlight: { table: { disable: true } },
			dropdownContent: { table: { disable: true } }
		}
	})

	let isOpen = $state(false)
</script>

<Story name="Default">
	{#snippet children(args)}
		<div class="wrapper">
			<button onclick={() => (isOpen = !isOpen)}>
				Toggle Dropdown

				<Dropdown bind:isOpen nbrOfItems={3} {...args}>
					{#snippet dropdownContent(item)}
						{#snippet item1()}Item 1{/snippet}
						{#snippet item2()}Item 2{/snippet}
						{#snippet item3()}Item 3{/snippet}

						{@render item(item1, () => console.log('Item 1 clicked'), 0)}
						{@render item(item2, () => console.log('Item 2 clicked'), 1)}
						{@render item(item3, () => console.log('Item 3 clicked'), 2)}
					{/snippet}
				</Dropdown>
			</button>
		</div>
	{/snippet}
</Story>

<Story name="With Search">
	{#snippet children(args)}
		<div class="wrapper">
			<button onclick={() => (isOpen = !isOpen)}>
				Toggle Dropdown

				<Dropdown bind:isOpen nbrOfItems={3} {...args}>
					{#snippet dropdownContent(item)}
						<div class="search-container">
							<input type="text" class="search-input" placeholder="Search..." />
						</div>

						{#snippet searchItem1()}Searchable Item 1{/snippet}
						{#snippet searchItem2()}Searchable Item 2{/snippet}
						{#snippet searchItem3()}Searchable Item 3{/snippet}

						{@render item(searchItem1, () => console.log('Searchable Item 1 clicked'), 0)}
						{@render item(searchItem2, () => console.log('Searchable Item 2 clicked'), 1)}
						{@render item(searchItem3, () => console.log('Searchable Item 3 clicked'), 2)}
					{/snippet}
				</Dropdown>
			</button>
		</div>
	{/snippet}
</Story>

<Story name="Custom Content">
	{#snippet children(args)}
		<div class="wrapper">
			<button onclick={() => (isOpen = !isOpen)}>
				Toggle Dropdown

				<Dropdown bind:isOpen nbrOfItems={1} {...args}>
					{#snippet dropdownContent(item)}
						<div class="custom-content">
							<h3>Custom Header</h3>
							<p>This is a custom dropdown content with any HTML structure you want.</p>
							{#snippet customButton()}<button class="custom-button">Custom Action</button>{/snippet}
							{@render item(customButton, () => console.log('Custom action clicked'), 0)}
						</div>
					{/snippet}
				</Dropdown>
			</button>
		</div>
	{/snippet}
</Story>

<style lang="scss">
	.wrapper {
		height: 15rem;
	}
	.search-container {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-neutral);
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm);

		border: none;
		color: var(--color-white);
		font-size: var(--font-size-sm);

		&:focus {
			outline: none;
		}
	}

	.custom-content {
		padding: var(--spacing-md);
		color: var(--color-white);

		h3 {
			margin: 0 0 var(--spacing-sm);
			font-size: var(--font-size-lg);
		}

		p {
			margin: 0 0 var(--spacing-md);
			color: var(--color-neutral-light);
		}

		.custom-button {
			background: var(--color-primary);
			color: var(--color-white);
			border: none;
			padding: var(--spacing-sm) var(--spacing-md);
			border-radius: var(--border-radius-sm);
			cursor: pointer;

			&:hover {
				background: var(--color-primary-dark);
			}
		}
	}
</style>
