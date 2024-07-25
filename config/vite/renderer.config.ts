import pluginReactSwc from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import pluginSvgr from 'vite-plugin-svgr';
import { pluginExposeRenderer, resolveAlias } from './base';

import type { UserConfig } from 'vite';

export default defineConfig<'renderer'>((env) => {
  const { root, mode, forgeConfigSelf } = env;
  const name = forgeConfigSelf.name ?? '';

  const config: UserConfig = {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name), pluginReactSwc(), pluginSvgr()],
    resolve: {
      preserveSymlinks: true,
      alias: resolveAlias,
    },
    clearScreen: false,
  };

  return config;
});
