const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (env) {
  env = env || {};

  let plugins = [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(env.production ? 'production' : 'development')
    },
    __DEVTOOLS__: !env.production,
  })];

  if (env.production) {
    plugins.push(new UglifyJsPlugin());
  }

  return {
    devtool: env.production ? '' : 'cheap-module-source-map',
    entry: './src/views/app.jsx',
    output: {
      filename: env.production ? 'app.min.js' : 'app.js',
      path: process.cwd() + '/public/js/'
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.jsx'],
      mainFields: ['webpack', 'browser', 'main']
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
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ['react', [
              'env', {
                targets: {
                  ie: '10'
                }
              }
            ]],
            plugins: [
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
};
