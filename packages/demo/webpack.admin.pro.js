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
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      '__DEVTOOLS__': false
    })
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      {
        test: /\.jsx$/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['transform-runtime'],
          babelrc: false
        }
      },
    ]
  },
  cssnext: {
    browsers: 'last 2 versions'
  }
};
