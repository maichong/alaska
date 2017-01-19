'use strict';

process.chdir(__dirname);

process.env.BABEL_CACHE_PATH = process.env.BABEL_CACHE_PATH || 'runtime/babel-cache.json';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if (!process.env.DB) {
  if (process.env.MONGO_PORT_27017_TCP_ADDR) {
    process.env.DB = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + '/alaska-example';
  } else {
    process.env.DB = 'mongodb://localhost/alaska-example';
  }
}

process.title = 'example';

require('babel-register')({
  ignore: [
    /node_modules\/(?!alaska)/
  ],
  babelrc: false,
  presets: [],
  plugins: [
    'syntax-async-functions',
    'syntax-export-extensions',
    'syntax-flow',
    'transform-async-to-generator',
    'transform-class-properties',
    'transform-es2015-modules-commonjs',
    'transform-es2015-destructuring',
    'transform-es2015-parameters',
    'transform-export-extensions',
    'transform-flow-strip-types',
    'transform-object-rest-spread'
  ]
});

let service = require('./').default;

service.launch().then(() => {
  console.log('example started');
}, (error) => {
  process.exit(1);
});
