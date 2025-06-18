<script lang="ts">
	import Button from '../button/Button.svelte'

	let {
		options = [],
		onSelect = () => {},
		selected = options[0]
	} = $props<{
		options: string[]
		onSelect?: (option: string) => void
		selected?: string
	}>()

	let currentSelected = $state(selected)

	const handleSelect = (option: string) => {
		currentSelected = option
		onSelect(option)
	}
</script>

<div class="tab-select">
	{#each options as option}
		<Button
			variant="pill"
			color={currentSelected === option ? 'secondary' : 'neutral'}
			bold={currentSelected === option}
			onclick={() => handleSelect(option)}
		>
			{option}
		</Button>
	{/each}
</div>

<style lang="scss">
	.tab-select {
		display: flex;
		gap: var(--spacing-md);

		@media (max-width: 640px) {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
