<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	let {
		message,
		position = 'bottom',
		type = 'default'
	}: {
		message: string
		position?: 'top' | 'bottom'
		type?: 'default' | 'success' | 'error' | 'warning' | 'info'
	} = $props()

	export const trigger = () => {
		visible = true
	}

	const duration = 2000
	let visible = $state(false)

	$effect(() => {
		if (visible) {
			const timer = setTimeout(() => {
				visible = false
			}, duration)

			return () => clearTimeout(timer)
		}
	})

	const getPositionStyles = () => {
		switch (position) {
			case 'top':
				return 'top: var(--spacing-xl); bottom: auto;'
			case 'bottom':
			default:
				return 'bottom: var(--spacing-xl); top: auto;'
		}
	}

	const getTransitionY = () => {
		return position === 'top' ? -20 : 20
	}
</script>

{#if visible}
	<div
		class="toast {type}"
		style={getPositionStyles()}
		in:fly={{ y: getTransitionY(), duration: 300, easing: cubicOut }}
		out:fade={{ duration: 200 }}
	>
		<span>{message}</span>
	</div>
{/if}

<style lang="scss">
	.toast {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		z-index: var(--z-toast, 1000);
		color: white;
		max-width: 90%;
		text-align: center;
	}

	.default {
		background: var(--color-secondary, #4b5563);
	}

	.success {
		background: var(--color-success, #22c55e);
	}

	.error {
		background: var(--color-error, #ef4444);
	}

	.warning {
		background: var(--color-warning, #f59e0b);
	}

	.info {
		background: var(--color-info, #3b82f6);
	}
</style>
