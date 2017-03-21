import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import flow from 'rollup-plugin-flow';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import progress from 'rollup-plugin-progress';
import replace from 'rollup-plugin-replace';

export default {
  entry: 'views/admin.jsx',
  format: 'cjs',
  dest: 'public/admin/js/app.js',
  sourceMap: true,
  plugins: [
    progress(),
    replace({
      'process.env.NODE_ENV': '"development"',
      'process.env.__DEV__': 'true'
    }),
    {
      resolveId(importee) {
        if (importee === 'lodash') {
          return path.join(__dirname, 'node_modules/lodash-es/lodash.js');
        }
        if (importee.startsWith('lodash/')) {
          let id = path.join(__dirname, 'node_modules', importee.replace('lodash', 'lodash-es'));
          if (id.endsWith('.js')) {
            return id;
          }
          return id + '.js';
        }

        if (importee === 'redux-saga/effects') {
          return path.join(__dirname, 'node_modules/redux-saga/es/effects.js');
        }

        if (importee.indexOf('redux-saga/lib') > -1) {
          return importee.replace('redux-saga/lib', 'redux-saga/es')
        }
      }
    },
    nodeResolve({
      jsnext: true,
      browser: true,
      extensions: ['.js', '.jsx']
    }),
    flow(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/react.js': ['Children', 'Component', 'PropTypes', 'createElement', 'cloneElement'],
        'node_modules/react-chartjs/index.js': ['Line'],
      }
    }),
    babel({
      babelrc: false,
      runtimeHelpers: true,
      sourceMaps: 'both',
      presets: ['react', 'stage-0', ['es2015', {
        modules: false
      }]],
      plugins: [
        'syntax-export-extensions',
        'syntax-class-properties',
        'transform-class-properties',
        'transform-runtime'
      ],
      ignore: [
        'node_modules/babel-runtime/**/*.js',
        'node_modules/core-js/**/*.js',
        'node_modules/regenerator-runtime/**/*.js',
        'node_modules/lodash/*.js',
        'node_modules/simple*/**/*.js',
        'node_modules/simditor/**/*.js',
        'node_modules/moment/*.js',
        'node_modules/jquery/*.js',
      ]
    }),
    {
      intro: function () {
        return '(function(window,undefined){';
      },
      outro: function () {
        return '})(window,undefined);';
      }
    }
  ]
};
