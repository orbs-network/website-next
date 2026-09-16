import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

import { playwright } from '@vitest/browser-playwright'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // Pre-bundle deps that otherwise trigger a mid-run Vite reload on cold starts (CI).
  optimizeDeps: {
    include: ['@opentelemetry/api'],
  },
  // Matches the `@/*` -> `./src/*` alias in tsconfig.json. Storybook supplies
  // this to its own project via the Next.js framework config; the node project
  // has no framework behind it and would otherwise fail to resolve any import
  // written the way the rest of the codebase writes them.
  resolve: {
    alias: {
      '@': path.join(dirname, 'src'),
    },
  },
  test: {
    projects: [
      {
        // Plain unit tests, in Node rather than a browser.
        //
        // The Storybook project below renders components in real Chromium,
        // which is right for anything with a DOM and wrong for everything
        // else — a test that only reads files and compares strings should not
        // need a browser to start. `npm test` runs both.
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          // `.test.ts` only. Stories are `.stories.tsx` and belong to the
          // Storybook project, so the two cannot collide.
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
