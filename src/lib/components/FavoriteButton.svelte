<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';

	const { name, class: className = '' }: { name: string; class?: string } = $props();

	const active = $derived(favoritesStore.has(name));
</script>

<button
	type="button"
	class="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-all hover:scale-110 dark:bg-slate-900/90 dark:text-slate-400 {className}"
	class:text-red-500={active}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		favoritesStore.toggle(name);
	}}
	aria-pressed={active}
	aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
>
	<Heart size={18} fill={active ? 'currentColor' : 'none'} />
</button>
