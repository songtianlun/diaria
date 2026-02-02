<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let disabled = false;
	export let placeholder = 'Type your message...';

	let content = '';
	const dispatch = createEventDispatcher<{ send: string }>();

	function handleSubmit() {
		if (content.trim() && !disabled) {
			dispatch('send', content.trim());
			content = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="flex gap-2 sm:gap-3">
	<div class="flex-1 flex items-end">
		<textarea
			bind:value={content}
			on:keydown={handleKeydown}
			{placeholder}
			{disabled}
			rows="1"
			class="w-full resize-none rounded-xl sm:rounded-2xl border border-border bg-background
				px-3 sm:px-4 text-sm leading-[1.5]
				focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
				disabled:opacity-50 disabled:cursor-not-allowed
				max-h-[200px] shadow-sm box-border"
			style="field-sizing: content; padding-top: 11px; padding-bottom: 11px; min-height: 44px;"
		></textarea>
	</div>

	<div class="flex items-end">
		<button
			type="submit"
			disabled={disabled || !content.trim()}
			title="Send message"
			class="h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-xl sm:rounded-2xl
				bg-primary text-primary-foreground
				hover:bg-primary/90 active:scale-95 transition-all duration-150
				disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
				flex-shrink-0 flex items-center justify-center shadow-sm"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
			</svg>
		</button>
	</div>
</form>
