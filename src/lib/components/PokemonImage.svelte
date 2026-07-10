<script lang="ts">
	const { src, alt, class: className = '' }: { src: string | null; alt: string; class?: string } =
		$props();

	let errored = $state(false);
</script>

{#if src && !errored}
	<img
		{src}
		{alt}
		loading="lazy"
		decoding="async"
		class={className}
		onerror={() => (errored = true)}
	/>
{:else}
	<div
		class="grid place-items-center {className} bg-slate-100 dark:bg-slate-800"
		role="img"
		aria-label={alt}
	>
		<span class="text-3xl opacity-30" aria-hidden="true">?</span>
	</div>
{/if}
