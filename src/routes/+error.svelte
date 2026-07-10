<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} - Page not found</title>
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
	<div
		class="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-4xl font-black text-white shadow-lg"
	>
		{page.status}
	</div>
	<h1 class="text-2xl font-bold text-slate-900 dark:text-white">
		{page.status === 404 ? "This Pokémon fled the area!" : 'Something went wrong'}
	</h1>
	<p class="text-slate-500 dark:text-slate-400">
		{page.error?.message ?? "The page you're looking for doesn't exist."}
	</p>
	<a
		href={`${base}/`}
		class="focus-ring mt-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
	>
		Back to Pokédex
	</a>
</div>
