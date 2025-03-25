<script lang="ts">
	import ProfilePic from '../profile-pic/ProfilePic.svelte'

	let {
		profilePicUrl,
		username,
		userId
	}: {
		profilePicUrl?: string
		username: string
		userId: string
	} = $props()
</script>

<a href="/profile/{userId}" class="recipe-creator">
	<ProfilePic {profilePicUrl} size="lg" />
	<span class="username">{username}</span>
</a>

<style lang="scss">
	.recipe-creator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		transition: opacity var(--transition-fast) var(--ease-in-out);

		&:hover {
			opacity: 0.8;
		}
	}

	.username {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #000);
	}
</style>
