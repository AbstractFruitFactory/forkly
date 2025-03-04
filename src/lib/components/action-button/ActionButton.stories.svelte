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
		argTypes: {
			count: {
				control: 'number',
				description: 'Count value to display'
			},
			isActive: {
				control: 'boolean',
				description: 'Whether the button is in active state'
			},
			interactive: {
				control: 'boolean',
				description: 'Whether the button can be clicked'
			},
			icon: {
				control: 'object',
				description: 'Svelte component to use as the icon'
			},
			activeLabel: {
				control: 'text',
				description: 'Accessibility label when active'
			},
			inactiveLabel: {
				control: 'text',
				description: 'Accessibility label when inactive'
			},
			countLabel: {
				control: 'text',
				description: 'Label for the count (e.g., "likes", "bookmarks")'
			}
		}
	})
</script>

<script lang="ts">
	let isActive = false
	let count = 42
	const handleAction = () => {
		isActive = !isActive
		count = count + (isActive ? 1 : -1)
	}
</script>

<Story name="Like Button">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<ActionButton 
			count={42} 
			icon={Heart} 
			activeLabel="Unlike" 
			inactiveLabel="Like" 
			countLabel="likes"
			--active-color="var(--color-primary)"
			--active-bg-color="var(--color-primary-dark)"
		/>
	</div>
</Story>

<Story name="Bookmark Button">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<ActionButton 
			count={24} 
			icon={Bookmark} 
			activeLabel="Remove bookmark" 
			inactiveLabel="Bookmark" 
			countLabel="bookmarks"
			--active-color="var(--color-secondary)"
			--active-bg-color="var(--color-secondary-dark)"
		/>
	</div>
</Story>

<Story name="Interactive">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem;">
		<ActionButton 
			{count} 
			isActive={isActive} 
			interactive 
			onAction={handleAction} 
			icon={Star}
			activeLabel="Unstar" 
			inactiveLabel="Star" 
			countLabel="stars"
			--active-color="gold"
			--active-bg-color="#664500"
		/>
	</div>
</Story>

<Story name="Custom Colors">
	<div style="width: 300px; height: 100px; background: var(--color-neutral-darker); padding: 1rem; display: flex; gap: 1rem;">
		<ActionButton 
			count={15} 
			icon={ThumbsUp} 
			countLabel="votes"
			--active-color="#4CAF50"
			--active-bg-color="#1B5E20"
			isActive={true}
		/>
		
		<ActionButton 
			count={8} 
			icon={Heart} 
			countLabel="likes"
			--active-color="#E91E63"
			--active-bg-color="#880E4F"
			isActive={true}
		/>
		
		<ActionButton 
			count={32} 
			icon={Bookmark} 
			countLabel="saves"
			--active-color="#2196F3"
			--active-bg-color="#0D47A1"
			isActive={true}
		/>
	</div>
</Story> 