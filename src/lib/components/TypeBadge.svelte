<script lang="ts">
	import { typeBadgeColor, formatName } from '$lib/utils/pokemon';

	const { type }: { type: string } = $props();
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
	style="background-color: {typeBadgeColor(type)}"
>
	{formatName(type)}
</span>
