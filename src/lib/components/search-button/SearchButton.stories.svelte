<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import SearchButton from './SearchButton.svelte'

	const { Story } = defineMeta({
		component: SearchButton,
		title: 'lib/components/SearchButton',
		tags: ['autodocs'],
		argTypes: {
			expanded: {
				table: { disable: true }
			},
			value: {
				table: { disable: true }
			},
			placeholder: {
				table: { disable: true }
			},
			isLoading: {
				table: { disable: true }
			},
			inputElement: {
				table: { disable: true }
			},
			wrapperElement: {
				table: { disable: true }
			},
			onInput: {
				table: { disable: true }
			},
			onConfirm: {
				table: { disable: true }
			},
			onBlur: {
				table: { disable: true }
			},
			actionButton: {
				table: { disable: true }
			},
			formName: {
				table: { disable: true }
			},
			disabled: {
				table: { disable: true }
			},
			showSearchIcon: {
				table: { disable: true }
			},
			clearButton: {
				table: { disable: true }
			},
			roundedCorners: {
				table: { disable: true }
			}
		}
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<SearchButton {...args} />
	{/snippet}
</Story>
