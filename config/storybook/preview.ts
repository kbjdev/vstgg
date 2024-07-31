import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeProvider } from 'styled-components';
import darkThemeJson from '@resources/themes/theme-defaults/dark_vs.json';
import lightThemeJson from '@resources/themes/theme-defaults/light_vs.json';
import GlobalStyles from '@src/renderer/components/styles/GlobalStyles';
import ColorCollection from '@src/renderer/libs/vs/theme/colorCollection';

import type { Preview } from '@storybook/react';

const dark = {
  colors: new ColorCollection().registerThemeColor(darkThemeJson.colors).genrateThemeColors('dark'),
};

const light = {
  colors: new ColorCollection()
    .registerThemeColor(lightThemeJson.colors)
    .genrateThemeColors('light'),
};

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
      themes: { [darkThemeJson.name]: dark, [lightThemeJson.name]: light },
      defaultTheme: darkThemeJson.name,
      GlobalStyles,
      Provider: ThemeProvider,
    }),
  ],
};

export default preview;
