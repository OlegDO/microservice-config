import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy';
import { folderInput } from 'rollup-plugin-folder-input';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-ts';

/**
 * This is root config for microservices
 * All microservices extends from this config
 */
export default {
  input: ['src/**/*.ts', 'migrations/*.ts'],
  output: {
    dir: 'lib',
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: [
    'crypto',
    'fs',
    '@lomray/microservice-nodejs-lib',
    '@lomray/microservices-types',
    '@lomray/microservice-remote-middleware',
  ],
  plugins: [
    del({ targets: 'lib/*', runOnce: true }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.__IS_BUILD__': 'true',
      },
    }),
    folderInput(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    json(),
    typescript({
      tsconfig: (resolvedConfig) => ({
        ...resolvedConfig,
        declaration: true,
        importHelpers: true,
        sourceMap: true,
        inlineSources: true,
        plugins: [
          {
            transform: '@zerollup/ts-transform-paths',
            exclude: ['*'],
          },
        ],
      }),
    }),
    copy({
      targets: [{ src: 'package.json', dest: 'lib' }],
    }),
  ],
};
