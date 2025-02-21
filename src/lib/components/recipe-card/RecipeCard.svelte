<script lang="ts">
	import { List, Timer } from 'lucide-svelte'

	interface Recipe {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
	}

	let { recipe }: { recipe: Recipe } = $props()
</script>

<a href="/recipe/{recipe.id}" class="recipe-card">
	{#if recipe.imageUrl}
		<div class="image-container">
			<img src={recipe.imageUrl} alt={recipe.title} />
		</div>
	{/if}
	<div class="content">
		<h2>{recipe.title}</h2>
		{#if recipe.description}
			<p class="description">{recipe.description}</p>
		{/if}
		<div class="meta">
			<span><List size={16} />{recipe.ingredients} ingredients</span>
			<span><Timer size={16} />{recipe.instructions} steps</span>
		</div>
	</div>
</a>

<style>
	.recipe-card {
		display: block;
		border-radius: var(--border-radius-lg);
		background: var(--color-neutral-dark);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		overflow: hidden;
		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out),
			border-color var(--transition-fast) var(--ease-out);
	}

	.recipe-card:hover {
		transform: translateY(calc(var(--spacing-xs) * -1));
		box-shadow: var(--shadow-lg);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.image-container {
		position: relative;
		width: 100%;
		height: calc(var(--spacing-2xl) * 4);
		overflow: hidden;
	}

	.image-container::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-fast) var(--ease-out);
	}

	.recipe-card:hover .image-container img {
		transform: scale(1.05);
	}

	.content {
		padding: var(--spacing-lg);
	}

	.recipe-card h2 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--spacing-lg);
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.description {
		margin: 0 0 var(--spacing-lg);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		color: var(--color-neutral-light);
		line-height: 1.5;
	}

	.meta {
		display: flex;
		gap: var(--spacing-lg);
		font-size: var(--spacing-sm);
		color: var(--color-neutral-light);
		padding-top: var(--spacing-sm);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.meta span {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
</style>
