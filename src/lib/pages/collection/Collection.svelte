<script lang="ts">
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import { fly } from 'svelte/transition'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import ArrowLeftIcon from 'lucide-svelte/icons/arrow-left'
	import { safeFetch } from '$lib/utils/fetch'
	import { invalidateAll } from '$app/navigation'

	let {
		name,
		recipes,
		collections = []
	}: { name: string; recipes: DetailedRecipe[]; collections?: string[] } = $props()

	let moveOpen = $state(false)
	let selectedRecipeId: string | null = null

	const handleDelete = async (recipeId: string) => {
		await safeFetch<{ saved: boolean }>()('/api/recipes/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: recipeId })
		})
		invalidateAll()
	}

	const handleMove = async (recipeId: string, collectionName?: string) => {
		await safeFetch<{ success: true }>()('/api/recipes/move', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: recipeId, collectionName })
		})
		moveOpen = false
		selectedRecipeId = null
		invalidateAll()
	}

	const openMovePopup = (recipeId: string) => {
		selectedRecipeId = recipeId
		moveOpen = true
	}

	const getMenuOptions = (recipeId: string) => {
		const options: { [key: string]: () => void } = {}

		if (name !== 'All Recipes') {
			options['Move'] = () => {
				openMovePopup(recipeId)
			}
		}

		options['Remove'] = () => {
			handleDelete(recipeId)
		}

		return options
	}
</script>

<div class="collection" in:fly={FLY_LEFT_IN} out:fly={FLY_LEFT_OUT}>
	<a class="back-button" href="/profile?tab=Saved recipes">
		<ArrowLeftIcon size={18} />
		<span>Back to saved recipes</span>
	</a>

	<h1>{name}</h1>

	<CardGrid items={recipes} useAnimation={false} emptyMessage="No recipes in this collection.">
		{#snippet item(recipe)}
			<RecipeCard menu={{ options: getMenuOptions(recipe.id) }} {recipe} />
		{/snippet}
	</CardGrid>
</div>

<Popup isOpen={moveOpen} onClose={() => (moveOpen = false)} title="Move Recipe" width="300px">
	<div class="collections-list">
		{#each collections.filter((c) => c !== name && c !== 'All Recipes') as collection}
			<button
				class="collection-item"
				onclick={() => selectedRecipeId && handleMove(selectedRecipeId, collection)}
			>
				<div class="collection-item-name">{collection}</div>
			</button>
		{/each}
	</div>
</Popup>

<style lang="scss">
	.collection {
		position: relative;
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: none;
		border: none;
		color: var(--color-neutral);
		cursor: pointer;
		padding: var(--spacing-xs) 0;
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
		transition: color var(--transition-fast) var(--ease-in-out);
	}

	.collections-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.collection-item {
		display: flex;
		align-items: center;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: background var(--transition-fast) var(--ease-in-out);
		cursor: pointer;
		background: none;
		border: none;
		color: var(--color-white);
		width: 100%;
		text-align: left;

		&:hover {
			background: var(--color-neutral);
		}
	}
</style>
