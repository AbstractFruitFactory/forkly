<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Login from './Login.svelte'

	const { Story } = defineMeta({
		title: 'Pages/Login',
		component: Login,
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Default" />

<Story name="With Error" args={{ message: 'Invalid username or password' }} />
