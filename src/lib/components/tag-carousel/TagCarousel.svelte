<script lang="ts">
        import Pill from '../pill/Pill.svelte'
        import { onMount } from 'svelte'

        export type Tag = string

        let { tags = [], onTagClick = (tag: string) => {} } = $props()

        type ScrollTag = { name: string; color: string }

        let scrollTags: ScrollTag[] = []
        let container: HTMLDivElement
        let track: HTMLDivElement

        const randomColor = () =>
                `hsl(${Math.floor(Math.random() * 360)}, ${70 + Math.floor(Math.random() * 20)}%, ${50 + Math.floor(Math.random() * 10)}%)`

        const setupTags = () => {
                scrollTags = [...tags, ...tags].map((t) => ({ name: t, color: randomColor() }))
        }

        onMount(setupTags)

        $: if (tags) setupTags()
</script>

<div class="carousel" bind:this={container}>
        <div class="track" bind:this={track}>
                {#each scrollTags as tag}
                        <button class="tag-item" on:click={() => onTagClick(tag.name)}>
                                <Pill text={tag.name} color={tag.color} />
                        </button>
                {/each}
        </div>
</div>

<style lang="scss">
        .carousel {
                overflow: hidden;
                width: 100%;
                margin: 0 auto;
                display: flex;
                justify-content: center;
                position: relative;
        }

        .carousel::before,
        .carousel::after {
                content: '';
                position: absolute;
                top: 0;
                width: var(--spacing-2xl);
                height: 100%;
                pointer-events: none;
                z-index: 1;
        }

        .carousel::before {
                left: 0;
                background: linear-gradient(to right, var(--color-background), transparent);
        }

        .carousel::after {
                right: 0;
                background: linear-gradient(to left, var(--color-background), transparent);
        }

        .track {
                display: flex;
                gap: var(--spacing-lg);
                white-space: nowrap;
                animation: scroll linear infinite 30s;
                align-items: center;
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

        .tag-item :global(.pill) {
                height: 32px;
        }

        .tag-item :global(.pill-text) {
                font-size: var(--font-size-sm);
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
