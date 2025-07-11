<script lang="ts">
        import { goto} from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../api/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../api/recipes/save/+server.js'
	import type { CollectionsResponse } from '../../../api/collections/+server.js'
	
        const COMMENTS_PER_PAGE = 10

        let { data } = $props()
        let comments = $state(data.comments)
        let currentPage = $state(parseInt(page.url.searchParams.get('page') || '0', 10))
        let hasMore = $state(false)

        $effect(() => {
                data.comments.then((c) => {
                        hasMore = c.length === COMMENTS_PER_PAGE
                })
        })

	const handleLike = async () => {
		await safeFetch<RecipesLikeResponse>()(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: (await data.recipe).id })
		})
	}

	const handleSave = async (collectionName?: string) => {
		await safeFetch<RecipesSaveResponse>()(`/api/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: (await data.recipe).id, collectionName })
		})
	}

	const createCollection = async (name: string) => {
		await safeFetch<CollectionsResponse>()(`/api/collections`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name })
		})
	}

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

        const loadPage = async (pageNum: number) => {
                const result = await safeFetch<{ id: string; content: string; createdAt: string | Date; imageUrl?: string | null; user: { id: string; username: string; avatarUrl: string | null; }[] }>()(`/api/recipes/${(await data.recipe).id}/comments?page=${pageNum}`)
                if (result.isOk()) {
                        comments = Promise.resolve(result.value)
                        hasMore = result.value.length === COMMENTS_PER_PAGE
                        currentPage = pageNum
                        goto(`?page=${pageNum}`, { replaceState: true, keepfocus: true, noScroll: true })
                }
        }

        const nextPage = async () => {
                if (!hasMore) return
                await loadPage(currentPage + 1)
        }

        const prevPage = async () => {
                if (currentPage === 0) return
                await loadPage(currentPage - 1)
        }

        const handleCommentAdded = async () => {
                await loadPage(0)
        }
	
	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<div class="recipe-page" data-page="recipe">
	<Recipe
		recipe={data.recipe}
		nutritionInfo={{
			totalNutrition: data.recipe.nutrition,
			hasCustomIngredients: false
		}}
		{unitSystem}
		onUnitChange={handleUnitChange}
		onLike={handleLike}
		onSave={handleSave}
		onBackClick={() => goto('/')}
		onCreateCollection={createCollection}
                isLoggedIn={!!data.user}
                collections={data.collections.then((c) => c.map((c) => c.name))}
                recipeComments={comments}
                formError={page.form?.error}
                onCommentAdded={handleCommentAdded}
                page={currentPage}
                hasMore={hasMore}
                onNextPage={nextPage}
                onPrevPage={prevPage}
        />
</div>
