<script lang="ts">
	import { crossfade } from 'svelte/transition'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'

	const [send, receive] = crossfade({})

	let {
		state = 'imperial',
		onSelect
	}: {
		state: UnitSystem
		onSelect: (system: UnitSystem) => void
	} = $props()
</script>

<div class="unit-toggle">
	<div style:position="relative">
		{#if state === 'metric'}
			<div in:receive={{ key: 0 }} out:send={{ key: 0 }} class="background"></div>
		{/if}
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
	</div>

	<div style:position="relative">
		{#if state === 'imperial'}
			<div in:receive={{ key: 0 }} out:send={{ key: 0 }} class="background"></div>
		{/if}
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
</div>

<style lang="scss">
	.unit-toggle {
		display: flex;
		border-radius: var(--border-radius-full);
		overflow: hidden;
		width: fit-content;
		background-color: var(--color-neutral-2);
	}

	.toggle-button {
		position: relative;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-sm);
		z-index: 2;
	}

	.background {
		background-color: var(--color-primary-dark);
		border-radius: var(--border-radius-full);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
