<script lang="ts">
	import type { ExamSummary } from '#lib/domain/types';
	import { cn } from '#lib/utils/cn';

	type Props = {
		exam: ExamSummary;
		/** `band` is a wide three-up row, `stacked` is a compact column for a hero. */
		variant?: 'band' | 'stacked';
		class?: string;
		questions?: number;
		duration?: number;
		score?: number;
	};

	let { exam, variant = 'band', class: className, questions, duration, score }: Props = $props();

	const displayQuestions = $derived(questions ?? exam.questionCount);
	const displayDuration = $derived(duration ?? exam.durationMinutes);
	const displayScore = $derived(score ?? exam.passPercent);

	const isStacked = $derived(variant === 'stacked');

	const rootClass = $derived(
		cn('grid grid-cols-1', isStacked ? 'gap-3' : 'gap-4 lg:grid-cols-[1fr_1fr_0.5fr]', className)
	);
	const valueClasses = $derived(
		isStacked ? 'font-mono text-4xl font-extrabold' : 'font-mono text-6xl font-extrabold'
	);
	const unitClasses = $derived(isStacked ? 'text-2xl font-bold' : 'text-3xl font-bold');
	const bodyClasses = $derived(isStacked ? 'flex flex-col gap-1 p-4' : 'flex flex-col gap-2 p-6');
	const captionClasses = $derived(isStacked ? 'text-xs' : undefined);
</script>

<dl class={rootClass}>
	<!-- Exam Questions -->
	<div class="rounded border-2 border-on-surface-muted bg-surface-accent p-1">
		<dt
			class="w-full rounded bg-on-surface-muted px-1 text-sm font-semibold text-surface uppercase"
		>
			Questions
		</dt>
		<dd class={bodyClasses}>
			<span class={valueClasses}>{displayQuestions}</span>
			<p class={captionClasses}>Multiple Choices</p>
		</dd>
	</div>

	<!-- Exam Duration -->
	<div class="rounded border-2 border-on-surface-muted bg-surface-accent p-1">
		<dt
			class="w-full rounded bg-on-surface-muted px-1 text-sm font-semibold text-surface uppercase"
		>
			Duration
		</dt>
		<dd class={bodyClasses}>
			<span class={cn('flex items-baseline gap-2 whitespace-nowrap', valueClasses)}>
				{displayDuration}
				<span class={unitClasses}>minutes</span>
			</span>
			<p class={captionClasses}>Pausable</p>
		</dd>
	</div>

	<!-- Exam Score (Smaller) -->
	<div class="rounded border-2 border-on-surface-muted bg-surface-accent p-1">
		<dt class="w-full rounded bg-primary px-1 text-sm font-semibold text-on-primary uppercase">
			Target Score
		</dt>
		<dd class={bodyClasses}>
			<span class={cn('flex items-baseline gap-2 whitespace-nowrap', valueClasses)}>
				{displayScore}
				<span class={unitClasses}>%</span>
			</span>
			<p class={captionClasses}>Unofficial</p>
		</dd>
	</div>
</dl>
