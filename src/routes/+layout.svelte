<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	const { children } = $props();

	themeStore.init();
	favoritesStore.init();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<footer
		class="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-400"
	>
		Data from <a
			href="https://pokeapi.co"
			class="focus-ring rounded underline underline-offset-2"
			target="_blank"
			rel="noreferrer">PokéAPI</a
		>. Built with SvelteKit.
	</footer>
</div>

