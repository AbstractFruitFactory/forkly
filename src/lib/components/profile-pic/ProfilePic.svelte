<script lang="ts">
	const sizeMap = {
		sm: '32px',
		lg: '40px'
	} as const

	let {
		profilePicUrl,
		size = 'sm',
		background = false
	}: {
		profilePicUrl?: string
		size?: 'sm' | 'lg'
		background?: boolean
	} = $props()

	const pixelSize = sizeMap[size]
</script>

{#if profilePicUrl}
	<img
		src={profilePicUrl}
		alt="Profile"
		class="profile-pic"
		style="width: {pixelSize}; height: {pixelSize};"
	/>
{:else}
	<div 
		class="profile-pic-placeholder" 
		style="width: {pixelSize}; height: {pixelSize}; background: {background ? 'var(--color-surface)' : undefined};"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="black"
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
		border: var(--border-width-normal) solid var(--color-neutral);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
