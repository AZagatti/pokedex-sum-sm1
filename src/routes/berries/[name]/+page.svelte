<script lang="ts">
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';
	import { formatName, typeColor } from '$lib/utils/pokemon';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const berry = $derived(data.berry);

	const spriteUrl = $derived(
		`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berries/${berry.name}-berry.png`
	);

	const stats = $derived([
		{ label: 'Firmness', value: formatName(berry.firmness.name) },
		{ label: 'Growth Time', value: `${berry.growth_time} h` },
		{ label: 'Max Harvest', value: berry.max_harvest },
		{ label: 'Size', value: `${berry.size} mm` },
		{ label: 'Smoothness', value: berry.smoothness },
		{ label: 'Soil Dryness', value: berry.soil_dryness }
	]);
</script>

<svelte:head>
	<title>{formatName(berry.name)} Berry - Pokédex</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<a
		href={`${base}/berries`}
		class="focus-ring mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
	>
		<ArrowLeft size={16} />
		Back to Berries
	</a>

	<div
		class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	>
		<div
			class="flex flex-col items-center gap-4 p-8 text-center"
			style:background="linear-gradient(160deg, color-mix(in srgb, {typeColor(
				berry.natural_gift_type.name
			)} 25%, transparent), transparent)"
		>
			<div class="pokemon-entrance h-32 w-32">
				<PokemonImage src={spriteUrl} alt={berry.name} class="h-32 w-32 object-contain" />
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
				{formatName(berry.name)} Berry
			</h1>
		</div>

		<div class="grid gap-6 border-t border-slate-200/70 p-6 sm:p-8 dark:border-slate-800">
			<section>
				<h2 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">Properties</h2>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each stats as stat (stat.label)}
						<div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
							<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
								{stat.label}
							</p>
							<p class="mt-1 text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
						</div>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">Flavors</h2>
				<div class="flex flex-wrap gap-2">
					{#each berry.flavors.filter((f) => f.potency > 0) as f (f.flavor.name)}
						<span
							class="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
						>
							{formatName(f.flavor.name)} · {f.potency}
						</span>
					{:else}
						<span class="text-sm text-slate-400">No dominant flavor.</span>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">Natural Gift</h2>
				<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
					<span
						class="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
						style:background-color={typeColor(berry.natural_gift_type.name)}
					>
						{formatName(berry.natural_gift_type.name)}
					</span>
					Power {berry.natural_gift_power}
				</div>
			</section>
		</div>
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
