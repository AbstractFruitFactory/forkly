<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import AuthForm from './AuthForm.svelte'

	const { Story } = defineMeta({
		component: AuthForm
	})
</script>

<Story name="Default" />

<Story name="With Error" args={{ error: 'Invalid username or password' }} />
