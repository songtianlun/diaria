<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
	import { commonmark } from '@milkdown/preset-commonmark';
	import { nord } from '@milkdown/theme-nord';
	import { listener, listenerCtx } from '@milkdown/plugin-listener';

	export let content = '';
	export let onChange: (value: string) => void = () => {};
	export let placeholder = 'Start writing...';

	let editorContainer: HTMLDivElement;
	let editor: Editor | null = null;

	onMount(async () => {
		try {
			editor = await Editor.make()
				.config((ctx) => {
					ctx.set(rootCtx, editorContainer);
					ctx.set(defaultValueCtx, content);
					ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
						onChange(markdown);
					});
				})
				.use(nord)
				.use(commonmark)
				.use(listener)
				.create();
		} catch (error) {
			console.error('Failed to initialize editor:', error);
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	$: if (editor && content !== undefined) {
		try {
			editor.action((ctx) => {
				const view = ctx.get(rootCtx);
				if (view) {
					const currentContent = editor?.action((ctx) => {
						return ctx.get(defaultValueCtx);
					});
					if (currentContent !== content) {
						ctx.set(defaultValueCtx, content);
					}
				}
			});
		} catch (error) {
			console.error('Failed to update editor:', error);
		}
	}
</script>

<div class="markdown-editor">
	<div bind:this={editorContainer} class="editor-container"></div>
	{#if !content}
		<div class="editor-placeholder">
			{placeholder}
		</div>
	{/if}
</div>

<style>
	.markdown-editor {
		position: relative;
		width: 100%;
		min-height: 500px;
	}

	.editor-container {
		position: relative;
		width: 100%;
		min-height: 500px;
		font-size: 16px;
		line-height: 1.75;
	}

	.editor-placeholder {
		position: absolute;
		top: 16px;
		left: 16px;
		color: hsl(var(--muted-foreground));
		pointer-events: none;
		font-size: 16px;
		opacity: 0.6;
	}

	:global(.milkdown) {
		padding: 1rem;
		outline: none;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: pre-wrap;
		background: transparent !important;
		color: hsl(var(--foreground));
	}

	:global(.milkdown .editor) {
		outline: none;
	}

	:global(.milkdown p) {
		margin-bottom: 1em;
		color: hsl(var(--foreground));
	}

	:global(.milkdown h1) {
		font-size: 1.875em;
		font-weight: 700;
		margin-bottom: 0.5em;
		margin-top: 1em;
		color: hsl(var(--foreground));
		letter-spacing: -0.025em;
	}

	:global(.milkdown h2) {
		font-size: 1.5em;
		font-weight: 600;
		margin-bottom: 0.5em;
		margin-top: 0.75em;
		color: hsl(var(--foreground));
	}

	:global(.milkdown h3) {
		font-size: 1.25em;
		font-weight: 600;
		margin-bottom: 0.5em;
		margin-top: 0.5em;
		color: hsl(var(--foreground));
	}

	:global(.milkdown ul),
	:global(.milkdown ol) {
		margin-left: 1.5em;
		margin-bottom: 1em;
	}

	:global(.milkdown li) {
		margin-bottom: 0.25em;
	}

	:global(.milkdown code) {
		background-color: hsl(var(--muted));
		color: hsl(var(--foreground));
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
	}

	:global(.milkdown pre) {
		background-color: hsl(222.2 84% 6%);
		color: hsl(210 40% 98%);
		padding: 1em;
		border-radius: 8px;
		overflow-x: auto;
		margin-bottom: 1em;
	}

	:global(.dark .milkdown pre) {
		background-color: hsl(217.2 32.6% 12%);
	}

	:global(.milkdown pre code) {
		background-color: transparent;
		padding: 0;
		color: inherit;
	}

	:global(.milkdown blockquote) {
		border-left: 3px solid hsl(var(--border));
		padding-left: 1em;
		margin-left: 0;
		margin-bottom: 1em;
		color: hsl(var(--muted-foreground));
	}

	:global(.milkdown a) {
		color: hsl(221.2 83.2% 53.3%);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	:global(.milkdown a:hover) {
		opacity: 0.8;
	}

	:global(.milkdown hr) {
		border: none;
		border-top: 1px solid hsl(var(--border));
		margin: 1.5em 0;
	}

	:global(.milkdown strong) {
		font-weight: 600;
	}

	:global(.milkdown em) {
		font-style: italic;
	}
</style>
