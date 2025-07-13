<script lang="ts">
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

	let {
		description,
		username,
		userId,
		profilePicUrl,
		card = false,
		loading = false
	}: {
		description: string
		username: string | undefined
		userId: string | undefined
		profilePicUrl: string | undefined
		card?: boolean
		loading?: boolean
	} = $props()

	let isDescriptionExpanded = $state(false)

	const MAX_DESCRIPTION_LENGTH = 200
	const shouldTruncateDescription = description.length > MAX_DESCRIPTION_LENGTH

	const truncatedDescription = shouldTruncateDescription
		? description.slice(0, MAX_DESCRIPTION_LENGTH)
		: description

	function toggleDescription() {
		isDescriptionExpanded = !isDescriptionExpanded
	}
</script>

<div class="description" class:card>
	{#if loading}
		<div class="creator-skeleton">
			<Skeleton width="2rem" height="2rem" round={true} />
			<Skeleton width="8rem" height="1rem" />
		</div>
		<div class="divider"></div>
		<Skeleton width="100%" height="1.5rem" />
		<Skeleton width="80%" height="1.5rem" />
	{:else}
		<p>
			{isDescriptionExpanded ? description : truncatedDescription}
			{#if shouldTruncateDescription}
				<button class="view-more" onclick={toggleDescription}>
					{isDescriptionExpanded ? '- View less' : '+ View more'}
				</button>
			{/if}
		</p>
		{#if username && userId}
			<RecipeCreator {username} {userId} {profilePicUrl} />
		{/if}
	{/if}
</div>

<style lang="scss">
	.description {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		word-break: break-word;
	}

	.creator-skeleton {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

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
