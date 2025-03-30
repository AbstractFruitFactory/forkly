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
		<Minus size={14} />
	</button>
	<span class="servings-text">Serves {servings}</span>
	<button class="adjust-button" onclick={increment}>
		<Plus size={14} />
	</button>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.servings-pill {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-xs) var(--spacing-md);
		border: 1px solid var(--color-neutral);
		border-radius: var(--border-radius-full);
		background-color: var(--color-background);
		width: fit-content;

		.adjust-button {
			border: 2px solid var(--color-neutral-light);
			cursor: pointer;
			color: var(--color-text-secondary);
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			width: 16px;
			height: 16px;

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
			font-weight: var(--font-weight-bold);
			color: var(--color-text-secondary);
			padding: 0 var(--spacing-sm);
			white-space: nowrap;
		}
	}
</style>
