'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-source-map',
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
      __DEVTOOLS__: process.env.DEVTOOLS === 'true'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
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
            'node_modules/lodash/*.js'
          ]
        }
      },
    ]
  }
};

