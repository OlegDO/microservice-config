import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy';

export default {
  input: ['src/mocharc.js'],
  output: {
    dir: 'lib',
    format: 'es',
  },
  plugins: [
    del({ targets: 'lib/*', runOnce: true }),
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
