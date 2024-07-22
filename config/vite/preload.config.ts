import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, external, pluginHotRestart, resolveAlias } from './base';

import type { UserConfig } from 'vite';

export default defineConfig<'build'>((env) => {
  const { forgeConfigSelf } = env;
  const config: UserConfig = {
    build: {
      rollupOptions: {
        external,
        input: forgeConfigSelf.entry,
        output: {
          format: 'cjs',
          inlineDynamicImports: true,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    plugins: [pluginHotRestart('reload')],
    resolve: {
      alias: resolveAlias,
    },
  };

  return mergeConfig(getBuildConfig(env), config);
});
