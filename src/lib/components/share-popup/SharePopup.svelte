<script lang="ts">
	import { scale } from 'svelte/transition'
	import Popup from '../popup/Popup.svelte'

	let {
		isOpen = false,
		onClose,
		url,
		title,
		onLinkCopied
	}: {
		isOpen: boolean
		onClose: () => void
		url?: string
		title?: string
		onLinkCopied?: () => void
	} = $props()

	const shareOptions = [
		{
			name: 'Copy Link',
			icon: 'link',
			action: () => {
				navigator.clipboard.writeText(url || window.location.href)
				copySuccess()
			}
		},
		{
			name: 'X',
			icon: 'x',
			action: () => {
				const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
					url || window.location.href
				)}&text=${encodeURIComponent(title || document.title)}`
				window.open(shareUrl, '_blank')
			}
		},
		{
			name: 'Instagram',
			icon: 'instagram',
			action: () => {
				const shareUrl = `https://www.instagram.com/?url=${encodeURIComponent(
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

	let copyAnimationActive = $state(false)

	const copySuccess = () => {
		onLinkCopied?.()
		copyAnimationActive = true
		setTimeout(() => {
			copyAnimationActive = false
		}, 1500)
	}
</script>

<Popup {isOpen} {onClose} title="Share" width="350px">
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
						{:else if option.icon === 'x'}
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
									d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
								/>
							</svg>
						{:else if option.icon === 'instagram'}
							<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.1572 2.7704-6.1496 6.1738Z"
								/>
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

<style lang="scss">
	.share-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
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
</style>
