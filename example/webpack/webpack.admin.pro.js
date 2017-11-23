'use strict';

const Path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    Path.join(__dirname, '../views/admin.jsx')
  ],
  output: {
    filename: 'app.min.js',
    path: process.cwd() + '/public/admin/js/'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
    mainFields: ['webpack', 'jsnext:main', 'browser', 'main']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new UglifyJsPlugin({
      uglifyOptions: {}
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
            'node_modules/moment/*.js',
            'node_modules/jquery/*.js',
          ]
        }
      }
    ]
  }
};
