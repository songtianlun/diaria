<script lang="ts">
	import type { Editor } from '@tiptap/core';

	export let editor: Editor;
	export let onUploadImage: (file: File) => Promise<void>;
	export let isUploading = false;

	let fileInput: HTMLInputElement;
	let showLinkInput = false;
	let linkUrl = '';

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			onUploadImage(file);
			input.value = '';
		}
	}

	function setLink() {
		if (linkUrl) {
			editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
		} else {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		}
		showLinkInput = false;
		linkUrl = '';
	}

	function toggleLinkInput() {
		showLinkInput = !showLinkInput;
		if (showLinkInput) {
			linkUrl = editor.getAttributes('link').href || '';
		}
	}
</script>

<div class="toolbar">
	<div class="toolbar-group">
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('bold')}
			on:click={() => editor.chain().focus().toggleBold().run()}
			title="粗体"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('italic')}
			on:click={() => editor.chain().focus().toggleItalic().run()}
			title="斜体"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="19" y1="4" x2="10" y2="4"></line>
				<line x1="14" y1="20" x2="5" y2="20"></line>
				<line x1="15" y1="4" x2="9" y2="20"></line>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('underline')}
			on:click={() => editor.chain().focus().toggleUnderline().run()}
			title="下划线"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6 4v6a6 6 0 0 0 12 0V4"></path>
				<line x1="4" y1="20" x2="20" y2="20"></line>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('strike')}
			on:click={() => editor.chain().focus().toggleStrike().run()}
			title="删除线"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M16 4H9a3 3 0 0 0-2.83 4"></path>
				<path d="M14 12a4 4 0 0 1 0 8H6"></path>
				<line x1="4" y1="12" x2="20" y2="12"></line>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('highlight')}
			on:click={() => editor.chain().focus().toggleHighlight().run()}
			title="高亮"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m9 11-6 6v3h9l3-3"></path>
				<path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
			</svg>
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<div class="toolbar-group">
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('heading', { level: 1 })}
			on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			title="标题 1"
		>
			H1
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('heading', { level: 2 })}
			on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			title="标题 2"
		>
			H2
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('heading', { level: 3 })}
			on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			title="标题 3"
		>
			H3
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<div class="toolbar-group">
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('bulletList')}
			on:click={() => editor.chain().focus().toggleBulletList().run()}
			title="无序列表"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="8" y1="6" x2="21" y2="6"></line>
				<line x1="8" y1="12" x2="21" y2="12"></line>
				<line x1="8" y1="18" x2="21" y2="18"></line>
				<line x1="3" y1="6" x2="3.01" y2="6"></line>
				<line x1="3" y1="12" x2="3.01" y2="12"></line>
				<line x1="3" y1="18" x2="3.01" y2="18"></line>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('orderedList')}
			on:click={() => editor.chain().focus().toggleOrderedList().run()}
			title="有序列表"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="10" y1="6" x2="21" y2="6"></line>
				<line x1="10" y1="12" x2="21" y2="12"></line>
				<line x1="10" y1="18" x2="21" y2="18"></line>
				<path d="M4 6h1v4"></path>
				<path d="M4 10h2"></path>
				<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('taskList')}
			on:click={() => editor.chain().focus().toggleTaskList().run()}
			title="任务列表"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="5" width="6" height="6" rx="1"></rect>
				<path d="m3 17 2 2 4-4"></path>
				<path d="M13 6h8"></path>
				<path d="M13 12h8"></path>
				<path d="M13 18h8"></path>
			</svg>
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<div class="toolbar-group">
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('blockquote')}
			on:click={() => editor.chain().focus().toggleBlockquote().run()}
			title="引用"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path>
				<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"></path>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('code')}
			on:click={() => editor.chain().focus().toggleCode().run()}
			title="行内代码"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="16 18 22 12 16 6"></polyline>
				<polyline points="8 6 2 12 8 18"></polyline>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={editor.isActive('codeBlock')}
			on:click={() => editor.chain().focus().toggleCodeBlock().run()}
			title="代码块"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="3" width="18" height="18" rx="2"></rect>
				<path d="m10 10-2 2 2 2"></path>
				<path d="m14 14 2-2-2-2"></path>
			</svg>
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<div class="toolbar-group">
		<div class="link-wrapper">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor.isActive('link')}
				on:click={toggleLinkInput}
				title="链接"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
				</svg>
			</button>
			{#if showLinkInput}
				<div class="link-input-popup">
					<input
						type="url"
						bind:value={linkUrl}
						placeholder="输入链接地址..."
						on:keydown={(e) => e.key === 'Enter' && setLink()}
					/>
					<button type="button" on:click={setLink}>确定</button>
				</div>
			{/if}
		</div>
		<button
			type="button"
			class="toolbar-btn"
			class:uploading={isUploading}
			on:click={() => fileInput.click()}
			disabled={isUploading}
			title="上传图片"
		>
			{#if isUploading}
				<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<circle cx="8.5" cy="8.5" r="1.5"></circle>
					<polyline points="21 15 16 10 5 21"></polyline>
				</svg>
			{/if}
		</button>
		<input
			type="file"
			accept="image/*"
			bind:this={fileInput}
			on:change={handleFileSelect}
			style="display: none;"
		/>
	</div>

	<div class="toolbar-divider"></div>

	<div class="toolbar-group">
		<button
			type="button"
			class="toolbar-btn"
			on:click={() => editor.chain().focus().setHorizontalRule().run()}
			title="分割线"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="3" y1="12" x2="21" y2="12"></line>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			on:click={() => editor.chain().focus().undo().run()}
			disabled={!editor.can().undo()}
			title="撤销"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 7v6h6"></path>
				<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			on:click={() => editor.chain().focus().redo().run()}
			disabled={!editor.can().redo()}
			title="重做"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 7v6h-6"></path>
				<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
			</svg>
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		padding: 8px 12px;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: hsl(var(--border));
		margin: 0 4px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 13px;
		font-weight: 600;
	}

	.toolbar-btn:hover:not(:disabled) {
		background: hsl(var(--accent));
	}

	.toolbar-btn.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.toolbar-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toolbar-btn.uploading {
		opacity: 0.7;
	}

	.link-wrapper {
		position: relative;
	}

	.link-input-popup {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 100;
		display: flex;
		gap: 8px;
		padding: 8px;
		margin-top: 4px;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
	}

	.link-input-popup input {
		width: 200px;
		padding: 6px 10px;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		font-size: 13px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.link-input-popup input:focus {
		outline: none;
		border-color: hsl(var(--primary));
	}

	.link-input-popup button {
		padding: 6px 12px;
		border: none;
		border-radius: 6px;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		font-size: 13px;
		cursor: pointer;
	}

	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@media (max-width: 640px) {
		.toolbar {
			padding: 6px 8px;
		}
		.toolbar-btn {
			width: 28px;
			height: 28px;
		}
		.toolbar-divider {
			height: 20px;
		}
	}
</style>
