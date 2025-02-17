<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Login from './Login.svelte'

	const { Story } = defineMeta({
		component: Login
	})
</script>

<Story name="Default" />

<Story name="With Error" args={{ message: 'Invalid username or password' }} />
