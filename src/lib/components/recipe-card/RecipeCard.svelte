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
		border-radius: 8px;
		background: var(--color-neutral-dark);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		overflow: hidden;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.recipe-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.image-container {
		width: 100%;
		height: 200px;
		overflow: hidden;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.content {
		padding: 24px;
	}

	.recipe-card h2 {
		margin: 0 0 12px;
		font-size: 24px;
	}

	.description {
		margin: 0 0 16px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.meta {
		display: flex;
		gap: 16px;
		font-size: 14px;
	}
</style>
