<script lang="ts">
	import Utensils from 'lucide-svelte/icons/utensils'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import ImageOff from 'lucide-svelte/icons/image-off'

	let {
		size = 'medium',
		className = '',
		loading = false,
		broken = false
	}: {
		size?: 'small' | 'medium' | 'large'
		className?: string
		loading?: boolean
		broken?: boolean
	} = $props()

	const iconSize = $derived(
		{
			small: 24,
			medium: 32,
			large: 48
		}[size]
	)
</script>

<div
	class="recipe-image-placeholder {className}"
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
>
	{#if loading}
		<Skeleton width="100%" height="100%" />
	{:else}
		{#if broken}
			<ImageOff size={iconSize} strokeWidth={1.5} />
		{:else}
			<Utensils size={iconSize} strokeWidth={1.5} />
		{/if}
	{/if}
</div>

<style lang="scss">
	.recipe-image-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.5);
		width: 100%;
		height: 100%;
		min-height: 200px;
		background: linear-gradient(135deg, var(--color-neutral-dark), var(--color-neutral));

		:global(svg) {
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		}

		&.small {
			background: var(--color-neutral-2);
		}

		&.medium {
			background: linear-gradient(135deg, var(--color-neutral-dark), var(--color-neutral));
		}

		&.large {
			background-color: var(--color-neutral-2);
		}
	}
</style>
