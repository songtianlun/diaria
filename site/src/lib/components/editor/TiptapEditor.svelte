<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import TaskList from '@tiptap/extension-task-list';
	import TaskItem from '@tiptap/extension-task-item';
	import CharacterCount from '@tiptap/extension-character-count';
	import Typography from '@tiptap/extension-typography';
	import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
	import { common, createLowlight } from 'lowlight';
	import { uploadImage, getMediaUrl } from '$lib/utils/uploadImage';
	import EditorToolbar from './EditorToolbar.svelte';

	export let content = '';
	export let onChange: (value: string) => void = () => {};
	export let placeholder = 'Start writing...';
	export let diaryId: string | undefined = undefined;

	let editorElement: HTMLDivElement;
	let editor: Editor | null = null;
	let isUploading = false;

	const lowlight = createLowlight(common);

	// Handle image upload
	async function handleImageUpload(file: File): Promise<string | null> {
		if (isUploading) return null;
		isUploading = true;
		try {
			const media = await uploadImage(file, { diaryId });
			return getMediaUrl(media);
		} catch (error) {
			console.error('Image upload failed:', error);
			return null;
		} finally {
			isUploading = false;
		}
	}

	// Handle paste event
	function handlePaste(view: any, event: ClipboardEvent) {
		const items = event.clipboardData?.items;
		if (!items) return false;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				event.preventDefault();
				const file = item.getAsFile();
				if (file) {
					handleImageUpload(file).then((url) => {
						if (url && editor) {
							editor.chain().focus().setImage({ src: url }).run();
						}
					});
				}
				return true;
			}
		}
		return false;
	}

	// Handle drop event
	function handleDrop(view: any, event: DragEvent) {
		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) return false;

		const file = files[0];
		if (file.type.startsWith('image/')) {
			event.preventDefault();
			handleImageUpload(file).then((url) => {
				if (url && editor) {
					editor.chain().focus().setImage({ src: url }).run();
				}
			});
			return true;
		}
		return false;
	}

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					codeBlock: false,
				}),
				Placeholder.configure({
					placeholder,
				}),
				Image.configure({
					inline: false,
					allowBase64: true,
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'editor-link',
					},
				}),
				Underline,
				Highlight.configure({
					multicolor: true,
				}),
				TaskList,
				TaskItem.configure({
					nested: true,
				}),
				CharacterCount,
				Typography,
				CodeBlockLowlight.configure({
					lowlight,
				}),
			],
			content,
			editorProps: {
				handlePaste,
				handleDrop,
				attributes: {
					class: 'tiptap-editor-content',
				},
			},
			onUpdate: ({ editor }) => {
				onChange(editor.getHTML());
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Watch for external content changes
	$: if (editor && content !== editor.getHTML()) {
		editor.commands.setContent(content, false);
	}

	// Insert image (for toolbar)
	export function insertImage(url: string) {
		if (editor) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}

	// Upload and insert image
	export async function uploadAndInsertImage(file: File) {
		const url = await handleImageUpload(file);
		if (url) {
			insertImage(url);
		}
	}
</script>

<div class="tiptap-editor">
	{#if editor}
		<EditorToolbar {editor} onUploadImage={uploadAndInsertImage} {isUploading} />
	{/if}
	<div bind:this={editorElement} class="editor-container"></div>
	{#if editor}
		<div class="editor-footer">
			<span class="char-count">
				{editor.storage.characterCount.characters()} 字符
			</span>
		</div>
	{/if}
</div>

<style>
	.tiptap-editor {
		position: relative;
		width: 100%;
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		background: hsl(var(--background));
		overflow: hidden;
	}

	.editor-container {
		min-height: 400px;
		max-height: 70vh;
		overflow-y: auto;
	}

	.editor-footer {
		display: flex;
		justify-content: flex-end;
		padding: 8px 16px;
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.char-count {
		font-size: 12px;
		color: hsl(var(--muted-foreground));
	}
</style>
