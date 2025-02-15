<script lang="ts">
	import Login from '$lib/pages/login/Login.svelte'

	let { form } = $props()
</script>

<Login message={form?.message} />
