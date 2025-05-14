<script lang="ts">
	import Minus from 'lucide-svelte/icons/minus'
	import Plus from 'lucide-svelte/icons/plus'

	let { servings, onServingsChange } = $props<{
		servings: number
		onServingsChange: (newServings: number) => void
	}>()

	function increment() {
		onServingsChange(servings + 1)
	}

	function decrement() {
		if (servings > 1) {
			onServingsChange(servings - 1)
		}
	}
</script>

<div class="servings-pill">
	<button class="adjust-button" onclick={decrement} disabled={servings <= 1}>
		<Minus size={22} color="var(--color-secondary)" />
	</button>
	<span class="servings-text">Serves {servings}</span>
	<button class="adjust-button" onclick={increment}>
		<Plus size={22} color="var(--color-secondary)" />
	</button>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.servings-pill {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-full);
		background-color: var(--color-neutral-dark);

		.adjust-button {
			cursor: pointer;
			color: var(--color-text-secondary);
			display: flex;
			align-items: center;
			justify-content: center;

			&:hover:not(:disabled) {
				background-color: var(--color-background-hover);
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}

		.servings-text {
			font-size: var(--font-size-sm);
			color: var(--color-text-secondary);
			padding: 0 var(--spacing-sm);
			white-space: nowrap;
		}
	}
</style>
