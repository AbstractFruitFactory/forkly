<script lang="ts">
	import { page } from '$app/state'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'
	import { getPostData } from './data.remote'
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'

	const id = $derived(page.params.id!)
	const postData = $derived(getPostData({ id }))
</script>

<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT} class="post-page">
	{#await postData}
		<Skeleton height="10rem" />
	{:then data}
		<article class="card post">
			{#if data.author}
				<div class="creator-row">
					<RecipeCreator
						profilePicUrl={data.author.avatarUrl ?? undefined}
						username={data.author.username}
						userId={data.author.id}
					/>
				</div>
			{/if}
			<div class="meta">{new Date(data.post.createdAt).toLocaleString()}</div>
			<h1>{data.post.title}</h1>
			{#if data.post.imageUrl}
				<img class="cover" src={data.post.imageUrl} alt={data.post.title} />
			{/if}
			<div class="content">{data.post.content}</div>
		</article>
	{/await}
</div>

<style lang="scss">
	.post-page {
		max-width: 720px;
		margin: 2rem auto;
	}
	.post {
		padding: var(--spacing-xl);
	}

	.creator-row {
		margin-bottom: var(--spacing-sm);
	}

	.meta {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		margin-bottom: var(--spacing-xl);
	}

	.cover {
		width: 100%;
		height: auto;
		border-radius: var(--border-radius-xl);
		margin-bottom: var(--spacing-md);
	}
	.content {
		white-space: pre-wrap;
		line-height: 1.6;
	}
</style>
