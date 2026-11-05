<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ExamSummary } from '#lib/domain/types';
	import { cn } from '#lib/utils/cn';
	import Button from '#lib/components/ui/Buttons.svelte';

	type SiteHeroProps = {
		exam: ExamSummary;
		class?: string;
	};

	let { exam, class: className }: SiteHeroProps = $props();

	const examHref = $derived(resolve('/portal/[exam]/start', { exam: exam.slug }));
	const infoExamHref = $derived(resolve('/portal/[exam]', { exam: exam.slug }));
</script>

<div
	class={cn('flex h-full w-full flex-col items-start justify-center lg:justify-evenly', className)}
>
	<div class="space-y-6">
		<h1
			class="max-w-160 text-5xl leading-tight font-bold tracking-tight text-balance sm:text-6xl lg:-mt-4"
		>
			Ready for a CPACC mock exam?
		</h1>
		<p class="max-w-xl text-lg leading-relaxed font-medium text-pretty text-on-surface-muted">
			Free, unofficial practice exam built to simulate the real format.
		</p>
	</div>
	<div class="mt-12 flex w-full flex-col items-stretch gap-4 sm:items-center md:flex-row">
		<Button variant="primary" size="lg" href={examHref} class="w-full md:w-60"
			>Start a mock exam</Button
		>
		<Button variant="secondary" size="lg" href={infoExamHref} class="w-full md:w-60"
			>Learn More</Button
		>
	</div>
</div>
