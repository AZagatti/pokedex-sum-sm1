<script lang="ts">
	import { base } from '$app/paths';
	import { ArrowLeft, Volume2, Ruler, Weight } from 'lucide-svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import StatBar from '$lib/components/StatBar.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import { formatName, typeColor, flattenEvolutionChain } from '$lib/utils/pokemon';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const pokemon = $derived(data.pokemon);
	const species = $derived(data.species);

	type SpriteVariant = 'front' | 'back' | 'front-shiny' | 'back-shiny';
	let spriteVariant = $state<SpriteVariant>('front');

	const spriteOptions: { key: SpriteVariant; label: string }[] = [
		{ key: 'front', label: 'Front' },
		{ key: 'back', label: 'Back' },
		{ key: 'front-shiny', label: 'Shiny Front' },
		{ key: 'back-shiny', label: 'Shiny Back' }
	];

	const artwork = $derived(
		pokemon.sprites.other?.['official-artwork']?.front_default ??
			pokemon.sprites.front_default ??
			null
	);

	const currentSprite = $derived.by(() => {
		switch (spriteVariant) {
			case 'front': {
				return pokemon.sprites.front_default;
			}
			case 'back': {
				return pokemon.sprites.back_default;
			}
			case 'front-shiny': {
				return pokemon.sprites.front_shiny;
			}
			case 'back-shiny': {
				return pokemon.sprites.back_shiny;
			}
			default: {
				return pokemon.sprites.front_default;
			}
		}
	});

	const primaryType = $derived(pokemon.types[0]?.type.name ?? 'normal');
	const flavorText = $derived(
		species.flavor_text_entries
			.find((f) => f.language.name === 'en')
			?.flavor_text.replaceAll(/[\n\f]/gu, ' ') ?? ''
	);

	const evolutionStages = $derived(flattenEvolutionChain(data.evolutionChain.chain));

	let audio: HTMLAudioElement | undefined = $state();
	let playingCry = $state(false);

	function playCry() {
		if (!pokemon.cries?.latest) {
			return;
		}
		if (!audio) {
			audio = new Audio(pokemon.cries.latest);
			audio.addEventListener('ended', () => {
				playingCry = false;
			});
		}
		playingCry = true;
		audio.currentTime = 0;
		audio.play().catch(() => {
			playingCry = false;
		});
	}

	const exampleMoves = $derived(pokemon.moves.slice(0, 8));
</script>

