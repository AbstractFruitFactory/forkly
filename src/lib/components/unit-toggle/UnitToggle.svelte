<script lang="ts">
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'

	let {
		state = 'imperial',
		onSelect
	}: {
		state: UnitSystem
		onSelect: (system: UnitSystem) => void
	} = $props()
</script>

<div class="unit-toggle">
	<button
		class="toggle-button metric"
		class:active={state === 'metric'}
		onclick={() => {
			state = 'metric'
			onSelect('metric')
		}}
	>
		Metric
	</button>
	<button
		class="toggle-button imperial"
		class:active={state === 'imperial'}
		onclick={() => {
			state = 'imperial'
			onSelect('imperial')
		}}
	>
		US
	</button>
</div>

<style lang="scss">
	.unit-toggle {
		display: flex;
		border-radius: var(--border-radius-full);
		overflow: hidden;
		border: 1px solid var(--color-neutral);
		width: fit-content;
	}

	.toggle-button {
		padding: var(--spacing-xs) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-bg-hover);
		}

		&.active {
			background-color: var(--color-primary-dark);
			color: white;

			&:hover {
				background-color: var(--color-primary-dark);
			}
		}
	}
</style>
