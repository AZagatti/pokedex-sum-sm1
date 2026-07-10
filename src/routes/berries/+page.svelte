<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { getBerryList } from '$lib/api/client';
	import { formatName } from '$lib/utils/pokemon';
	import { Loader2 } from 'lucide-svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';

	let berries = $state<{ name: string; id: number }[]>([]);
	let loading = $state(true);
	let errored = $state(false);

	onMount(async () => {
		try {
			const list = await getBerryList(100, 0);
			berries = list.results.map((r, i) => ({ id: i + 1, name: r.name }));
		} catch {
			errored = true;
		} finally {
			loading = false;
		}
	});

	function spriteUrl(name: string): string {
		return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berries/${name}-berry.png`;
	}
</script>

<svelte:head>
	<title>Berries - Pokédex</title>
	<meta name="description" content="Browse every berry from the Pokémon world." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
			Berries
		</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">
			{berries.length > 0 ? `${berries.length} berries` : 'Loading berries…'}
		</p>
	</div>

	{#if errored}
		<div
			class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
		>
			Failed to load berries. Please refresh.
		</div>
	{:else if loading}
		<div class="flex justify-center py-24 text-slate-400">
			<Loader2 size={28} class="animate-spin" />
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each berries as berry (berry.name)}
				<a
					href={`${base}/berries/${berry.name}`}
					class="focus-ring group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/70 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
				>
					<PokemonImage
						src={spriteUrl(berry.name)}
						alt={berry.name}
						class="h-16 w-16 object-contain transition-transform group-hover:scale-110"
					/>
					<span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
						{formatName(berry.name)} Berry
					</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
