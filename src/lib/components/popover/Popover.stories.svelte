<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Popover from './Popover.svelte'
	import Button from '../button/Button.svelte'

	const { Story } = defineMeta({
		component: Popover,
		tags: ['autodocs']
	})

	const placements = ['top', 'right', 'bottom', 'left'] as const
</script>

<Story name="Default">
	<div style="padding: 8rem; display: flex; justify-content: center;">
		<Popover>
			{#snippet content()}
				This is a default popover
			{/snippet}

			{#snippet trigger()}
				<Button>Click me</Button>
			{/snippet}
		</Popover>
	</div>
</Story>

<Story name="Different Placements">
	<div
		style="padding: 8rem; display: grid; gap: 2rem; grid-template-columns: repeat(4, auto); justify-content: center;"
	>
		{#each placements as placement}
			<Popover {placement}>
				{#snippet content()}
					<div style="padding: 0.5rem;">
						Placed on {placement}
					</div>
				{/snippet}

				{#snippet trigger()}
					<Button>
						{placement}
					</Button>
				{/snippet}
			</Popover>
		{/each}
	</div>
</Story>

<Story name="Warning">
	<Popover type="warning">
		{#snippet content()}
			This is a warning popover
		{/snippet}

		{#snippet trigger()}
			<Button>Click me</Button>
		{/snippet}
	</Popover>
</Story>
