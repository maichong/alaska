'use strict';

const Path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    Path.join(__dirname, '../src/server.js')
  ],
  output: {
    filename: 'server.min.js',
    path: process.cwd() + '/dist'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js']
  },
  target: 'node',
  node: false,
  externals: [
    function (context, request, callback) {
      if (request[0] !== '.' && !Path.isAbsolute(request)) {
        if (
          [
            'mongodb-core', 'bson', 'require_optional', 'resolve-from', 'semver'
          ].indexOf(request) > -1
        ) {
          console.log('skip', Path.relative(process.cwd(), context), request);
          callback(null, `require('${request}')`);
          return;
        }
        console.log('pack', Path.relative(process.cwd(), context), request);
      }

      if (['es6-promise', 'any-promise'].indexOf(request) > -1) {
        callback(null, 'var Promise');
        return;
      }
      if (request === 'hiredis') {
        callback(null, 'var {}');
        return;
      }
      callback();
    }
  ],
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /detect_proxy_agent/,
      'lodash/noop'
    ),
    new webpack.DefinePlugin({
      'global.MONGOOSE_DRIVER_PATH': false
    }),
    new UglifyJsPlugin({
      uglifyOptions: {}
    })
  ],
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          plugins: [
            'syntax-export-extensions',
            'syntax-flow',
            'syntax-class-properties',
            'transform-class-properties',
            'transform-flow-strip-types',
            'transform-runtime'
          ],
          ignore: [
            'node_modules/**/*',
          ]
        }
      }
    ]
  }
};
