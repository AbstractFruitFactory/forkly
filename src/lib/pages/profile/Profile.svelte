<script lang="ts">
	import type { User, Recipe as DBRecipe } from '$lib/server/db/schema'
	import Button from '$lib/components/button/Button.svelte'
	import ProfileRecipeCard from '$lib/components/profile-recipe-card/ProfileRecipeCard.svelte'
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'

	type Recipe = DBRecipe & {
		likes: number
		bookmarks?: number
	}

	let {
		user,
		recipes = [],
		bookmarkedRecipes = [],
		recipeHref
	}: {
		user: Omit<User, 'passwordHash'>
		recipes: Recipe[]
		bookmarkedRecipes?: Recipe[]
		recipeHref?: string
	} = $props()

	let userStats = $derived({
		recipesCreated: recipes.length,
		totalLikes: recipes.reduce((acc: number, recipe: Recipe) => acc + (recipe.likes || 0), 0),
		bookmarksCount: bookmarkedRecipes.length
	})

	let isEditMode = $state(false)
	let editedUsername = $state('')
	let editedBio = $state('')
	let avatarPreview = $state<string | null>(null)
	let error = $state('')
	let activeTab = $state<'created' | 'bookmarked'>('created')

	function toggleEditMode() {
		if (!isEditMode) {
			editedUsername = user?.username || ''
			editedBio = user?.bio || ''
		}
		isEditMode = !isEditMode
		avatarPreview = null
		error = ''
	}

	function switchTab(tab: 'created' | 'bookmarked') {
		activeTab = tab
	}
</script>

