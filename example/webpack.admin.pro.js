'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    __dirname + '/views/admin.jsx'
  ],
  output: {
    filename: 'app.min.js',
    path: process.cwd() + '/public/admin/js/',
    publicPath: '/assets/'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
    mainFields: ['webpack', 'jsnext:main', 'browser', 'main']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        dead_code: true,
        drop_debugger: true,
        unsafe: true,
        unused: true,
        drop_console: true,
        if_return: true,
        properties: true,
        comparisons: true,
        loops: true,
        join_vars: true,
        cascade: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      '__DEVTOOLS__': false
    })
  ],
  module: {
    rules: [
      {
        // fix simditor amd bug
        test: /\.js?$/,
        include: /simple*|simditor/,
        loader: 'string-replace-loader',
        options: {
          search: 'typeof define === \'function\'',
          replace: 'false'
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: ['react', 'es2015', 'stage-0'],
          plugins: [
            'syntax-export-extensions',
            'syntax-flow',
            'syntax-class-properties',
            'transform-class-properties',
            'transform-flow-strip-types',
            'transform-runtime'
          ],
          ignore: [
            'node_modules/babel-runtime/**/*.js',
            'node_modules/core-js/**/*.js',
            'node_modules/regenerator-runtime/**/*.js',
            'node_modules/lodash/*.js',
            'node_modules/simple*/**/*.js',
            'node_modules/simditor/**/*.js',
          ]
        }
      }
    ]
  }
};
