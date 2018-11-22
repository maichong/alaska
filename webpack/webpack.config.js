const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const _ = require('lodash');

module.exports = function (env) {
  env = env || {};

  let plugins = [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(env.production ? 'production' : 'development')
    },
    __DEVTOOLS__: !env.production,
  })];

  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? '' : 'cheap-module-source-map',
    entry: './src/views/admin.tsx',
    output: {
      filename: env.production ? 'app.min.js' : 'app.js',
      path: process.cwd() + '/public/admin/js/',
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      mainFields: ['webpack', 'browser', 'main']
    },
    plugins,
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              reduce_vars: false,
              drop_debugger: true,
              warnings: false
            }
          }
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader?-url',
            'sass-loader'
          ]
        },
        { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
    }
  };
};

