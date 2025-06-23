<script lang="ts">
	import AuthForm from '$lib/components/auth-form/AuthForm.svelte'

	let { form } = $props()
</script>

<AuthForm mode="login" error={form?.message} alternateHref="/signup" />
