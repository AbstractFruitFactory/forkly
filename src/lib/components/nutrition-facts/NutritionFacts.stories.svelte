<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import NutritionFacts from './NutritionFacts.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Nutrition Facts',
		component: NutritionFacts,
		tags: ['autodocs'],
		argTypes: {
			// @ts-expect-error
			protein: {
				control: 'number'
			},
			carbs: {
				control: 'number'
			},
			fat: {
				control: 'number'
			},
			calories: {
				control: 'number'
			},
			nutrition: {
				table: { disable: true }
			}
		}
	})

	const mockNutrition = {
		calories: 450,
		protein: 30,
		carbs: 45,
		fat: 15
	}
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; ">
			<NutritionFacts
				nutrition={(args as any).calories ||
				(args as any).protein ||
				(args as any).carbs ||
				(args as any).fat
					? {
							calories: (args as any).calories ?? 0,
							protein: (args as any).protein ?? 0,
							carbs: (args as any).carbs ?? 0,
							fat: (args as any).fat ?? 0
						}
					: mockNutrition}
				{...args}
			/>
		</div>
	{/snippet}
</Story>
