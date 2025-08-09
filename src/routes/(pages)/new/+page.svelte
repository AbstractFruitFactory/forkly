<script lang="ts">
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { TagSearchResponse } from '../../(api)/tags/+server'
	import { safeFetch } from '$lib/utils/fetch'
	import { fly } from 'svelte/transition'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { isLoggedIn } from './data.remote'

	let { form } = $props()

	let searchTimeout: ReturnType<typeof setTimeout>
	let tagSearchTimeout: ReturnType<typeof setTimeout>

	const handleSearchIngredients = async (
		query: string
	): Promise<{ id: string; name: string }[]> => {
		clearTimeout(searchTimeout)

		return new Promise((resolve) => {
			searchTimeout = setTimeout(async () => {
				const response = await safeFetch<IngredientSearchResult>()(`/ingredients/search/${query}`)
				if (response.isOk()) {
					resolve(
						response.value.map((ingredient) => ({
							id: ingredient.id.toString(),
							name: ingredient.name
						}))
					)
				} else {
					console.error('Failed to fetch ingredients:', response.error)
					resolve([])
				}
			}, 300)
		})
	}

	const handleSearchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		clearTimeout(tagSearchTimeout)

		return new Promise((resolve) => {
			tagSearchTimeout = setTimeout(async () => {
				const response = await safeFetch<TagSearchResponse>()(
					`/tags?q=${encodeURIComponent(query)}`
				)
				if (response.isOk()) {
					resolve(response.value.tags)
				} else {
					console.error('Failed to fetch tags:', response.error)
					resolve([])
				}
			}, 300)
		})
	}

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

	async function getCloudinarySignature(folder: string, resourceType: 'image' | 'video') {
		const params = new URLSearchParams({ folder, resource_type: resourceType })
		const res = await fetch(`/cloudinary/sign?${params.toString()}`)
		if (!res.ok) throw new Error('Failed to get upload signature')
		return res.json() as Promise<{
			cloudName: string
			apiKey: string
			timestamp: number
			signature: string
			folder: string
		}>
	}

	async function uploadMedia(file: File, fieldName: string) {
		const isVideo = file.type.startsWith('video/')
		const folder = fieldName.startsWith('instructions-')
			? 'instruction-media'
			: isVideo
				? 'recipe-videos'
				: 'recipe-images'
		const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image'
		const sig = await getCloudinarySignature(folder, resourceType)
		const form = new FormData()
		form.append('file', file)
		form.append('api_key', sig.apiKey)
		form.append('timestamp', String(sig.timestamp))
		form.append('signature', sig.signature)
		form.append('folder', sig.folder)
		const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`
		const resp = await fetch(uploadUrl, { method: 'POST', body: form })
		if (!resp.ok) throw new Error('Cloudinary upload failed')
		const data = await resp.json()
		return {
			url: data.secure_url as string,
			type: (isVideo ? 'video' : 'image') as 'video' | 'image'
		}
	}

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

{#if form?.success}
	<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
		<RecipeSuccess recipeId={form.recipeId!} />
	</div>
{:else}
	<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
		<NewRecipe
			errors={form?.errors}
			onSearchIngredients={handleSearchIngredients}
			onSearchTags={handleSearchTags}
			{unitSystem}
			onUnitChange={handleUnitChange}
			isLoggedIn={isLoggedIn()}
			{uploadMedia}
		/>
	</div>
{/if}
