import type { Preview } from '@storybook/svelte'
import { themes } from '@storybook/theming'
import '../src/lib/global.scss'
import './storybook-global.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'var(--color-background)' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    docs: {
      theme: themes.dark,
    }
  },
}

export default preview