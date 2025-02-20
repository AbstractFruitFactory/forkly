<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import About from './About.svelte'

	const { Story } = defineMeta({
		title: 'lib/pages/About',
		component: About,
		parameters: {
			layout: 'fullscreen'
		}
	})
</script>

<Story name="Default" />
