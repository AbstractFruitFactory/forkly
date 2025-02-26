<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import Popup from './Popup.svelte'
	import Button from '../button/Button.svelte'

	const { Story } = defineMeta({
		component: Popup,
		tags: ['autodocs']
	})
</script>

<script lang="ts">
	let isBasicPopupOpen = false

	const toggleBasicPopup = () => {
		isBasicPopupOpen = !isBasicPopupOpen
	}
</script>

<Story name="Default">
	<div style="padding: 2rem;">
		<Button onclick={toggleBasicPopup}>Open Basic Popup</Button>

		<Popup isOpen={isBasicPopupOpen} onClose={toggleBasicPopup} title="Basic Popup">
			<p>This is a basic popup with a title and close button.</p>
			<p>Click outside or press ESC to close.</p>
		</Popup>
	</div>
</Story>
