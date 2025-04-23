<script lang="ts">
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	export let description: string
	export let username: string | undefined
	export let userId: string | undefined
	export let profilePicUrl: string | undefined

	let isDescriptionExpanded = false
	const MAX_DESCRIPTION_LENGTH = 200
	const shouldTruncateDescription = description.length > MAX_DESCRIPTION_LENGTH

	const truncatedDescription = shouldTruncateDescription
		? description.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
		: description

	function toggleDescription() {
		isDescriptionExpanded = !isDescriptionExpanded
	}
</script>

<div class="description card">
	{#if username && userId}
		<RecipeCreator {username} {userId} {profilePicUrl} />
		<div class="divider"></div>
	{/if}

	<p>{isDescriptionExpanded ? description : truncatedDescription}</p>

	{#if shouldTruncateDescription}
		<div class="divider" style:margin="0 calc(var(--spacing-lg) * -1)"></div>
		<button class="view-more" onclick={toggleDescription}>
			{isDescriptionExpanded ? '- View less' : '+ View more'}
		</button>
	{/if}
</div>

<style lang="scss">
	.description {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.view-more {
		background: none;
		border: none;
		color: var(--color-neutral-light);
		font-size: var(--font-size-md);
		padding-top: var(--spacing-sm);
		cursor: pointer;
		font-weight: var(--font-weight-bold);

		&:hover {
			color: var(--color-text);
		}
	}

	.divider {
		height: 2px;
		background: var(--color-neutral-light);
		opacity: 0.1;
	}
</style>
