import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkgJson from './package.json' assert { type: 'json' };

const libraryName = 'firequery';

const createConfig = ({ umd = false, input, output, external } = {}) => ({
  input,
  output,
  external: [
    ...Object.keys(umd ? {} : pkgJson.dependencies || {}),
    ...Object.keys(pkgJson.peerDependencies || {}),
    '@google-cloud/firestore',
    'rxjs/operators',
    ...(external || [])
  ],
  watch: {
    include: 'src/**'
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    resolve(),
    commonjs({ extensions: ['.js', '.jsx'] }),
    umd &&
      terser({
        mangle: {
          properties: {
            keep_quoted: true,
            regex: /_$|^_/
          }
        },
        compress: {
          passes: 3
        }
      }),
    sourceMaps()
  ]
});

export default [
  createConfig({
    input: 'src/index.umd.ts',
    umd: true,
    output: {
      file: 'out/firequery.umd.js',
      format: 'umd',
      name: camelCase(libraryName),
      globals: {
        '@google-cloud/firestore': 'firestore',
        'rxjs': '*',
        'rxjs/operators': '*'
      },
      sourcemap: true,
      footer:
        'var FireQuery = (typeof firequery !== "undefined") && firequery.FireQuery;'
    }
  })
];
