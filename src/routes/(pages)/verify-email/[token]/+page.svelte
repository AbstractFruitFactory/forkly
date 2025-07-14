<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

	let { data } = $props()

	let result = $state<any>(null)
	let isLoading = $state(true)

	onMount(() => {
		data.verification.then((r: any) => {
			result = r
			isLoading = false

			if (r.success) {
				setTimeout(() => goto('/'), 2000)
			}
		})
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
		font-family: 'Inter', sans-serif;
	}
</style>
