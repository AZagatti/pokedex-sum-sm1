<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { Sun, Moon, Menu, X } from 'lucide-svelte';

	let mobileOpen = $state(false);

	const links = [
		{ href: `${base}/`, label: 'Pokédex' },
		{ href: `${base}/berries`, label: 'Berries' },
		{ href: `${base}/favorites`, label: 'Favorites' }
	];

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === `${base}/`) {
			return path === `${base}/` || path === base || path === '/';
		}
		return path.startsWith(href);
	}
</script>

<header
	class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80"
>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
		<a
			href={`${base}/`}
			class="focus-ring flex items-center gap-2 rounded-lg text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
		>
			<span
				class="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm"
			>
				<span class="h-3 w-3 rounded-full border-2 border-white bg-white"></span>
			</span>
			Pokédex
		</a>

		<nav class="hidden items-center gap-1 sm:flex">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors {isActive(
						link.href
					)
						? 'bg-indigo-600 text-white'
						: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="focus-ring grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
				onclick={() => themeStore.toggle()}
				aria-label={themeStore.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
			>
				{#if themeStore.value === 'dark'}
					<Sun size={20} />
				{:else}
					<Moon size={20} />
				{/if}
			</button>
			<button
				type="button"
				class="focus-ring grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 sm:hidden dark:text-slate-300 dark:hover:bg-slate-800"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label="Toggle menu"
				aria-expanded={mobileOpen}
				aria-controls="mobile-nav"
			>
				{#if mobileOpen}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<nav
			id="mobile-nav"
			class="flex flex-col gap-1 border-t border-slate-200/70 px-4 py-3 sm:hidden dark:border-slate-800/70"
		>
			{#each links as link (link.href)}
				<a
					href={link.href}
					onclick={() => (mobileOpen = false)}
					class="focus-ring rounded-lg px-4 py-2 text-sm font-medium {isActive(link.href)
						? 'bg-indigo-600 text-white'
						: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>
