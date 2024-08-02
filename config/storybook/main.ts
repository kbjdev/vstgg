import { mergeConfig, UserConfig } from 'vite';
import pluginSvgr from 'vite-plugin-svgr';
import { resolveAlias } from '../vite/base';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../../stories/**/*.mdx', '../../stories/**/index.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (defaultConfig) => {
    const config: UserConfig = {
      plugins: [pluginSvgr()],
      resolve: {
        alias: resolveAlias,
      },
    };

    return mergeConfig(defaultConfig, config);
  },
  docs: {
    docsMode: true,
  },
};
export default config;