<svelte:head>
	<title>{formatName(pokemon.name)} - Pokédex</title>
	<meta name="description" content={flavorText || `Details for ${formatName(pokemon.name)}`} />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<a
		href={`${base}/`}
		class="focus-ring mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
	>
		<ArrowLeft size={16} />
		Back to Pokédex
	</a>

	<div
		class="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	>
		<div
			class="relative flex flex-col items-center gap-4 p-8 text-center"
			style:background="linear-gradient(160deg, color-mix(in srgb, {typeColor(
				primaryType
			)} 30%, transparent), transparent)"
		>
			<FavoriteButton name={pokemon.name} class="absolute top-4 right-4" />
			<span class="text-sm font-bold text-slate-400"
				>#{String(pokemon.id).padStart(3, '0')}</span
			>

			<div
				class="pokemon-entrance h-56 w-56 sm:h-64 sm:w-64"
				style:filter="drop-shadow(0 10px 20px color-mix(in srgb, {typeColor(
					primaryType
				)} 40%, transparent))"
			>
				<PokemonImage src={artwork} alt={pokemon.name} class="h-full w-full object-contain" />
			</div>

			<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
				{formatName(pokemon.name)}
			</h1>

			<div class="flex flex-wrap justify-center gap-2">
				{#each pokemon.types as t (t.slot)}
					<TypeBadge type={t.type.name} />
				{/each}
			</div>

			{#if flavorText}
				<p class="max-w-lg text-sm text-slate-600 dark:text-slate-300">{flavorText}</p>
			{/if}

			{#if pokemon.cries?.latest}
				<button
					type="button"
					onclick={playCry}
					disabled={playingCry}
					class="focus-ring flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60 dark:bg-white dark:text-slate-900"
				>
					<Volume2 size={16} class={playingCry ? 'animate-pulse' : ''} />
					{playingCry ? 'Playing…' : 'Play Cry'}
				</button>
			{/if}
		</div>

		<div class="grid gap-8 border-t border-slate-200/70 p-6 sm:p-8 md:grid-cols-2 dark:border-slate-800">
			<section>
				<h2 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">Physical</h2>
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
						<div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
							<Ruler size={16} />
							<span class="text-xs font-semibold uppercase">Height</span>
						</div>
						<p class="mt-1 text-xl font-bold text-slate-900 dark:text-white">
							{(pokemon.height / 10).toFixed(1)} m
						</p>
					</div>
					<div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
						<div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
							<Weight size={16} />
							<span class="text-xs font-semibold uppercase">Weight</span>
						</div>
						<p class="mt-1 text-xl font-bold text-slate-900 dark:text-white">
							{(pokemon.weight / 10).toFixed(1)} kg
						</p>
					</div>
				</div>

				<h2 class="mt-6 mb-3 text-lg font-bold text-slate-900 dark:text-white">Abilities</h2>
				<div class="flex flex-wrap gap-2">
					{#each pokemon.abilities as a (a.slot)}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
						>
							{formatName(a.ability.name)}
							{#if a.is_hidden}
								<span
									class="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
									>Hidden</span
								>
							{/if}
						</span>
					{/each}
				</div>

				<h2 class="mt-6 mb-3 text-lg font-bold text-slate-900 dark:text-white">Example Moves</h2>
				<div class="flex flex-wrap gap-2">
					{#each exampleMoves as m (m.move.name)}
						<span
							class="rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
						>
							{formatName(m.move.name)}
						</span>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">Base Stats</h2>
				<div class="flex flex-col gap-2.5">
					{#each pokemon.stats as s (s.stat.name)}
						<StatBar name={s.stat.name} value={s.base_stat} color={typeColor(primaryType)} />
					{/each}
				</div>

				<h2 class="mt-6 mb-3 text-lg font-bold text-slate-900 dark:text-white">Sprites</h2>
				<div class="mb-3 flex flex-wrap gap-2">
					{#each spriteOptions as opt (opt.key)}
						<button
							type="button"
							onclick={() => (spriteVariant = opt.key)}
							class="focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors {spriteVariant ===
							opt.key
								? 'border-indigo-600 bg-indigo-600 text-white'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}"
						>
							{opt.label}
						</button>
					{/each}
				</div>
				<div
					class="grid h-40 place-items-center rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
				>
					<PokemonImage
						src={currentSprite}
						alt={`${pokemon.name} ${spriteVariant}`}
						class="h-28 w-28 object-contain [image-rendering:pixelated]"
					/>
				</div>
			</section>
		</div>

		{#if evolutionStages.length > 1}
			<div class="border-t border-slate-200/70 p-6 sm:p-8 dark:border-slate-800">
				<h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">Evolution Chain</h2>
				<div class="flex flex-wrap items-center gap-4">
					{#each evolutionStages as stage, stageIndex (stageIndex)}
						{#if stageIndex > 0}
							<span class="text-2xl text-slate-300 dark:text-slate-600">→</span>
						{/if}
						<div class="flex flex-wrap gap-3">
							{#each stage as step (step.name)}
								<a
									href={`${base}/pokemon/${step.name}`}
									class="focus-ring flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-transform hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
								>
									<PokemonImage
										src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.id}.png`}
										alt={step.name}
										class="h-16 w-16 object-contain"
									/>
									<span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
										{formatName(step.name)}
									</span>
									{#if step.minLevel}
										<span class="text-[10px] text-slate-400">Lv. {step.minLevel}</span>
									{/if}
								</a>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.pokemon-entrance {
		animation: pokemon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.pokemon-entrance {
			animation: none;
		}
	}

	@keyframes pokemon-pop {
		from {
			opacity: 0;
			transform: scale(0.6) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
