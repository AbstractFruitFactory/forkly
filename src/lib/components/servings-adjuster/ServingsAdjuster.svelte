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
	<button type="button" class="adjust-button" onclick={decrement} disabled={servings <= 1}>
		<Minus size={22} color="var(--color-primary)" />
	</button>
	<span class="servings-text">Serves {servings}</span>
	<button type="button" class="adjust-button" onclick={increment}>
		<Plus size={22} color="var(--color-primary)" />
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
		background-color: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-neutral);
		height: 36px;
		width: fit-content;

		.adjust-button {
			cursor: pointer;
			color: var(--color-text-on-surface);
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
			color: var(--color-text-on-surface);
			padding: 0 var(--spacing-sm);
			white-space: nowrap;
		}
	}
</style>
