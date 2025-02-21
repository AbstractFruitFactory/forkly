<script lang="ts">
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
			<span>{recipe.ingredients} ingredients</span>
			<span>{recipe.instructions} steps</span>
		</div>
	</div>
</a>

<style>
	.recipe-card {
		display: block;
		border-radius: var(--border-radius-lg);
		background: var(--color-neutral-dark);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		overflow: hidden;
		transition: 
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);
	}

	.recipe-card:hover {
		transform: translateY(calc(var(--spacing-xs) * -1));
		box-shadow: var(--shadow-md);
	}

	.image-container {
		width: 100%;
		height: calc(var(--spacing-2xl) * 4);
		overflow: hidden;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.content {
		padding: var(--spacing-lg);
	}

	.recipe-card h2 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--spacing-lg);
	}

	.description {
		margin: 0 0 var(--spacing-md);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.meta {
		display: flex;
		gap: var(--spacing-md);
		font-size: var(--spacing-sm);
	}
</style>
