<script lang="ts">
	import { Minus, Plus } from 'lucide-svelte/icons'
	import Button from '$lib/components/button/Button.svelte'

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

<div class="servings-adjuster">
	<div class="servings-info">
		<span class="label">Servings</span>
		<span class="count">{servings}</span>
	</div>
	<div class="controls">
		<Button variant="border" size="xs" onclick={decrement} disabled={servings <= 1}>
			<Minus size={16} />
		</Button>
		<Button variant="border" size="xs" onclick={increment}>
			<Plus size={16} />
		</Button>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.servings-adjuster {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		width: 100%;
		padding: var(--spacing-md) 0;
		background: var(--color-neutral-darker);
		border-radius: var(--border-radius-md);
		margin-top: var(--spacing-md);

		.servings-info {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);

			.label {
				color: var(--color-neutral-light);
				font-size: var(--font-size-sm);
				text-transform: uppercase;
			}

			.count {
				font-weight: var(--font-weight-medium);
				color: white;
				min-width: 2ch;
				text-align: center;
			}
		}

		.controls {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}
	}
</style>
