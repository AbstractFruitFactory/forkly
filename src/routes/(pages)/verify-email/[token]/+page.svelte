<script lang="ts">
       import { onMount } from 'svelte'
       import { goto } from '$app/navigation'
       import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
       let { data } = $props()

       let result: Awaited<ReturnType<typeof data.verification>> | null = null
       let isLoading = $state(true)

       $effect(() => {
               const p = data.verification
               isLoading = true
               p.then((r) => {
                       result = r
                       isLoading = false
               })
       })

       onMount(() => {
               if (result?.success) setTimeout(() => goto('/'), 2000)
       })
</script>

<div class="verify-email-container">
        {#if isLoading || !result}
                <Skeleton height="4rem" />
        {:else}
                <h1>{result.success ? 'Email Verified' : 'Verification Failed'}</h1>
                <p>{result.message}</p>
        {/if}
</div>

<style>
	.verify-email-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}
	h1 {
		margin-bottom: 1rem;
	}
	p {
		font-size: 1.1rem;
	}
</style>
