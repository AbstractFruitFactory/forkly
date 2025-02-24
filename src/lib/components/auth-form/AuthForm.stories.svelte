<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import AuthForm from './AuthForm.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Auth Form',
		component: AuthForm
	})
</script>

<Story name="Default" />

<Story name="With Error" args={{ error: 'Invalid username or password' }} />
