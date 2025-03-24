<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import BookmarkButton from './BookmarkButton.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Bookmark Button',
		component: BookmarkButton,
		tags: ['autodocs'],
		argTypes: {
			count: {
				control: 'number',
				description: 'Number of bookmarks'
			},
			isBookmarked: {
				control: 'boolean',
				description: 'Whether the current user has bookmarked this item'
			},
			interactive: {
				control: 'boolean',
				description: 'Whether the button can be clicked (requires user to be logged in)'
			}
		}
	})
</script>

<script lang="ts">
	let isBookmarked = $state(false)
	let count = $state(24)
	const handleBookmark = () => {
		isBookmarked = !isBookmarked
		count = count + (isBookmarked ? 1 : -1)
	}
</script>

<Story name="Static Display">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<BookmarkButton count={24} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<BookmarkButton count={count} isBookmarked={isBookmarked} interactive onBookmark={handleBookmark} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Zero Bookmarks">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<BookmarkButton count={0} {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Many Bookmarks">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<BookmarkButton count={9999} {...args} />
		</div>
	{/snippet}
</Story> 