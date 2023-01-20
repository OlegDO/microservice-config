const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const cleaner = require('rollup-plugin-cleaner');
const copy = require('rollup-plugin-copy');
const { folderInput } = require('rollup-plugin-folder-input');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const typescript = require('rollup-plugin-ts');

/**
 * This is root config for microservices
 * All microservices extends from this config
 */
const config = {
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
    cleaner({
      targets: ['./lib/'],
    }),
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

module.exports = config;
