<script lang="ts">
	let { 
		profilePicUrl,
		size = '32px'
	}: { 
		profilePicUrl?: string,
		size?: string
	} = $props()
</script>

{#if profilePicUrl}
	<img src={profilePicUrl} alt="Profile" class="profile-pic" style="width: {size}; height: {size};" />
{:else}
	<div class="profile-pic-placeholder" style="width: {size}; height: {size};">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
			<circle cx="12" cy="7" r="4"></circle>
		</svg>
	</div>
{/if}

<style lang="scss">
	.profile-pic {
		border-radius: 50%;
		object-fit: cover;
	}

	.profile-pic-placeholder {
		border-radius: 50%;
		background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);
	}
</style> 