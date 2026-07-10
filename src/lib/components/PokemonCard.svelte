<script lang="ts">
	import { base } from '$app/paths';
	import type { Pokemon } from '$lib/api/schemas';
	import { formatName, typeColor } from '$lib/utils/pokemon';
	import TypeBadge from './TypeBadge.svelte';
	import PokemonImage from './PokemonImage.svelte';
	import FavoriteButton from './FavoriteButton.svelte';

	const { pokemon, priority = false }: { pokemon: Pokemon; priority?: boolean } = $props();

	const artwork = $derived(
		pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default
	);
	const primaryType = $derived(pokemon.types[0]?.type.name ?? 'normal');
</script>

<a
	href={`${base}/pokemon/${pokemon.name}`}
	class="focus-ring group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
	data-testid="pokemon-card"
	data-pokemon={pokemon.name}
>
	<div
		class="relative flex aspect-square items-center justify-center overflow-hidden p-4"
		style:background="linear-gradient(135deg, color-mix(in srgb, {typeColor(
			primaryType
		)} 20%, transparent), transparent)"
	>
		<PokemonImage
			src={artwork}
			alt={pokemon.name}
			{priority}
			class="h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
		/>
		<FavoriteButton name={pokemon.name} class="absolute top-2 right-2" />
		<span
			class="absolute top-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 backdrop-blur dark:bg-slate-900/80 dark:text-slate-300"
		>
			#{String(pokemon.id).padStart(3, '0')}
		</span>
	</div>
	<div class="flex flex-1 flex-col gap-2 p-4">
		<h2 class="truncate text-base font-bold text-slate-900 dark:text-white">
			{formatName(pokemon.name)}
		</h2>
		<div class="flex flex-wrap gap-1.5">
			{#each pokemon.types as t (t.slot)}
				<TypeBadge type={t.type.name} />
			{/each}
		</div>
	</div>
</a>

