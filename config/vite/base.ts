import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import pkg from '../../package.json';

import type { ConfigEnv, Plugin, UserConfig } from 'vite';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const external = [
  ...builtins,
  ...Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
];

export function getBuildConfig(env: ConfigEnv<'build'>) {
  const { root, mode, command } = env;

  const config: UserConfig = {
    root,
    mode,
    build: {
      emptyOutDir: false,
      outDir: '.vite/build',
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
    },
    clearScreen: false,
  };

  return config;
}

export function getDefineKeys(names: string[]) {
  return names.reduce<{ [name: string]: VitePluginRuntimeKeys }>((acc, name) => {
    const NAME = name.toUpperCase();
    const keys: VitePluginRuntimeKeys = {
      VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
      VITE_NAME: `${NAME}_VITE_NAME`,
    };

    return { ...acc, [name]: keys };
  }, {});
}

export function getBuildDefine(env: ConfigEnv<'build'>) {
  const { command, forgeConfig } = env;
  const names = forgeConfig.renderer.reduce<string[]>(
    (acc, { name }) => (typeof name === 'string' ? [...acc, name] : acc),
    []
  );
  const defineKeys = getDefineKeys(names);
  const define = Object.entries(defineKeys).reduce<Record<string, string | undefined>>(
    (acc, [name, keys]) => {
      const { VITE_DEV_SERVER_URL, VITE_NAME } = keys;
      const def = {
        [VITE_DEV_SERVER_URL]:
          command === 'serve' ? JSON.stringify(process.env[VITE_DEV_SERVER_URL]) : undefined,
        [VITE_NAME]: JSON.stringify(name),
      };
      return { ...acc, ...def };
    },
    {}
  );

  return define;
}

export function pluginExposeRenderer(name: string): Plugin {
  const { VITE_DEV_SERVER_URL } = getDefineKeys([name])[name];

  const plugin: Plugin = {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server) {
      process.viteDevServers ??= {};
      process.viteDevServers[name] = server;

      server.httpServer?.once('listening', () => {
        if (!server.httpServer) return;
        const addressInfo = server.httpServer.address();
        if (!addressInfo || typeof addressInfo !== 'object') return;
        process.env[VITE_DEV_SERVER_URL] = `http://localhost:${addressInfo.port}`;
      });
    },
  };

  return plugin;
}

export function pluginHotRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {
          server.ws.send({ type: 'full-reload' });
        }
      } else {
        process.stdin.emit('data', 'rs');
      }
    },
  };
}

export const resolveAlias = [
  { find: '@src', replacement: resolve(__dirname, '../../src') },
  { find: '@resources', replacement: resolve(__dirname, '../../resources') },
];
