import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeProvider } from 'styled-components';
import darkThemeJson from '@resources/themes/theme-defaults/dark_vs.json';
import GlobalStyles from '@src/renderer/components/styles/GlobalStyles';
import ColorCollection from '@src/renderer/libs/vs/theme/colorCollection';

import type { Preview } from '@storybook/react';

const dark = {
  colors: new ColorCollection().registerThemeColor(darkThemeJson.colors).genrateThemeColors('dark'),
};

const light = {
  colors: new ColorCollection()
    .registerThemeColor(darkThemeJson.colors)
    .genrateThemeColors('light'),
};

console.log(dark);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: { light, dark },
      defaultTheme: 'dark',
      GlobalStyles,
      Provider: ThemeProvider,
    }),
  ],
};

export default preview;
