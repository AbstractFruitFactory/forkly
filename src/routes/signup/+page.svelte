<script lang="ts">
	import AuthForm from '$lib/components/auth-form/AuthForm.svelte'

	let { form } = $props()

</script>

<AuthForm mode="signup" error={form?.error} alternateHref="/login" />
