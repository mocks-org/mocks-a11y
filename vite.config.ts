import { fileURLToPath } from 'node:url';
import { mdsvex } from 'mdsvex';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

// mdsvex inserts the layout path as a literal import inside each `.svx` file,
// so a project-relative path would resolve against the route directory.
// An absolute path resolves both for Vite and for the `fs`.
const contentLayout = fileURLToPath(
	new URL('./src/lib/components/content/ContentLayout.svelte', import.meta.url)
);

export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				// mdsvex 0.12 still generates a `$$props` wrapper when a layout is
				// configured, so `.svx` files must stay in auto-detect mode.
				runes: ({ filename }) => {
					const parts = filename.split(/[/\\]/);
					if (parts.includes('node_modules') || filename.endsWith('.svx')) return undefined;
					return true;
				}
			},
			adapter: adapter({
				platformProxy: {
					configPath: 'wrangler.jsonc'
				}
			}),
			preprocess: [
				mdsvex({
					extensions: ['.svx'],
					layout: { _: contentLayout }
				})
			],
			extensions: ['.svelte', '.svx']
		}),
		Icons({
			compiler: 'svelte',
			customCollections: {
				oxy: FileSystemIconLoader('./src/lib/assets/icons')
			}
		})
	],

	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
