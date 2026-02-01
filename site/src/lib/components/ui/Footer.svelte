<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let { maxWidth = '6xl', tagline = '' }: { maxWidth?: string; tagline?: string } = $props();

	let version = $state('');

	onMount(() => {
		fetchVersion();
	});

	async function fetchVersion() {
		try {
			const res = await fetch('/api/version');
			if (res.ok) {
				const data = await res.json();
				version = data.version;
			}
		} catch (e) {
			// Silently fail
		}
	}

	const maxWidthClasses: Record<string, string> = {
		'md': 'max-w-md',
		'3xl': 'max-w-3xl',
		'6xl': 'max-w-6xl'
	};
	let maxWidthClass = $derived(maxWidthClasses[maxWidth] || 'max-w-6xl');
</script>

<footer class="border-t border-border/50 mt-auto">
	<div class="{maxWidthClass} mx-auto px-4 py-3">
		<div class="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4">
			<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				{#if tagline}
					<span class="whitespace-nowrap">{tagline}</span>
				{/if}
				<span class="whitespace-nowrap">© {new Date().getFullYear()} Diarum</span>
				{#if version}
					<span class="font-mono text-[10px] text-muted-foreground/70 whitespace-nowrap">{version}</span>
				{/if}
			</div>
			<ThemeToggle />
		</div>
	</div>
</footer>
