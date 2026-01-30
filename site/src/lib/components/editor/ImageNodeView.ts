import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ImageOptions {
	inline: boolean;
	allowBase64: boolean;
	HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		customImage: {
			setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
			setImagePlaceholder: (options: { id: string; file?: File }) => ReturnType;
			removePlaceholder: (id: string) => ReturnType;
			replacePlaceholderWithImage: (options: { id: string; src: string; alt?: string }) => ReturnType;
		};
	}
}

export const ImageExtension = Node.create<ImageOptions>({
	name: 'image',

	addOptions() {
		return {
			inline: false,
			allowBase64: true,
			HTMLAttributes: {},
		};
	},

	inline() {
		return this.options.inline;
	},

	group() {
		return this.options.inline ? 'inline' : 'block';
	},

	draggable: true,

	addAttributes() {
		return {
			src: {
				default: null,
			},
			alt: {
				default: null,
			},
			title: {
				default: null,
			},
			'data-uploading': {
				default: null,
			},
			'data-placeholder-id': {
				default: null,
			},
		};
	},

	parseHTML() {
		return [{ tag: 'img[src]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
	},

	addNodeView() {
		return ({ node, HTMLAttributes }) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'image-wrapper';

			const img = document.createElement('img');
			const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);

			Object.entries(attrs).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					img.setAttribute(key, value);
				}
			});

			const isUploading = node.attrs['data-uploading'] === 'true';

			if (isUploading) {
				wrapper.classList.add('uploading');

				const overlay = document.createElement('div');
				overlay.className = 'upload-overlay';

				const spinner = document.createElement('div');
				spinner.className = 'upload-spinner';

				const text = document.createElement('span');
				text.className = 'upload-text';
				text.textContent = 'Uploading...';

				overlay.appendChild(spinner);
				overlay.appendChild(text);
				wrapper.appendChild(img);
				wrapper.appendChild(overlay);
			} else {
				// Handle image loading state
				img.style.opacity = '0';
				img.style.transition = 'opacity 0.3s ease';

				const placeholder = document.createElement('div');
				placeholder.className = 'image-loading-placeholder';

				const loadingSpinner = document.createElement('div');
				loadingSpinner.className = 'loading-spinner';

				const loadingText = document.createElement('span');
				loadingText.className = 'loading-text';
				loadingText.textContent = 'Loading image...';

				placeholder.appendChild(loadingSpinner);
				placeholder.appendChild(loadingText);
				wrapper.appendChild(placeholder);
				wrapper.appendChild(img);

				img.onload = () => {
					img.style.opacity = '1';
					placeholder.style.display = 'none';
				};

				img.onerror = () => {
					placeholder.querySelector('.loading-text')!.textContent = 'Failed to load image';
					placeholder.classList.add('error');
				};
			}

			return {
				dom: wrapper,
				contentDOM: null,
				update: (updatedNode) => {
					if (updatedNode.type.name !== this.name) {
						return false;
					}

					const wasUploading = wrapper.classList.contains('uploading');
					const isNowUploading = updatedNode.attrs['data-uploading'] === 'true';

					// Update image src if changed
					const newSrc = updatedNode.attrs.src;
					if (newSrc && img.src !== newSrc) {
						img.src = newSrc;
					}

					// Handle transition from uploading to completed
					if (wasUploading && !isNowUploading) {
						wrapper.classList.remove('uploading');
						const overlay = wrapper.querySelector('.upload-overlay');
						if (overlay) {
							overlay.remove();
						}

						// Remove uploading attribute from img
						img.removeAttribute('data-uploading');
						img.removeAttribute('data-placeholder-id');

						// Reset image styles and add loading placeholder
						img.style.opacity = '0';
						img.style.filter = '';
						img.style.transition = 'opacity 0.3s ease';

						// Create loading placeholder for the new image
						const placeholder = document.createElement('div');
						placeholder.className = 'image-loading-placeholder';

						const loadingSpinner = document.createElement('div');
						loadingSpinner.className = 'loading-spinner';

						const loadingText = document.createElement('span');
						loadingText.className = 'loading-text';
						loadingText.textContent = 'Loading image...';

						placeholder.appendChild(loadingSpinner);
						placeholder.appendChild(loadingText);
						wrapper.insertBefore(placeholder, img);

						// Handle image load
						img.onload = () => {
							img.style.opacity = '1';
							placeholder.style.display = 'none';
						};

						img.onerror = () => {
							const text = placeholder.querySelector('.loading-text');
							if (text) text.textContent = 'Failed to load image';
							placeholder.classList.add('error');
						};
					}

					return true;
				},
			};
		};
	},

	addCommands() {
		return {
			setImage:
				(options) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: options,
					});
				},

			setImagePlaceholder:
				(options) =>
				({ commands }) => {
					const placeholderSrc = options.file
						? URL.createObjectURL(options.file)
						: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

					return commands.insertContent({
						type: this.name,
						attrs: {
							src: placeholderSrc,
							alt: 'Uploading...',
							'data-uploading': 'true',
							'data-placeholder-id': options.id,
						},
					});
				},

			removePlaceholder:
				(id) =>
				({ tr, state, dispatch }) => {
					const { doc } = state;
					let found = false;

					doc.descendants((node, pos) => {
						if (node.type.name === this.name && node.attrs['data-placeholder-id'] === id) {
							if (dispatch) {
								tr.delete(pos, pos + node.nodeSize);
							}
							found = true;
							return false;
						}
					});

					return found;
				},

			replacePlaceholderWithImage:
				(options) =>
				({ tr, state, dispatch }) => {
					const { doc } = state;
					let found = false;

					doc.descendants((node, pos) => {
						if (node.type.name === this.name && node.attrs['data-placeholder-id'] === options.id) {
							if (dispatch) {
								const newAttrs = {
									...node.attrs,
									src: options.src,
									alt: options.alt || '',
									'data-uploading': null,
									'data-placeholder-id': null,
								};
								tr.setNodeMarkup(pos, undefined, newAttrs);
							}
							found = true;
							return false;
						}
					});

					return found;
				},
		};
	},
});

export default ImageExtension;
