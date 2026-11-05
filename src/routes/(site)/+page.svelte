<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import SiteHero from '#lib/components/layout/site/SiteHero.svelte';
	import SiteExamDetails from '#lib/components/layout/site/ExamDetails.svelte';
	import SiteSampleQuestion from '#lib/components/layout/site/SiteSampleQuestion.svelte';
	import Button from '#lib/components/ui/Buttons.svelte';
	let { data }: PageProps = $props();

	const practiceHref = $derived(resolve('/portal/[exam]/practice', { exam: data.exam.slug }));
</script>

<svelte:head>
	<title>Mocks | {data.exam.title}</title>
	<meta
		name="description"
		content="A free, unofficial CPACC practice exam with instant results and no sign-up."
	/>
</svelte:head>

<div class="grid items-start gap-10 py-16 lg:grid-cols-[1.15fr_0.65fr] lg:gap-16 lg:py-24">
	<SiteHero exam={data.exam} />
	<SiteExamDetails exam={data.exam} variant="stacked" />
</div>

<section class="pb-16 sm:pb-24 lg:mt-12" aria-labelledby="sample-question-heading">
	<h2
		id="sample-question-heading"
		class="text-4xl font-bold tracking-tight text-balance sm:text-5xl"
	>
		Not ready for the full exam?
	</h2>
	<p class="mt-3 text-base text-pretty text-on-surface-muted">
		Try one question from the practice bank and see how it feels.
	</p>
	<div class="grid gap-10 lg:grid-cols-[1.15fr_0.65fr] lg:items-start lg:gap-16">
		<SiteSampleQuestion
			exam={data.exam}
			question={data.sampleQuestion}
			bankKind="practice"
			practiceAvailable={Boolean(data.exam.practiceBank)}
			class="mt-12"
		/>

		<div class="mt-12 lg:border-l-2 lg:border-on-surface lg:pl-8">
			<h3 class="text-3xl font-bold sm:text-4xl">Practice Mode</h3>
			<ul
				class="mt-4 list-disc space-y-2 pl-8 text-lg leading-relaxed marker:text-on-surface-muted"
			>
				<li>No time limit.</li>
				<li>Immediate feedback.</li>
				<li>Loose question format.</li>
			</ul>

			{#if data.exam.practiceBank}
				<Button variant="secondary" size="md" class="mt-12 w-full" href={practiceHref}
					>Start practicing</Button
				>
			{:else}
				<Button variant="secondary" size="md" class="mt-12 w-full" disabled
					>Not available yet</Button
				>
			{/if}
		</div>
	</div>
</section>
