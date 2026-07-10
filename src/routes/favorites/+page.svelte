<script lang="ts">
	import { base } from '$app/paths';
	import { Heart, Loader2 } from 'lucide-svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { getPokemon } from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';
	import { mapWithConcurrency } from '$lib/utils/concurrency';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import CardSkeleton from '$lib/components/CardSkeleton.svelte';

	let pokemonList = $state<Pokemon[]>([]);
	let loading = $state(true);

	$effect(() => {
		const names = favoritesStore.value;
		loading = true;
		mapWithConcurrency(names, 8, (name) => getPokemon(name)).then((results) => {
			pokemonList = results;
			loading = false;
		});
	});
</script>

<svelte:head>
	<title>Favorites - Pokédex</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	<div class="mb-8 flex items-center gap-3">
		<span class="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-500 dark:bg-red-950">
			<Heart size={20} fill="currentColor" />
		</span>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
				Favorites
			</h1>
			<p class="text-slate-500 dark:text-slate-400">{favoritesStore.value.length} Pokémon saved</p>
		</div>
	</div>

	{#if favoritesStore.value.length === 0}
		<div
			class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-24 text-center dark:border-slate-700"
		>
			<Heart size={40} class="text-slate-300 dark:text-slate-600" />
			<p class="text-lg font-semibold text-slate-700 dark:text-slate-200">No favorites yet</p>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				Tap the heart icon on any Pokémon to save it here.
			</p>
			<a
				href={`${base}/`}
				class="focus-ring mt-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
			>
				Browse Pokédex
			</a>
		</div>
	{:else if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each favoritesStore.value as name (name)}
				<CardSkeleton />
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each pokemonList as pokemon (pokemon.name)}
				<PokemonCard {pokemon} />
			{/each}
		</div>
	{/if}
</div>
