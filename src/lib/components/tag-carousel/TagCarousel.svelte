<script lang="ts">
	import Pill from '../pill/Pill.svelte'
	import { onMount } from 'svelte'

	export type Tag = string

	let { tags = [], onTagClick = (tag: string) => {} } = $props()

	// Duplicate list for seamless scrolling
	let scrollTags: Tag[] = []
	let container: HTMLDivElement
	let track: HTMLDivElement

	onMount(() => {
		scrollTags = [...tags, ...tags]
	})
</script>

<div class="carousel" bind:this={container}>
	<div class="track" bind:this={track}>
		{#each scrollTags as tag}
			<button class="tag-item" on:click={() => onTagClick(tag)}>
				<Pill text={tag} />
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.carousel {
		overflow: hidden;
		width: 100%;
	}

	.track {
		display: flex;
		gap: var(--spacing-md);
		white-space: nowrap;
		animation: scroll linear infinite 40s;
	}

	.carousel:hover .track {
		animation-play-state: paused;
	}

	.tag-item {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		flex-shrink: 0;
	}

	@keyframes scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
</style>
