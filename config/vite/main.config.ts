import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart, resolveAlias } from './base';

import type { UserConfig } from 'vite';

export default defineConfig<'build'>((env) => {
  const { forgeConfigSelf } = env;
  const define = getBuildDefine(env);

  if (!forgeConfigSelf.entry) throw new Error("Config error in 'main.config.js'");

  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry,
        fileName: () => 'main.js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [pluginHotRestart('restart')],
    define,
    resolve: {
      mainFields: ['module', 'jsnext:main', 'jsnext'],
      alias: resolveAlias,
    },
  };

  return mergeConfig(getBuildConfig(env), config);
});
