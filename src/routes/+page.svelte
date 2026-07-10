<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-svelte';
	import { getMasterPokemonIndex, getGenerationNames, getTypeNames } from '$lib/api';
	import { getPokemon } from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';
	import { ALL_TYPES, formatName, typeColor, typeBadgeColor } from '$lib/utils/pokemon';
	import { mapWithConcurrency } from '$lib/utils/concurrency';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import CardSkeleton from '$lib/components/CardSkeleton.svelte';

	const PAGE_SIZE = 30;
	const GENERATIONS = Array.from({ length: 9 }, (_, i) => i + 1);

	let masterIndex = $state<{ name: string; id: number }[]>([]);
	let indexLoading = $state(true);
	let indexError = $state<string | null>(null);

	let searchInput = $state('');
	let search = $state('');
	let selectedGenerations = $state<number[]>([]);
	let selectedTypes = $state<string[]>([]);
	let sortBy = $state<'id' | 'stats'>('id');
	let filtersOpen = $state(false);

	const generationSets = new Map<number, Set<string>>();
	const typeSets = new Map<string, Set<string>>();
	let filterSetsVersion = $state(0);
	let filterSetsLoading = $state(false);
	let filterSetsToken = 0;

	let pokemonCache = $state<Map<string, Pokemon>>(new Map());
	let visibleCount = $state(PAGE_SIZE);
	let statsSortedNames = $state<string[] | null>(null);
	let statsSorting = $state(false);
	let statsSortProgress = $state(0);

	let debounceHandle: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const value = searchInput;
		clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => {
			search = value;
		}, 250);
	});

	onMount(async () => {
		try {
			masterIndex = await getMasterPokemonIndex();
		} catch {
			indexError = 'Failed to load the Pokédex index. Please refresh.';
		} finally {
			indexLoading = false;
		}
	});

	async function ensureFilterSets() {
		const missingGens = selectedGenerations.filter((g) => !generationSets.has(g));
		const missingTypes = selectedTypes.filter((t) => !typeSets.has(t));
		if (missingGens.length === 0 && missingTypes.length === 0) {
			return;
		}
		const token = (filterSetsToken += 1);
		filterSetsLoading = true;
		await Promise.all([
			...missingGens.map(async (g) => {
				generationSets.set(g, await getGenerationNames(g));
			}),
			...missingTypes.map(async (t) => {
				typeSets.set(t, await getTypeNames(t));
			})
		]);
		if (token === filterSetsToken) {
			filterSetsLoading = false;
		}
		filterSetsVersion += 1;
	}

	$effect(() => {
		selectedGenerations;
		selectedTypes;
		ensureFilterSets();
	});

	const filteredIndex = $derived.by(() => {
		filterSetsVersion;
		let entries = masterIndex;

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			entries = entries.filter((e) => e.name.includes(q) || String(e.id) === q);
		}

		if (selectedGenerations.length > 0) {
			const sets = selectedGenerations.map((g) => generationSets.get(g)).filter(Boolean) as Set<
				string
			>[];
			if (sets.length === selectedGenerations.length) {
				entries = entries.filter((e) => sets.some((s) => s.has(e.name)));
			}
		}

		if (selectedTypes.length > 0) {
			const sets = selectedTypes.map((t) => typeSets.get(t)).filter(Boolean) as Set<string>[];
			if (sets.length === selectedTypes.length) {
				entries = entries.filter((e) => sets.every((s) => s.has(e.name)));
			}
		}

		return entries;
	});

	const hasActiveFilters = $derived(
		search.trim().length > 0 || selectedGenerations.length > 0 || selectedTypes.length > 0
	);

	$effect(() => {
		filteredIndex;
		sortBy;
		visibleCount = PAGE_SIZE;
		statsSortedNames = null;
	});

	let statsSortToken = 0;

	async function computeStatsSort() {
		const token = (statsSortToken += 1);
		statsSorting = true;
		statsSortProgress = 0;
		const names = filteredIndex.map((e) => e.name);
		let done = 0;
		await mapWithConcurrency(names, 24, async (name) => {
			if (!pokemonCache.has(name)) {
				try {
					const p = await getPokemon(name);
					pokemonCache.set(name, p);
				} catch {
					// skip failed fetch, Pokémon simply sorts to the bottom
				}
			}
			done += 1;
			if (token === statsSortToken) {
				statsSortProgress = done;
			}
		});
		if (token !== statsSortToken) {
			// a newer sort request superseded this one; discard the stale result
			return;
		}
		pokemonCache = new Map(pokemonCache);
		const sorted = [...names].toSorted((a, b) => {
			const statsA = pokemonCache.get(a)?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0;
			const statsB = pokemonCache.get(b)?.stats.reduce((sum, s) => sum + s.base_stat, 0) ?? 0;
			return statsB - statsA;
		});
		statsSortedNames = sorted;
		statsSorting = false;
	}

	$effect(() => {
		if (sortBy === 'stats' && statsSortedNames === null && filteredIndex.length > 0) {
			computeStatsSort();
		}
	});

	const orderedNames = $derived(
		sortBy === 'stats' && statsSortedNames ? statsSortedNames : filteredIndex.map((e) => e.name)
	);

	const visibleNames = $derived(orderedNames.slice(0, visibleCount));

	let loadingVisible = $state(false);
	$effect(() => {
		const names = visibleNames;
		const missing = names.filter((n) => !pokemonCache.has(n));
		if (missing.length === 0) {
			return;
		}
		loadingVisible = true;
		mapWithConcurrency(missing, 8, async (name) => {
			try {
				const p = await getPokemon(name);
				pokemonCache.set(name, p);
			} catch {
				// skip failed fetch, card simply won't render
			}
		}).then(() => {
			pokemonCache = new Map(pokemonCache);
			loadingVisible = false;
		});
	});

	const visiblePokemon = $derived(
		visibleNames.map((n) => pokemonCache.get(n)).filter((p): p is Pokemon => Boolean(p))
	);

	const hasMore = $derived(visibleCount < orderedNames.length);

	function toggleGeneration(gen: number) {
		selectedGenerations = selectedGenerations.includes(gen)
			? selectedGenerations.filter((g) => g !== gen)
			: [...selectedGenerations, gen];
	}

	function toggleType(type: string) {
		selectedTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
	}

	function clearFilters() {
		searchInput = '';
		search = '';
		selectedGenerations = [];
		selectedTypes = [];
		sortBy = 'id';
	}

	let sentinel: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!sentinel) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasMore && !statsSorting) {
					visibleCount += PAGE_SIZE;
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta
		name="description"
		content="Browse, search, and filter every Pokémon with a modern animated Pokédex."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
			Explore the Pokédex
		</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">
			{masterIndex.length > 0 ? `${masterIndex.length} Pokémon` : 'Loading Pokédex data…'} · search,
			filter, and discover
		</p>
	</div>

	<div
		class="sticky top-[65px] z-40 mb-6 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90"
	>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div class="relative flex-1">
				<Search
					size={18}
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="search"
					placeholder="Search by name or number…"
					bind:value={searchInput}
					class="focus-ring w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
					aria-label="Search Pokémon by name or number"
				/>
			</div>

			<div class="flex items-center gap-2">
				<label class="sr-only" for="sort-select">Sort by</label>
				<select
					id="sort-select"
					bind:value={sortBy}
					class="focus-ring rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
				>
					<option value="id">Sort: Dex Number</option>
					<option value="stats">Sort: Base Stat Total</option>
				</select>

				<button
					type="button"
					onclick={() => (filtersOpen = !filtersOpen)}
					class="focus-ring flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
					aria-expanded={filtersOpen}
				>
					<SlidersHorizontal size={16} />
					Filters
					{#if selectedGenerations.length + selectedTypes.length > 0}
						<span
							class="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-xs text-white"
						>
							{selectedGenerations.length + selectedTypes.length}
						</span>
					{/if}
				</button>

				{#if hasActiveFilters}
					<button
						type="button"
						onclick={clearFilters}
						class="focus-ring flex items-center gap-1 rounded-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
					>
						<X size={16} />
						Clear
					</button>
				{/if}
			</div>
		</div>

		{#if filtersOpen}
			<div class="mt-4 flex flex-col gap-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
				<div>
					<p class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
						Generation
					</p>
					<div class="flex flex-wrap gap-2">
						{#each GENERATIONS as gen (gen)}
							<button
								type="button"
								onclick={() => toggleGeneration(gen)}
								class="focus-ring rounded-full border px-3 py-1.5 text-sm font-medium transition-colors {selectedGenerations.includes(
									gen
								)
									? 'border-indigo-600 bg-indigo-600 text-white'
									: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
								aria-pressed={selectedGenerations.includes(gen)}
							>
								Gen {gen}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<p class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
						Type
					</p>
					<div class="flex flex-wrap gap-2">
						{#each ALL_TYPES as type (type)}
							<button
								type="button"
								onclick={() => toggleType(type)}
								style:background-color={selectedTypes.includes(type)
								? typeBadgeColor(type)
								: undefined}
								class="focus-ring rounded-full border px-3 py-1.5 text-sm font-medium transition-colors {selectedTypes.includes(
									type
								)
									? 'border-transparent text-white'
									: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
								aria-pressed={selectedTypes.includes(type)}
							>
								{formatName(type)}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		{#if filterSetsLoading}
			<p class="mt-3 flex items-center gap-2 text-xs text-slate-400">
				<Loader2 size={14} class="animate-spin" /> Updating filters…
			</p>
		{/if}
	</div>

	{#if indexError}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
			{indexError}
		</div>
	{:else if indexLoading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each Array(10) as _, i (i)}
				<CardSkeleton />
			{/each}
		</div>
	{:else if statsSorting}
		<div class="flex flex-col items-center gap-3 py-24 text-slate-500 dark:text-slate-400">
			<Loader2 size={28} class="animate-spin" />
			<p>Crunching base stats… {statsSortProgress}/{filteredIndex.length}</p>
			<div class="h-1.5 w-64 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
				<div
					class="h-full rounded-full bg-indigo-600 transition-[width] duration-200"
					style:width="{filteredIndex.length
						? Math.round((statsSortProgress / filteredIndex.length) * 100)
						: 0}%"
				></div>
			</div>
		</div>
	{:else if orderedNames.length === 0}
		<div
			class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-24 text-center dark:border-slate-700"
		>
			<p class="text-lg font-semibold text-slate-700 dark:text-slate-200">No Pokémon found</p>
			<p class="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
			<button
				type="button"
				onclick={clearFilters}
				class="focus-ring mt-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each visiblePokemon as pokemon, i (pokemon.name)}
				<PokemonCard {pokemon} priority={i < 5} />
			{/each}
			{#if loadingVisible}
				{#each Array(Math.min(PAGE_SIZE, orderedNames.length - visiblePokemon.length)) as _, i (i)}
					<CardSkeleton />
				{/each}
			{/if}
		</div>

		{#if hasMore}
			<div bind:this={sentinel} class="h-10 w-full"></div>
		{/if}
	{/if}
</div>
