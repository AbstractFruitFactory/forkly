<script lang="ts">
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import TruncatedText from '$lib/components/truncated-text/TruncatedText.svelte'

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
		{#if description}
			<p style:word-break="break-word">
				<TruncatedText text={description} maxLength={200} />
			</p>
		{/if}
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
</style>