<div class="profile-container">
	<div class="profile-grid">
		<div class="profile-main">
			<div class="profile-header">
				{#if !isEditMode}
					<div class="avatar-container">
						<div
							class="avatar"
							style="background: {user.avatarUrl
								? `url(${user.avatarUrl}) center/cover`
								: `var(--color-${user.username.charCodeAt(0) % 5})`}"
						>
							{#if !user.avatarUrl}
								{user.username[0].toUpperCase()}
							{/if}
						</div>
					</div>
				{/if}

				{#if isEditMode}
					<div class="edit-form">
						<form class="form-content" method="POST" enctype="multipart/form-data">
							<MediaUpload
								name="avatar"
								type="image"
								maxSize={5}
								previewAlt="Profile picture"
								{error}
							/>
							<input
								type="text"
								name="username"
								bind:value={editedUsername}
								placeholder="Username"
								class="edit-input"
								required
							/>
							<textarea
								name="bio"
								bind:value={editedBio}
								placeholder="Tell us about yourself..."
								class="edit-input bio-input"
							></textarea>
							{#if error}
								<p class="error">{error}</p>
							{/if}
							<div class="edit-actions">
								<Button type="submit" variant="primary">Save</Button>
								<Button type="button" variant="secondary" onclick={toggleEditMode}>Cancel</Button>
							</div>
						</form>
					</div>
				{:else}
					<div class="profile-info">
						<h1>{user.username}</h1>
						<p class="bio">{user.bio || 'No bio yet'}</p>
						<Button variant="secondary" size="sm" onclick={toggleEditMode}>Edit Profile</Button>
					</div>
				{/if}
			</div>

			<div class="stats-grid">
				<div class="stat-card">
					<span class="stat-value">{userStats.recipesCreated}</span>
					<span class="stat-label">Recipes</span>
				</div>
				<div class="stat-card">
					<span class="stat-value">{userStats.totalLikes}</span>
					<span class="stat-label">Total Likes</span>
				</div>
			</div>
		</div>

		<div class="recipes-section">
			<div class="tabs">
				<button
					class="tab-button"
					class:active={activeTab === 'created'}
					onclick={() => switchTab('created')}
				>
					My Recipes
				</button>
				<button
					class="tab-button"
					class:active={activeTab === 'bookmarked'}
					onclick={() => switchTab('bookmarked')}
				>
					Bookmarked Recipes
				</button>
			</div>

			{#if activeTab === 'created'}
				{#if recipes.length > 0}
					<div class="recipes-grid">
						{#each recipes as recipe}
							<ProfileRecipeCard {recipe} {recipeHref} />
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<p>You haven't created any recipes yet.</p>
						<Button href="/new" variant="primary">Create Your First Recipe</Button>
					</div>
				{/if}
			{:else if bookmarkedRecipes.length > 0}
				<div class="recipes-grid">
					{#each bookmarkedRecipes as recipe}
						<ProfileRecipeCard {recipe} {recipeHref} />
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>You haven't bookmarked any recipes yet.</p>
					<Button href="/" variant="primary">Explore Recipes</Button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.profile-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-2xl);
		box-shadow: var(--shadow-lg);
	}

	.profile-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1fr;

		@media (min-width: 1024px) {
			grid-template-columns: 350px 1fr;
		}
	}

	.profile-main {
		background: var(--color-background);
		border-radius: var(--border-radius-xl);
		padding: 2rem;
		box-shadow: var(--shadow-md);
		border: var(--border-width-thin) solid var(--color-neutral);
	}

	.profile-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.5rem;
		margin-bottom: 2rem;

		h1 {
			margin: 0;
			font-size: var(--font-size-3xl);
			color: white;
		}
	}

	.avatar-container {
		position: relative;
		width: 130px;
		height: 130px;
		border-radius: 50%;
		cursor: default;

		&.is-edit-mode {
			cursor: pointer;

			&:hover .avatar {
				filter: brightness(0.8);
			}
		}
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3.5rem;
		font-weight: 600;
		transition: all 0.3s ease;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		border: 3px solid var(--color-background);
	}

	.avatar-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		gap: 0.5rem;

		:global(svg) {
			stroke-width: 1.5;
		}

		.upload-text {
			font-size: var(--font-size-sm);
			font-weight: 500;
		}
	}

	.hidden {
		display: none;
	}

	.bio {
		color: var(--color-neutral-light);
		margin: 0.5rem 0 1rem;
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.stats-grid {
		display: flex;
		gap: var(--spacing-md);

		* {
			flex: 1;
		}
	}

	.stat-card {
		background: var(--color-neutral-dark);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		text-align: center;
		transition: all var(--transition-fast) var(--ease-in-out);
		border: var(--border-width-thin) solid var(--color-neutral);
		box-shadow: var(--shadow-sm);

		.stat-value {
			display: block;
			font-size: var(--font-size-2xl);
			font-weight: var(--font-weight-bold);
			color: white;
		}

		.stat-label {
			display: block;
			font-size: var(--font-size-sm);
			color: var(--color-neutral-light);
			margin-top: var(--spacing-xs);
		}
	}

	.recipes-section {
		h2 {
			margin: 0 0 1.5rem;
			color: white;
		}
	}

	.recipes-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl);
		background: var(--color-background);
		border-radius: var(--border-radius-xl);
		border: var(--border-width-thin) solid var(--color-neutral);
		box-shadow: var(--shadow-md);

		p {
			margin: 0 0 1.5rem;
			color: var(--color-neutral-light);
		}
	}

	.edit-form {
		width: 100%;
		max-width: 400px;
	}

	.edit-input {
		width: 100%;
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-lg);
		background: var(--color-neutral-dark);
		color: white;
		font-size: var(--font-size-md);
		box-shadow: var(--shadow-inner);

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 2px var(--color-primary-dark);
		}
	}

	.bio-input {
		min-height: 100px;
		resize: vertical;
	}

	.edit-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.not-logged-in {
		text-align: center;
		padding: 3rem 1rem;

		h2 {
			margin: 0 0 1.5rem;
			color: var(--text-1);
		}

		.action-buttons {
			display: flex;
			gap: 1rem;
			justify-content: center;
		}
	}

	.error {
		color: var(--color-error);
		font-size: var(--font-size-sm);
		margin: var(--spacing-sm) 0;
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-error-light);
		border-radius: var(--border-radius-sm);
		border: 1px solid var(--color-error);
	}

	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.tabs {
		display: flex;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-neutral);
	}

	.tab-button {
		background: none;
		border: none;
		padding: var(--spacing-md) var(--spacing-lg);
		color: var(--color-neutral-light);
		font-size: var(--font-size-md);
		cursor: pointer;
		position: relative;
		transition: all var(--transition-fast) var(--ease-out);

		&:hover {
			color: white;
		}

		&.active {
			color: var(--color-primary);
			font-weight: 600;

			&::after {
				content: '';
				position: absolute;
				bottom: -1px;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: var(--color-primary);
			}
		}
	}
</style>
