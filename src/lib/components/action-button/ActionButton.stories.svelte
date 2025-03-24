<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import ActionButton from './ActionButton.svelte'
	import Heart from 'lucide-svelte/icons/heart'
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import Star from 'lucide-svelte/icons/star'
	import ThumbsUp from 'lucide-svelte/icons/thumbs-up'

	const { Story } = defineMeta({
		title: 'lib/components/Action Button',
		component: ActionButton,
		tags: ['autodocs'],
	})
</script>

<script lang="ts">
	let isActive = $state(false)
	let count = $state(42)
	const handleAction = () => {
		isActive = !isActive
		count = count + (isActive ? 1 : -1)
	}
</script>

<Story name="Like Button">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<ActionButton 
				count={42} 
				icon={Heart} 
				activeLabel="Unlike" 
				inactiveLabel="Like" 
				countLabel="likes"
				--active-color="var(--color-primary)"
				--active-bg-color="var(--color-primary-dark)"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Bookmark Button">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<ActionButton 
				count={24} 
				icon={Bookmark} 
				activeLabel="Remove bookmark" 
				inactiveLabel="Bookmark" 
				countLabel="bookmarks"
				--active-color="var(--color-secondary)"
				--active-bg-color="var(--color-secondary-dark)"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Interactive">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
			<ActionButton 
				count={count} 
				isActive={isActive} 
				interactive 
				onAction={handleAction} 
				icon={Star}
				activeLabel="Unstar" 
				inactiveLabel="Star" 
				countLabel="stars"
				--active-color="gold"
				--active-bg-color="#664500"
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Custom Colors">
	{#snippet children(args)}
		<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem; display: flex; gap: 1rem;">
			<ActionButton 
				count={15} 
				icon={ThumbsUp} 
				countLabel="votes"
				--active-color="#4CAF50"
				--active-bg-color="#1B5E20"
				isActive={true}
				{...args}
			/>
			
			<ActionButton 
				count={8} 
				icon={Heart} 
				countLabel="likes"
				--active-color="#E91E63"
				--active-bg-color="#880E4F"
				isActive={true}
				{...args}
			/>
			
			<ActionButton 
				count={32} 
				icon={Bookmark} 
				countLabel="saves"
				--active-color="#2196F3"
				--active-bg-color="#0D47A1"
				isActive={true}
				{...args}
			/>
		</div>
	{/snippet}
</Story> 