<script lang="ts">
	let { text, maxLength }: { text: string; maxLength: number } = $props()

	let isExpanded = $state(false)

	const shouldTruncate = $derived(text.length > maxLength)
	const truncated = $derived(shouldTruncate ? text.slice(0, maxLength) : text)

	function toggle() {
		isExpanded = !isExpanded
	}
</script>

{isExpanded ? text : truncated}
{#if shouldTruncate}
	<button class="view-more" onclick={toggle}>
		{isExpanded ? '- View less' : '+ View more'}
	</button>
{/if}

<style lang="scss">
	.view-more {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		padding: 0;
		margin-left: 4px;
		cursor: pointer;
		text-decoration: underline;
		font-weight: var(--font-weight-bold);

		&:hover {
			color: var(--color-primary-dark);
		}
	}
</style>
