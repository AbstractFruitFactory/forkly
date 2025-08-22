<script lang="ts">
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'
	import Input from '../input/Input.svelte'

	let {
		value = $bindable(''),
		placeholder = 'Write in Markdown…',
		height = '250px'
	}: {
		value?: string
		placeholder?: string
		height?: string
	} = $props()

	let activeTab = $state<'write' | 'preview'>('write')

	function applyWrap(prefix: string, suffix = prefix) {
		const textarea = document.getElementById('md-editor-input') as HTMLTextAreaElement | null
		if (!textarea) return
		const start = textarea.selectionStart ?? 0
		const end = textarea.selectionEnd ?? 0
		const before = value.slice(0, start)
		const selected = value.slice(start, end)
		const after = value.slice(end)
		value = `${before}${prefix}${selected || ''}${suffix}${after}`
		queueMicrotask(() => {
			const pos = start + prefix.length + selected.length + suffix.length
			textarea.focus()
			textarea.setSelectionRange(pos, pos)
		})
	}

	const onBold = () => applyWrap('**')
	const onItalic = () => applyWrap('_')
	const onCode = () => applyWrap('`')
	const onLink = () => applyWrap('[', '](https://)')
	const onList = () => {
		const textarea = document.getElementById('md-editor-input') as HTMLTextAreaElement | null
		if (!textarea) return
		const start = textarea.selectionStart ?? 0
		const end = textarea.selectionEnd ?? 0
		const before = value.slice(0, start)
		const selected = value.slice(start, end) || 'item'
		const after = value.slice(end)
		const lines = selected.split(/\n/).map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n')
		value = `${before}${lines}${after}`
		queueMicrotask(() => {
			const pos = start + lines.length
			textarea.focus()
			textarea.setSelectionRange(pos, pos)
		})
	}

	const rendered = $derived(DOMPurify.sanitize(marked.parse(value || '') as string))
</script>

<div class="md-editor">
	<div class="tabs">
		<button class="tab {activeTab === 'write' ? 'active' : ''}" type="button" onclick={() => (activeTab = 'write')}>
			Write
		</button>
		<button class="tab {activeTab === 'preview' ? 'active' : ''}" type="button" onclick={() => (activeTab = 'preview')}>
			Preview
		</button>
	</div>

	{#if activeTab === 'write'}
		<div class="toolbar">
			<button class="tb" type="button" title="Bold" onclick={onBold}><strong>B</strong></button>
			<button class="tb" type="button" title="Italic" onclick={onItalic}><em>I</em></button>
			<button class="tb" type="button" title="Code" onclick={onCode}><code>`</code></button>
			<button class="tb" type="button" title="Link" onclick={onLink}>🔗</button>
			<button class="tb" type="button" title="List" onclick={onList}>• List</button>
		</div>
		<div class="input-pane">
			<Input>
				<textarea id="md-editor-input" bind:value rows="10" placeholder={placeholder} style={`height:${height}`}></textarea>
			</Input>
		</div>
	{:else}
		<div class="preview-pane" style={`min-height:${height}`}>
			<div class="preview" data-testid="markdown-preview">{@html rendered}</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.md-editor {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	.tabs {
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-2xs) var(--spacing-xs);
	}
	.tab {
		border: none;
		background: var(--color-surface);
		color: var(--color-text-on-surface);
		padding: 0.4rem 0.8rem;
		border-radius: var(--border-radius-lg);
		cursor: pointer;
	}
	.tab.active {
		background: var(--color-secondary);
		color: var(--color-text-on-secondary);
	}
	.toolbar {
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs);
	}
	.tb {
		border: none;
		background: var(--color-surface);
		border-radius: var(--border-radius-md);
		padding: 0.25rem 0.5rem;
		cursor: pointer;
	}
	.input-pane textarea {
		width: 100%;
		padding: var(--spacing-sm);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	}
	.preview-pane {
		padding: var(--spacing-sm);
		max-height: 100%;
		overflow: auto;
	}
	.preview :global(img) {
		max-width: 100%;
	}
</style> 