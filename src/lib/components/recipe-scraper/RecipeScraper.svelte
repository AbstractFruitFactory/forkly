<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import WarningBox from '$lib/components/warning-box/WarningBox.svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import { safeFetch } from '$lib/utils/fetch'
	import type { ImportedRecipeData } from '../../../../scripts/import-recipe-worker'

	let {
		onClose,
		onRecipeScraped
	}: {
		onClose?: () => void
		onRecipeScraped?: (recipe: ImportedRecipeData) => void
	} = $props()

	let activeTab = $state<'url' | 'text' | 'images'>('url')
	let url = $state('')
	let text = $state('')
	let selectedImages = $state<File[]>([])
	let isLoading = $state(false)
	let error: string | null = $state(null)

	const tabOptions = ['URL', 'Text', 'Images']
	const MAX_IMAGES = 3
	const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB

	const isValidUrl = (urlString: string) => {
		try {
			new URL(urlString)
			return true
		} catch {
			return false
		}
	}

	const isValidText = (textContent: string) => {
		return textContent.trim().length >= 50 && textContent.length <= 10000
	}

	const getTotalSize = () => {
		return selectedImages.filter(img => img).reduce((total, file) => total + file.size, 0)
	}

	const pollJobStatus = async (jobId: string, maxAttempts = 60, interval = 2000) => {
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			await new Promise((resolve) => setTimeout(resolve, interval))
			const statusResult = await safeFetch()(`/import-recipe/status/${jobId}`)
			if (statusResult.isErr()) {
				throw new Error(statusResult.error.message)
			}
			const data = statusResult.value as any
			if (data.status === 'completed' && data.result) {
				return data.result
			}
			if (data.status === 'failed') {
				throw new Error(data.error || 'Recipe import failed')
			}
		}
		throw new Error('Timed out waiting for recipe import')
	}

	const handleScrape = async () => {
		error = null

		if (activeTab === 'url') {
			if (!url.trim()) {
				error = 'Please enter a recipe URL'
				return
			}

			if (!isValidUrl(url)) {
				error = 'Please enter a valid URL'
				return
			}
		} else if (activeTab === 'text') {
			if (!text.trim()) {
				error = 'Please enter recipe text'
				return
			}

			if (!isValidText(text)) {
				if (text.trim().length < 50) {
					error = 'Recipe text must be at least 50 characters long'
				} else {
					error = 'Recipe text must be less than 10,000 characters'
				}
				return
			}
		} else if (activeTab === 'images') {
			const actualImages = selectedImages.filter(img => img)
			if (actualImages.length === 0) {
				error = 'Please select at least one image file'
				return
			}

			const totalSize = getTotalSize()
			if (totalSize > MAX_TOTAL_SIZE) {
				error = 'Total image file size must be less than 30MB'
				return
			}
		}

		isLoading = true

		try {
			let result: any

			if (activeTab === 'images') {
				// Use FormData for image upload
				const formData = new FormData()
				formData.append('inputType', 'image')
				
				// Add all images with indexed names, filtering out undefined values
				selectedImages.forEach((image, index) => {
					if (image) {
						formData.append(`image${index}`, image)
					}
				})

				result = await safeFetch()('/import-recipe', {
					method: 'POST',
					body: formData
				})
			} else {
				// Use JSON for URL and text
				const requestBody =
					activeTab === 'url' ? { url, inputType: 'url' } : { text: text.trim(), inputType: 'text' }

				result = await safeFetch()('/import-recipe', {
					method: 'POST',
					body: JSON.stringify(requestBody)
				})
			}

			if (result.isErr()) {
				error = result.error.message
			} else {
				const { jobId } = result.value as any
				if (!jobId) {
					error = 'Failed to start recipe import. Please try again.'
					return
				}
				const recipe = await pollJobStatus(jobId)
				if (!recipe.instructions) {
					error = 'The recipe data appears to be incomplete. Please try a different recipe.'
					return
				}
				onRecipeScraped?.(recipe)
				onClose?.()
			}
		} catch (err) {
			console.error('Recipe scraping error:', err)
			if (err instanceof Error) {
				error = err.message || 'Failed to scrape recipe'
			} else {
				error = 'An unexpected error occurred while scraping the recipe'
			}
		} finally {
			isLoading = false
		}
	}

	const handleUrlInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		url = target.value
		error = null
	}

	const handleTextInput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement
		text = target.value
		error = null
	}

	const handleImageSelect = (index: number, file: File | null) => {
		if (file) {
			// Check total size before adding
			const newTotalSize = getTotalSize() + file.size
			if (newTotalSize > MAX_TOTAL_SIZE) {
				error = 'Total image file size must be less than 30MB'
				return
			}
			
			// Update the image at the specific index
			selectedImages[index] = file
			selectedImages = [...selectedImages] // Trigger reactivity
		} else {
			// Remove the image at the specific index by setting it to undefined
			// This preserves the array length and indices
			selectedImages[index] = undefined as any
			selectedImages = [...selectedImages] // Trigger reactivity
		}
		error = null
	}

	const handleTabSelect = (option: string) => {
		if (option === tabOptions[0]) {
			activeTab = 'url'
		} else if (option === tabOptions[1]) {
			activeTab = 'text'
		} else {
			activeTab = 'images'
		}
		error = null
	}

	const isFormValid = () => {
		if (activeTab === 'url') {
			return url.trim().length > 0 && isValidUrl(url)
		} else if (activeTab === 'text') {
			return text.trim().length > 0 && isValidText(text)
		} else {
			const actualImages = selectedImages.filter(img => img)
			return actualImages.length > 0 && getTotalSize() <= MAX_TOTAL_SIZE
		}
	}
