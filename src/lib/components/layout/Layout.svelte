<script lang="ts">
	import type { Snippet } from 'svelte'

	let { header, content } = $props<{
		header: Snippet
		content: Snippet
	}>()
</script>

<div class="layout">
	<header class="header">
		<div class="header-background"></div>
		<div class="container">
			{@render header()}
		</div>
	</header>
	<main class="main">
		<div class="container">
			{@render content()}
		</div>
	</main>
</div>

<style lang="scss">
	.layout {
		min-height: 100vh;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.header {
		position: relative;
	}

	.header-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-neutral-dark);
		border-bottom: 1px solid var(--color-neutral);
		box-shadow: var(--shadow-sm);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		position: relative;
	}

	.main {
		flex: 1;
		overflow-y: auto;

		.container {
			padding-top: 2rem;
			padding-bottom: 2rem;
		}
	}
</style>
