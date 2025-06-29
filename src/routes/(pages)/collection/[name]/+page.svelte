<script lang="ts">
       import Collection from '$lib/pages/collection/Collection.svelte'
       import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

       let { data } = $props()

       let recipes: Awaited<ReturnType<typeof data.recipes>> = []
       let collections: Awaited<ReturnType<typeof data.collections>> = []
       let isLoading = $state(true)

       $effect(() => {
               const rp = data.recipes
               const cp = data.collections
               isLoading = true
               Promise.all([rp, cp]).then(([r, c]) => {
                       recipes = r
                       collections = c
                       isLoading = false
               })
       })
</script>

{#if isLoading}
       <Skeleton height="10rem" />
{:else}
       <Collection name={data.name} recipes={recipes} collections={collections} />
{/if}
