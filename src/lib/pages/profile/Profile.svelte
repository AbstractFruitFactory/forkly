<script lang="ts">
	import type { User, Recipe } from '$lib/server/db/schema'
	import Button from '$lib/components/button/Button.svelte'
	import ProfileRecipeCard from '$lib/components/profile/ProfileRecipeCard.svelte'
	import { fade, slide } from 'svelte/transition'
	import { enhance } from '$app/forms'
	import { applyAction } from '$app/forms'

	let {
		user,
		recipes = [],
		recipeHref
	}: {
		user: Omit<User, 'passwordHash'> | null
		recipes: Recipe[]
		recipeHref?: string
	} = $props()

	let userStats = $derived({
		recipesCreated: recipes.length,
		totalLikes: recipes.reduce((acc: number, recipe: Recipe) => acc + (recipe.likes || 0), 0),
		followers: 0, // TODO: Implement followers
		following: 0 // TODO: Implement following
	})

	let isEditMode = $state(false)
	let editedUsername = $state('')
	let editedBio = $state('')

	function toggleEditMode() {
		if (!isEditMode) {
			editedUsername = user?.username || ''
			editedBio = user?.bio || ''
		}
		isEditMode = !isEditMode
	}
</script>

<div class="profile-container" in:fade>
	{#if user}
		<div class="profile-grid">
			<div class="profile-main" in:slide={{ delay: 200, duration: 300 }}>
				<div class="profile-header">
					<div class="avatar" style="background: var(--color-{user.username.charCodeAt(0) % 5})">
						{user.username[0].toUpperCase()}
					</div>
					{#if isEditMode}
						<div class="edit-form">
							<form
								method="POST"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											isEditMode = false
										}
										await applyAction(result)
									}
								}}
							>
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
					<div class="stat-card">
						<span class="stat-value">{userStats.followers}</span>
						<span class="stat-label">Followers</span>
					</div>
					<div class="stat-card">
						<span class="stat-value">{userStats.following}</span>
						<span class="stat-label">Following</span>
					</div>
				</div>
			</div>

			<div class="recipes-section" in:slide={{ delay: 400, duration: 300 }}>
				<h2>My Recipes</h2>
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
			</div>
		</div>
	{:else}
		<div class="not-logged-in" in:fade>
			<h2>Please log in to view your profile</h2>
			<div class="action-buttons">
				<Button href="/login">Login</Button>
				<Button href="/signup" variant="secondary">Sign Up</Button>
			</div>
		</div>
	{/if}
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

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 600;
		transition: transform 0.3s ease;

		&:hover {
			transform: scale(1.05);
		}
	}

	.bio {
		color: var(--color-neutral-light);
		margin: 0.5rem 0 1rem;
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-top: 2rem;
	}

	.stat-card {
		background: var(--color-neutral-dark);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		text-align: center;
		transition: all var(--transition-fast) var(--ease-in-out);
		border: var(--border-width-thin) solid var(--color-neutral);
		box-shadow: var(--shadow-sm);

		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}

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
</style>
