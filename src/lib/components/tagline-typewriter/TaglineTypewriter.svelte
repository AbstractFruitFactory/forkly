<script lang="ts">
	import { onMount, onDestroy } from 'svelte'

	let { tags = [], onSelect = (tag: string) => {} } = $props()

	const prefix = 'Simple '
	const suffix = ' recipes, made by the community.'
	const initialWord = 'food'
	const typingSpeed = 60
	const deleteSpeed = 30
	const pauseDelay = 3000

	let prefixText = $state('')
	let initialWordText = $state('')
	let currentTag = $state('')
	let suffixText = $state('')
	let currentWordIndex = 0
	let running = true
	let isHovering = $state(false)

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	async function typeString(str: string, target: string, speed = typingSpeed) {
		for (const char of str) {
			if (!running) return
			target += char
			await delay(speed)
		}
	}

	async function typeTag(tag: string, speed = typingSpeed) {
		currentTag = ''
		for (const char of tag) {
			if (!running) return
			currentTag += char
			await delay(speed)
		}
	}

	async function deleteTag() {
		while (currentTag.length > 0) {
			if (!running) return
			currentTag = currentTag.slice(0, -1)
			await delay(deleteSpeed)
		}
	}

	async function deleteInitialWord() {
		while (initialWordText.length > 0) {
			if (!running) return
			initialWordText = initialWordText.slice(0, -1)
			await delay(deleteSpeed)
		}
	}

	async function start() {
		for (const char of prefix) {
			if (!running) return
			prefixText += char
			await delay(typingSpeed)
		}

		for (const char of initialWord) {
			if (!running) return
			initialWordText += char
			await delay(typingSpeed)
		}

		for (const char of suffix) {
			if (!running) return
			suffixText += char
			await delay(typingSpeed)
		}

		await delay(pauseDelay)

		if (tags.length > 0) {
			await deleteInitialWord()
			await typeTag(tags[0])
			await delay(pauseDelay)
			currentWordIndex = 1 % tags.length
			let currentTagValue = tags[0]

			while (running && tags.length > 0) {
				while (isHovering) {
					await delay(100)
				}
				await deleteTag()
				currentTagValue = tags[currentWordIndex]
				await typeTag(currentTagValue)
				while (isHovering) {
					await delay(100)
				}
				await delay(pauseDelay)
				currentWordIndex = (currentWordIndex + 1) % tags.length
			}
		}
	}

	function handleTagClick() {
		if (currentTag && currentTag !== initialWord) {
			onSelect(currentTag)
		}
	}

	function handleMouseEnter() {
		isHovering = true
	}

	function handleMouseLeave() {
		isHovering = false
	}

	onMount(() => {
		start()
	})

	onDestroy(() => {
		running = false
	})
</script>

<div class="typewriter">
	<h1>{prefixText}</h1>
	{#if initialWordText.length > 0}
		<h1>{initialWordText}</h1>
	{:else}
		<h1
			class="tag"
			onclick={handleTagClick}
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
		>
			{currentTag}
		</h1>
	{/if}
	<h1>{suffixText}</h1>
</div>

<style lang="scss">
	.typewriter {
		white-space: nowrap;
	}

	h1 {
		color: var(--color-text-on-background);
		display: inline-block;
		margin: 0;
	}

	.tag {
		color: var(--color-secondary);
		cursor: pointer;
		transition: opacity 0.2s ease-in-out;

		&:hover {
			opacity: 0.8;
		}
	}
</style>
