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
			isOpen: { control: 'boolean' }
		}
	})

	let isOpen = $state(false)
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px; background-color: #1a1a1a; position: relative;">
			<button onclick={() => (isOpen = !isOpen)}>Toggle Dropdown</button>
			<Dropdown bind:isOpen {...args}>
				<div class="dropdown-content">
					<div class="dropdown-item">Item 1</div>
					<div class="dropdown-item">Item 2</div>
					<div class="dropdown-item">Item 3</div>
				</div>
			</Dropdown>
		</div>
	{/snippet}
</Story>

<Story name="With Search">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px; background-color: #1a1a1a; position: relative;">
			<button onclick={() => (isOpen = !isOpen)}>Toggle Dropdown</button>
			<Dropdown bind:isOpen {...args}>
				<div class="search-container">
					<input type="text" class="search-input" placeholder="Search..." />
				</div>
				<div class="dropdown-content">
					<div class="dropdown-item">Searchable Item 1</div>
					<div class="dropdown-item">Searchable Item 2</div>
					<div class="dropdown-item">Searchable Item 3</div>
				</div>
			</Dropdown>
		</div>
	{/snippet}
</Story>

<Story name="Custom Content">
	{#snippet children(args)}
		<div style="width: 300px; padding: 20px; background-color: #1a1a1a; position: relative;">
			<button onclick={() => (isOpen = !isOpen)}>Toggle Dropdown</button>
			<Dropdown bind:isOpen {...args}>
				<div class="custom-content">
					<h3>Custom Header</h3>
					<p>This is a custom dropdown content with any HTML structure you want.</p>
					<button class="custom-button">Custom Action</button>
				</div>
			</Dropdown>
		</div>
	{/snippet}
</Story>

<style lang="scss">
	.dropdown-content {
		max-height: 200px;
		overflow-y: auto;
	}

	.dropdown-item {
		padding: var(--spacing-sm) var(--spacing-md);
		cursor: pointer;
		transition: background-color var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-neutral);
		}
	}

	.search-container {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-neutral);
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm);
		background-color: var(--color-neutral-dark);
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
