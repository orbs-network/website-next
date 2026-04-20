import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import storybook from 'eslint-plugin-storybook'

const config = [
  {
    ignores: [
      '**/.next/**',
      '**/out/**',
      '**/node_modules/**',
      '**/storybook-static/**',
      '**/dist/**',
      '.claude/**',
    ],
  },
  ...nextCoreWebVitals,
  ...storybook.configs['flat/recommended'],
]

export default config
