<script lang="ts">
	import Popover from '../popover/Popover.svelte'
	import type { Snippet } from 'svelte'

	let { errors, formInput }: { errors?: string[]; formInput: Snippet<[closePopover: () => void]> } =
		$props()

	let popover: Popover

	$effect(() => {
		if (errors?.length) {
			popover.openPopover()
		}
	})

	const closePopover = () => {
		popover.closePopover()
	}
</script>

<Popover
	offset={15}
	placement="top-start"
	arrowPlacement="start"
	bind:this={popover}
	type="warning"
	triggerOn="none"
>
	{#snippet trigger()}
		{@render formInput(closePopover)}
	{/snippet}

	{#snippet content()}
		{#if errors}
			<ul class="form-error-list" class:multiple={errors.length > 1}>
				{#each errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</Popover>

<style lang="scss">
	.form-error-list {
		list-style: none;

		&.multiple {
			padding-left: var(--spacing-lg);
			list-style: disc;
		}
	}
</style>
