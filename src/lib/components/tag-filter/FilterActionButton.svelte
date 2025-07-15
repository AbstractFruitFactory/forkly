<script lang="ts">
	import Check from 'lucide-svelte/icons/check'
	import Plus from 'lucide-svelte/icons/plus'
	import Minus from 'lucide-svelte/icons/minus'

	let {
		isSelected = $bindable(false),
		onClick,
		variant = 'include'
	}: {
		isSelected: boolean
		onClick: () => void
		variant: 'include' | 'exclude'
	} = $props()
</script>

<button
	type="button"
	class="action-button {variant}"
	onclick={onClick}
	aria-label={variant === 'include' ? (isSelected ? 'Remove' : 'Add') : 'Exclude'}
	data-active={isSelected}
>
	{#if variant === 'include'}
		{#if isSelected}
			<Check size={14} />
		{:else}
			<Plus size={14} />
		{/if}
	{:else}
		<Minus size={14} />
	{/if}
</button>

<style lang="scss">
	.action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid var(--color-neutral-light);
		background: none;
		cursor: pointer;
		color: var(--color-neutral-light);
		transition: all 0.2s ease;
		padding: 0;

		&:hover {
			background-color: var(--color-neutral);
		}

		&.include {
			&[data-active='true'] {
				background-color: var(--color-success);
				border-color: var(--color-success);
				color: var(--color-white);
			}
		}

		&.exclude {
			&[data-active='true'] {
				background-color: var(--color-error);
				border-color: var(--color-error);
				color: var(--color-white);
			}
		}
	}
</style>
