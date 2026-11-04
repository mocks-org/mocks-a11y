import { defineConfig } from '@playwright/test';

const port = 4173;

export default defineConfig({
	use: { baseURL: `http://localhost:${port}` },
	webServer: {
		command: 'npm run build && npm run preview',
		port,
		reuseExistingServer: !process.env.CI
	},
	testMatch: '**/*.e2e.{ts,js}'
});
