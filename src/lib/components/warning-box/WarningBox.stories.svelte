<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import WarningBox from './WarningBox.svelte'

	const { Story } = defineMeta({
		component: WarningBox,
		title: 'lib/components/Warning Box',
		tags: ['autodocs']
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<WarningBox message="A collection with this name already exists." {...args} />
	{/snippet}
</Story>

<Story name="Long Message">
	{#snippet children(args)}
		<WarningBox 
			message="This is a much longer warning message that demonstrates how the component handles text that spans multiple lines and provides more detailed information to the user." 
			{...args} 
		/>
	{/snippet}
</Story>

<Story name="Short Message">
	{#snippet children(args)}
		<WarningBox message="Warning!" {...args} />
	{/snippet}
</Story> 