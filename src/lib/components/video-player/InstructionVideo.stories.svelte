<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf'
	import InstructionVideo from './InstructionVideo.svelte'

	const { Story } = defineMeta({
		title: 'lib/components/Instruction Video',
		component: InstructionVideo,
		tags: ['autodocs']
	})

	// Using sample video URLs
	const sampleVideoUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
	const invalidVideoUrl = 'https://example.com/invalid-video-url.mp4'
</script>

<Story name="Default">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<InstructionVideo
				src={sampleVideoUrl}
				stepNumber={1}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Step Number 3">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<InstructionVideo
				src={sampleVideoUrl}
				stepNumber={3}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet children(args)}
		<div style="width: 400px; padding: 20px; background-color: #1a1a1a;">
			<InstructionVideo
				src={invalidVideoUrl}
				stepNumber={2}
				{...args}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Wide Layout">
	{#snippet children(args)}
		<div style="width: 600px; padding: 20px; background-color: #1a1a1a;">
			<InstructionVideo
				src={sampleVideoUrl}
				stepNumber={4}
				{...args}
			/>
		</div>
	{/snippet}
</Story> 