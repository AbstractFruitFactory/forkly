<script>
	import { page } from '$app/state'
	import { setSlots } from './+layout.svelte'
	import Error from '$lib/pages/error/Error.svelte'

	setSlots({
		content
	})
</script>

{#snippet content()}
	<Error
		status={page.status}
		error={{
			message: page.error?.message || 'Something went wrong'
		}}
	/>
{/snippet}
