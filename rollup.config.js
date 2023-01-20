import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';

export default {
  input: ['src/mocharc.js'],
  output: {
    dir: 'lib',
    format: 'cjs',
  },
  plugins: [
    cleaner({
      targets: [
        './lib/'
      ]
    }),
    peerDepsExternal(),
    json(),
    copy({
      targets: [
        { src: 'src/*', dest: 'lib' },
        { src: 'package.json', dest: 'lib' },
      ]
    })
  ],
};
