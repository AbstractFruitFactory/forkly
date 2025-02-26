<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import UnitToggle from './UnitToggle.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'

	const { Story } = defineMeta({
		component: UnitToggle,
		title: 'lib/components/Unit Toggle',
		tags: ['autodocs'],
		argTypes: {}
	})

	let unitSystem = $state<UnitSystem>('imperial')

	const handleUnitChange = (system: UnitSystem) => {
		unitSystem = system
	}
</script>

<Story name="Default">
	<div style="padding: 2rem;">
		<h3>Current Unit System: {unitSystem}</h3>
		<p>Click the buttons below to toggle between metric and imperial units.</p>
		<UnitToggle state={unitSystem} onSelect={handleUnitChange} />
	</div>
</Story>

<Story name="With Context">
	<div style="padding: 2rem; max-width: 600px;">
		<div style="margin-bottom: 1rem;">
			<h3>Recipe Unit Preference</h3>
			<p>Choose your preferred measurement system for viewing recipes:</p>
		</div>
		<UnitToggle state={unitSystem} onSelect={handleUnitChange} />
		<div
			style="margin-top: 1rem; padding: 1rem; background-color: var(--color-bg-alt); border-radius: var(--border-radius);"
		>
			<p>Selected system: <strong>{unitSystem}</strong></p>
			<p>Example conversions:</p>
			<ul>
				<li>{unitSystem === 'metric' ? '240 ml' : '1 cup'} of flour</li>
				<li>{unitSystem === 'metric' ? '450 g' : '1 lb'} of chicken</li>
				<li>{unitSystem === 'metric' ? '5 cm' : '2 in'} piece of ginger</li>
			</ul>
		</div>
	</div>
</Story>