</script>

<div class="recipe-scraper">
	<TabSelect
		options={tabOptions}
		selected={activeTab === 'url' ? tabOptions[0] : activeTab === 'text' ? tabOptions[1] : tabOptions[2]}
		onSelect={handleTabSelect}
	/>

	<div class="scraper-form">
		{#if activeTab === 'url'}
			<Input bind:value={url}>
				<input
					placeholder="Enter recipe URL"
					bind:value={url}
					oninput={handleUrlInput}
					disabled={isLoading}
				/>
			</Input>
			<Button
				loading={isLoading}
				onclick={handleScrape}
				disabled={isLoading || !isFormValid()}
				color="neutral"
			>
				Import
			</Button>
		{:else if activeTab === 'text'}
			<div class="text-input-section">
				<Input>
					<textarea
						placeholder="Paste your recipe text here..."
						bind:value={text}
						oninput={handleTextInput}
						disabled={isLoading}
						rows="8"
					></textarea>
					<div class="text-counter">
						{text.length}/10,000 characters
					</div>
				</Input>
				<Button
					loading={isLoading}
					onclick={handleScrape}
					disabled={isLoading || !isFormValid()}
					color="neutral"
				>
					Import
				</Button>
			</div>
		{:else}
			<div class="image-input-section">
				<div class="image-upload-grid">
					{#each Array(MAX_IMAGES) as _, index}
						<div class="upload-slot">
							<MediaUpload
								type="image"
								name="image{index}"
								previewAlt="Recipe image {index + 1}"
								onFile={(file) => handleImageSelect(index, file)}
								initialMedia={selectedImages[index] ? { 
									url: URL.createObjectURL(selectedImages[index]), 
									type: 'image' 
								} : undefined}
							/>
						</div>
					{/each}
				</div>
				
				<div class="image-info">
					<span>{selectedImages.filter(img => img).length}/{MAX_IMAGES} images</span>
					<span>{(getTotalSize() / (1024 * 1024)).toFixed(1)}MB / 30MB</span>
				</div>

				<Button
					loading={isLoading}
					onclick={handleScrape}
					disabled={isLoading || !isFormValid()}
					color="neutral"
				>
					Import
				</Button>
			</div>
		{/if}
	</div>

	{#if error}
		<WarningBox message={error} />
	{/if}

	{#if isLoading}
		<div class="loading-message">
			<p>Please wait while we import the recipe...</p>
			<p class="loading-note">This may take a few moments.</p>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.recipe-scraper {
		max-width: 800px;
		margin: 0 auto;
	}

	.scraper-form {
		display: flex;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);

		@include mobile {
			flex-direction: column;
		}
	}

	.text-input-section,
	.image-input-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		flex: 1;
	}

	.text-counter {
		position: absolute;
		bottom: var(--spacing-xs);
		right: var(--spacing-xs);
		font-size: var(--font-size-xs);
		color: var(--color-text-on-surface-secondary);
		background: var(--color-surface);
		padding: 2px var(--spacing-xs);
		border-radius: var(--border-radius-sm);
	}

	.image-upload-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}

	.upload-slot {
		aspect-ratio: 16/9;
	}

	.image-info {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-sm);
		color: var(--color-text-on-surface-secondary);
		padding: var(--spacing-xs) 0;
	}

	.loading-message {
		text-align: center;
		margin-top: var(--spacing-lg);
		color: var(--color-text-on-surface);

		p {
			margin: 0;
			&:first-child {
				font-weight: 500;
				margin-bottom: var(--spacing-xs);
			}
		}

		.loading-note {
			font-size: var(--font-size-sm);
			color: var(--color-text-on-surface-secondary);
		}
	}
</style>
