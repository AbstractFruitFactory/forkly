<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fly } from 'svelte/transition'
	import {
		FLY_LEFT_IN_LONG,
		FLY_LEFT_IN,
		FLY_LEFT_OUT,
		FLY_DOWN_IN,
		FLY_DOWN_OUT
	} from '$lib/utils/transitions'

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
		<div class="action-buttons" in:fly|global={FLY_LEFT_IN_LONG} out:fly|global={FLY_LEFT_OUT}>
			{@render actionButtons()}
		</div>
	</div>

	<div class="main-content">
		<div class="content-grid">
			<div class="recipe-info" in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
				<div class="recipe-info-meta">
					<div class="tags-and-action-buttons">
						<div class="tags">
							{@render tags()}
						</div>
					</div>

					{@render title()}
					{@render description()}
				</div>
				{@render nutrition()}

				<div class="ingredients">
					{@render ingredients()}
				</div>
			</div>

			<div class="right-column" in:fly|global={FLY_DOWN_IN} out:fly|global={FLY_LEFT_OUT}>
				<div class="recipe-media">
					{@render image()}
				</div>
				{@render instructions()}
			</div>
		</div>
		<div class="comments-section" in:fly|global={FLY_DOWN_IN} out:fly|global={FLY_DOWN_OUT}>
			{@render comments()}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.desktop-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-3xl);
		background: var(--color-background);
	}

	.main-content {
		position: relative;
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.5fr);
		gap: var(--spacing-xl);
	}

	.right-column {
		display: flex;
		flex-direction: column;
	}

	.recipe-info {
		display: flex;
		flex-direction: column;
	}

	.recipe-info-meta {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
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
		top: var(--spacing-3xl);
		height: fit-content;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		align-items: center;
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
		border-radius: var(--border-radius-2xl);

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
