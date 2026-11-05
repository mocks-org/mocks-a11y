import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { getBankRepository } from '#lib/server/repositories';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const repository = getBankRepository(platform?.env.DB ?? env.DB);
	const exam = await repository.getExam('cpacc-demo');

	if (!exam) {
		error(500, 'Demo exam is not seeded. Run pnpm db:seed:demo:local.');
	}

	// The homepage sample comes from the practice bank, it is untimed and gives
	// instant feedback, which matches the sample interaction. Falls back to the
	// exam bank when no practice bank is published.
	const sampleQuestion = await repository.getSampleQuestion(exam.slug, undefined, 'practice');

	if (!sampleQuestion) {
		error(500, 'The demo bank has no published questions. Run pnpm db:seed:demo:local.');
	}

	return { exam, sampleQuestion };
};
