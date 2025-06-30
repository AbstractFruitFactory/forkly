<script lang="ts">
	import { goto } from '$app/navigation'
import Profile from '$lib/pages/profile/Profile.svelte'
import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

       let { data, form } = $props()

       let user: Awaited<ReturnType<typeof data.user>> | null = null
       let collections: Awaited<ReturnType<typeof data.collections>> = []
       let recipes: Awaited<ReturnType<typeof data.recipes>> = []
       let isLoading = $state(true)

       $effect(() => {
               const userPromise = data.user
               const collectionsPromise = data.collections
               const recipesPromise = data.recipes
               isLoading = true
               Promise.all([userPromise, collectionsPromise, recipesPromise]).then(
                       ([u, c, r]) => {
                               user = u
                               collections = c
                               recipes = r
                               isLoading = false
                       }
               )
       })

	async function handleLogout() {
		const response = await fetch('/api/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		if (response.ok) {
			goto('/', { invalidateAll: true })
		}
	}
</script>

{#if isLoading}
       <Skeleton height="15rem" />
{:else}
       <Profile
               user={form?.user ?? user!}
               createdRecipes={recipes}
               collections={collections}
               onLogout={handleLogout}
               initialTab={data.initialTab}
       />
{/if}
