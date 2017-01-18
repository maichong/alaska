'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    __dirname + '/views/admin.jsx'
  ],
  output: {
    filename: 'app.js',
    path: process.cwd() + '/public/admin/js/',
    publicPath: '/assets/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
      __DEVTOOLS__: process.env.DEVTOOLS === 'true' ? true : false
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

