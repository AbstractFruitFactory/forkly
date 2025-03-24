<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import HamburgerMenu from './HamburgerMenu.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Hamburger Menu',
		component: HamburgerMenu,
		tags: ['autodocs'],
		argTypes: {
			isOpen: {
				control: 'boolean'
			},
			size: {
				control: {
					type: 'select',
					options: ['sm', 'md', 'lg']
				}
			},
			ariaLabel: {
				control: 'text'
			}
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<HamburgerMenu isOpen={false} size="md" ariaLabel="Toggle menu" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Open">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<HamburgerMenu isOpen={true} size="md" ariaLabel="Toggle menu" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<HamburgerMenu isOpen={false} size="sm" ariaLabel="Toggle menu" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Large">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a;">
			<HamburgerMenu isOpen={false} size="lg" ariaLabel="Toggle menu" {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Different Colors">
	{#snippet children(args)}
		<div style="padding: 20px; background-color: #1a1a1a; display: flex; gap: 20px;">
			<div style="color: #10b981;">
				<HamburgerMenu isOpen={false} size="md" ariaLabel="Toggle menu" {...args} />
			</div>
			<div style="color: #3b82f6;">
				<HamburgerMenu isOpen={false} size="md" ariaLabel="Toggle menu" {...args} />
			</div>
			<div style="color: #ef4444;">
				<HamburgerMenu isOpen={true} size="md" ariaLabel="Toggle menu" {...args} />
			</div>
		</div>
	{/snippet}
</Story> 