<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initTheme } from '$lib/stores/theme';

	onMount(() => {
		initTheme();
	});
</script>

<slot />
