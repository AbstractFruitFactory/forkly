<script lang="ts">
	import { scale } from 'svelte/transition'
	import Button from '../button/Button.svelte'
	import Popup from '../popup/Popup.svelte'
	import Toast from '../toast/Toast.svelte'

	let {
		url,
		title
	}: {
		url?: string
		title?: string
	} = $props()

	const shareOptions = [
		{
			name: 'Copy Link',
			icon: 'link',
			action: () => {
				navigator.clipboard.writeText(url || window.location.href)
				toast.trigger()
			}
		},
		{
			name: 'Twitter',
			icon: 'twitter',
			action: () => {
				const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
					url || window.location.href
				)}&text=${encodeURIComponent(title || document.title)}`
				window.open(shareUrl, '_blank')
			}
		},
		{
			name: 'Facebook',
			icon: 'facebook',
			action: () => {
				const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					url || window.location.href
				)}`
				window.open(shareUrl, '_blank')
			}
		},
		{
			name: 'Email',
			icon: 'mail',
			action: () => {
				const shareUrl = `mailto:?subject=${encodeURIComponent(
					title || document.title
				)}&body=${encodeURIComponent(url || window.location.href)}`
				window.location.href = shareUrl
			}
		}
	]

	let isPopupOpen = $state(false)
	let copyAnimationActive = $state(false)
	let toast: Toast

	const togglePopup = () => {
		isPopupOpen = !isPopupOpen
	}
</script>

<div class="share-wrapper">
	<button onclick={togglePopup}>
		<div class="share-button-content">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="18" cy="5" r="3" />
				<circle cx="6" cy="12" r="3" />
				<circle cx="18" cy="19" r="3" />
				<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
				<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
			</svg>
		</div>
	</button>

	<Popup isOpen={isPopupOpen} onClose={togglePopup} title="Share" width="350px">
		<div class="share-popup-content">
			{#if url || title}
				<div class="share-item-preview">
					<h4 class="share-item-title">{title || document.title}</h4>
					<p class="share-item-url">{url || window.location.href}</p>
				</div>
			{/if}

			<div class="share-options">
				{#each shareOptions as option, i}
					<button
						class="share-option"
						onclick={() => {
							option.action()
							if (option.name === 'Copy Link') {
								copyAnimationActive = true
								setTimeout(() => {
									copyAnimationActive = false
								}, 1500)
							}
						}}
					>
						<div class="share-option-icon">
							{#if option.icon === 'link'}
								<div class="icon-container">
									{#if copyAnimationActive}
										<div
											class="success-animation"
											transition:scale|local={{ start: 0.8, duration: 300 }}
										>
											<svg class="success-circle-outline" viewBox="0 0 52 52">
												<circle
													cx="26"
													cy="26"
													r="25"
													fill="none"
													stroke="#22c55e"
													stroke-width="2"
												/>
											</svg>
											<svg class="success-checkmark" viewBox="0 0 52 52">
												<path
													class="checkmark-path"
													fill="none"
													stroke="#22c55e"
													stroke-width="3"
													d="M14.1 27.2l7.1 7.2 16.7-16.8"
												/>
											</svg>
										</div>
									{:else}
										<svg
											transition:scale|local={{ start: 0.8, duration: 300 }}
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="link-icon"
										>
											<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
											<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
										</svg>
									{/if}
								</div>
							{:else if option.icon === 'twitter'}
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
									<path
										d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
									/>
								</svg>
							{:else if option.icon === 'facebook'}
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
									<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
								</svg>
							{:else if option.icon === 'mail'}
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
									<path
										d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
									/>
									<polyline points="22,6 12,13 2,6" />
								</svg>
							{/if}
						</div>
						<span>{option.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</Popup>

	<Toast bind:this={toast} message="Link copied to clipboard!" type="success" />
</div>

<style lang="scss">
	.share-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
	}

	.share-button-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.share-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.share-description {
		margin: 0 0 var(--spacing-sm);
		color: var(--color-text);
	}

	.share-item-preview {
		background: var(--color-hover);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.share-item-title {
		margin: 0 0 var(--spacing-xs);
		font-size: var(--font-size-md);
		font-weight: 600;
	}

	.share-item-url {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.share-options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.share-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: var(--color-hover);
			border-color: var(--color-primary);
			color: var(--color-primary);
		}
	}

	.share-option-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);
		height: 40px;
		position: relative;
	}

	.icon-container {
		position: relative;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.link-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.success-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-circle-outline {
		width: 30px;
		height: 30px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	.success-checkmark {
		width: 30px;
		height: 30px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.checkmark-path {
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}

	.share-footer {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--spacing-md);
	}
</style>
