<script lang="ts">
	import { onMount } from 'svelte';
	import { STAT_LABELS, STAT_MAX } from '$lib/utils/pokemon';

	const { name, value, color }: { name: string; value: number; color: string } = $props();

	let animatedPct = $state(0);
	const targetPct = $derived(Math.min(100, Math.round((value / STAT_MAX) * 100)));

	onMount(() => {
		const id = requestAnimationFrame(() => {
			animatedPct = targetPct;
		});
		return () => cancelAnimationFrame(id);
	});
</script>

<div class="flex items-center gap-3">
	<span class="w-20 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
		{STAT_LABELS[name] ?? name}
	</span>
	<div
		class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
		role="progressbar"
		aria-valuenow={value}
		aria-valuemin={0}
		aria-valuemax={STAT_MAX}
		aria-label={`${STAT_LABELS[name] ?? name}: ${value}`}
	>
		<div
			class="h-full rounded-full transition-[width] duration-700 ease-out"
			style:width="{animatedPct}%"
			style:background-color={color}
		></div>
	</div>
	<span class="w-8 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-slate-200">
		{value}
	</span>
</div>
