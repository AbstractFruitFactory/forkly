<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		image,
		tags,
		title,
		actionButtons,
		description,
		nutrition,
		ingredients,
		instructions,
		comments
	}: {
		image: Snippet
		tags: Snippet
		title: Snippet
		actionButtons: Snippet
		description: Snippet
		nutrition: Snippet
		ingredients: Snippet
		instructions: Snippet
		comments: Snippet
	} = $props()
</script>

<div class="desktop-layout">
	<div class="sidebar">
		<div class="action-buttons">
			{@render actionButtons()}
		</div>
	</div>

	<div class="main-content">
		<div class="content-grid">
			<div class="recipe-info">
				<div class="tags-and-action-buttons">
					<div class="tags">
						{@render tags()}
					</div>
				</div>

				{@render title()}
				{@render description()}
				{@render nutrition()}

				<div class="ingredients">
					{@render ingredients()}
				</div>
			</div>

			<div class="right-column">
				<div class="recipe-media card">
					{@render image()}
				</div>
				{@render instructions()}
			</div>
		</div>
		<div class="comments-section">
			{@render comments()}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.desktop-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-xl);
		background: var(--color-background);
	}

	.main-content {
		position: relative;
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.5fr);
		gap: var(--spacing-lg);
	}

	.card {
		background: var(--color-neutral-dark);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-md);
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.recipe-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.tags-and-action-buttons {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.sidebar {
		position: sticky;
		top: var(--spacing-md);
		height: fit-content;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		align-items: center;
		margin-top: var(--spacing-xl);
	}

	.ingredients {
		position: sticky;
		top: var(--spacing-md);
		height: fit-content;
	}

	.recipe-media {
		padding: 0;
		overflow: hidden;
		height: 400px;
		width: 100%;
		border-radius: var(--border-radius-lg);

		:global(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.comments-section {
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: var(--spacing-xl);
	}
</style>
