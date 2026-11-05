<script lang="ts">
	import { resolve } from '$app/paths';
	import { cn } from '#lib/utils/cn';
	import type { BankKind, ExamSummary, SampleQuestion } from '#lib/domain/types';

	import { RadioGroup } from 'bits-ui';
	import { tick } from 'svelte';
	import Button from '#lib/components/ui/Buttons.svelte';
	import MarkdownText from '#lib/components/ui/MarkdownText.svelte';

	//Icons
	import IconTryAgain from '~icons/oxy/rotate-ccw';
	import IconCorrect from '~icons/oxy/circle-check';
	import IconWrong from '~icons/oxy/circle-x';

	type Props = {
		exam: ExamSummary;
		question: SampleQuestion;
		/** Bank to draw "Try again" questions from, falls back to the exam bank. */
		bankKind?: BankKind;
		/** When false, the practice CTA is replaced by the exam CTA. */
		practiceAvailable?: boolean;
		class?: string;
	};

	let {
		exam,
		question: initialQuestion,
		bankKind,
		practiceAvailable = true,
		class: className
	}: Props = $props();

	const examHref = $derived(resolve('/portal/[exam]/start', { exam: exam.slug }));
	const practiceHref = $derived(resolve('/portal/[exam]/practice', { exam: exam.slug }));
	const sampleEndpoint = $derived(resolve('/portal/[exam]/sample-question', { exam: exam.slug }));

	// The server load seeds the first question after that the component owns it
	// and replaces it through the sample-question endpoint.
	// The prop is therefore intentionally read only once, as initial state.
	// svelte-ignore state_referenced_locally
	let question = $state(initialQuestion);
	let selectedAnswer = $state('');
	let questionSubmitted = $state(false);
	let loading = $state(false);
	let loadError = $state('');
	let promptEl = $state<HTMLParagraphElement | null>(null);
	let feedbackEl = $state<HTMLDivElement | null>(null);

	const selectedOption = $derived(question.options.find((option) => option.id === selectedAnswer));
	const correctOption = $derived(question.options.find((option) => option.correct));
	const isAnswerCorrect = $derived(selectedOption?.correct ?? false);

	const ghostButtonClasses = ' px-2 py-1.5';

	function optionClasses(option: SampleQuestion['options'][number]) {
		return cn(
			'oxy-focus flex w-full items-start gap-3 rounded-sm border border-dark/43 bg-input p-3.5 text-left transition-colors duration-300',
			!questionSubmitted && 'cursor-pointer hover:bg-input/40 focus-visible:bg-input/40',
			selectedAnswer === option.id && 'border-dark ring-1 ring-dark font-light bg-input/40',
			questionSubmitted &&
				option.correct &&
				'border-on-correct-surface bg-correct-surface ring-1 ring-on-correct-surface',
			questionSubmitted &&
				selectedAnswer === option.id &&
				!option.correct &&
				'border-on-wrong-surface bg-wrong-surface ring-1 ring-on-wrong-surface',
			questionSubmitted && 'cursor-default'
		);
	}

	function indicatorClasses(option: SampleQuestion['options'][number]) {
		return cn(
			'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2 bg-surface-accent',
			selectedAnswer === option.id ? 'border-dark' : 'border-on-surface-muted',
			questionSubmitted && option.correct && 'border-on-correct-surface',
			questionSubmitted &&
				selectedAnswer === option.id &&
				!option.correct &&
				'border-on-wrong-surface'
		);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!selectedAnswer || questionSubmitted) return;

		questionSubmitted = true;
		loadError = '';
		await tick();
		feedbackEl?.focus();
	}

	async function loadAnotherQuestion() {
		if (loading) return;

		loading = true;
		loadError = '';

		try {
			const url = new URL(sampleEndpoint, window.location.origin);
			url.searchParams.set('exclude', question.id);
			if (bankKind) {
				url.searchParams.set('bank', bankKind);
			}

			const response = await fetch(url, { headers: { accept: 'application/json' } });

			if (!response.ok) {
				throw new Error(`Sample question request failed with ${response.status}`);
			}

			question = (await response.json()) as SampleQuestion;
			selectedAnswer = '';
			questionSubmitted = false;

			await tick();
			promptEl?.focus();
		} catch {
			loadError = 'Could not load another question. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div
	id="sample-question"
	class={cn(
		'scroll-mt-24 rounded bg-surface-accent p-5 ring-2 ring-on-surface-muted sm:p-6',
		className
	)}
	aria-busy={loading}
>
	<div class="mb-6 flex items-center justify-between gap-3">
		<p class="text-xs font-semibold tracking-wide text-on-surface-muted uppercase">
			Practice question
		</p>
		<p class="text-right text-xs font-medium text-on-surface-muted">{exam.title}</p>
	</div>

	<form onsubmit={handleSubmit}>
		<p
			id="sample-question-text"
			tabindex="-1"
			bind:this={promptEl}
			class="text-base leading-snug font-semibold text-dark sm:text-lg"
		>
			<MarkdownText text={question.prompt} />
		</p>
		<p id="sample-question-help" class="mt-1.5 text-xs text-on-surface/90">Choose one answer.</p>

		<RadioGroup.Root
			bind:value={selectedAnswer}
			disabled={questionSubmitted}
			aria-labelledby="sample-question-text"
			aria-describedby="sample-question-help"
			class="mt-4 space-y-2.5"
		>
			{#each question.options as option (option.id)}
				<RadioGroup.Item value={option.id} class={optionClasses(option)}>
					<span class={indicatorClasses(option)} aria-hidden="true">
						{#if selectedAnswer === option.id}
							<span
								class={cn(
									'selected-dot size-2 rounded-full bg-dark',
									questionSubmitted && option.correct && 'bg-on-correct-surface',
									questionSubmitted && !option.correct && 'bg-on-wrong-surface'
								)}
							></span>
						{/if}
					</span>
					<span class="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
						<MarkdownText
							text={option.label}
							class="text-sm leading-snug font-medium text-on-surface"
						/>
					</span>
					{#if questionSubmitted && option.correct}
						<span
							class="rounded-sm bg-on-correct-surface px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap text-correct-surface"
						>
							Correct answer
						</span>
					{:else if questionSubmitted && selectedAnswer === option.id}
						<span
							class="rounded-sm bg-on-wrong-surface px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap text-wrong-surface"
						>
							Your answer
						</span>
					{/if}
				</RadioGroup.Item>
			{/each}
		</RadioGroup.Root>

		<div class="mt-5">
			{#if !questionSubmitted}
				<Button type="submit" disabled={!selectedAnswer} class="w-full">Check answer</Button>
				<p class="mt-3 text-center text-xs text-on-surface-muted">
					Or
					<a
						href={examHref}
						class="oxy-focus rounded px-px font-semibold text-on-surface underline underline-offset-2"
						>try the full exam</a
					> now.
				</p>
			{:else}
				<div
					bind:this={feedbackEl}
					tabindex="-1"
					role="status"
					aria-atomic="true"
					class={cn(
						'oxy-focus rounded-md border p-4',
						isAnswerCorrect
							? 'border-on-correct-surface bg-correct-surface text-on-correct-surface'
							: 'border-on-wrong-surface bg-wrong-surface text-on-wrong-surface'
					)}
				>
					<div>
						<p class="flex items-center gap-2 text-sm font-bold">
							{#if isAnswerCorrect}
								<IconCorrect class="size-4 shrink-0 text-on-correct-surface" aria-hidden="true" />
								Correct! Nice work.
							{:else}
								<IconWrong class="size-4 shrink-0 text-on-wrong-surface" aria-hidden="true" />
								Not quite.
							{/if}
						</p>
						<p class="mt-2 text-xs font-bold">
							{#if isAnswerCorrect}
								Correct answer: <span class="font-medium"
									><MarkdownText text={correctOption?.label ?? ''} /></span
								>.
							{:else}
								Your answer: <span class="font-medium"
									><MarkdownText text={selectedOption?.label ?? ''} /></span
								>.
								<br />
								<span class="text-on-correct-surface">
									Correct answer: <span class="font-medium"
										><MarkdownText text={correctOption?.label ?? ''} /></span
									>.</span
								>
							{/if}
						</p>
						<p class="mt-1.5 text-sm leading-relaxed">
							<MarkdownText text={question.explanation} />
						</p>
					</div>
				</div>
				<div class="mt-4 flex flex-wrap items-center gap-3 pt-3">
					{#if isAnswerCorrect}
						<Button size="sm" href={examHref}>Start the full mock exam</Button>
					{:else if practiceAvailable}
						<Button variant="secondary" size="sm" href={practiceHref}
							>Start a practice session</Button
						>
					{:else}
						<Button variant="secondary" size="sm" href={examHref}>Start the full mock exam</Button>
					{/if}
					<Button
						variant="ghost"
						size="sm"
						type="button"
						class={ghostButtonClasses}
						disabled={loading}
						onclick={loadAnotherQuestion}
					>
						<IconTryAgain class="size-3.5" aria-hidden="true" />
						{loading ? 'Loading another question…' : 'Try again'}
					</Button>
				</div>
				{#if !loadError}
					<p role="alert" class="mt-3 text-xs font-semibold">{loadError}</p>
				{/if}
			{/if}
		</div>
	</form>
</div>
