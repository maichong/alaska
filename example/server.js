/* eslint strict:0 */
/* eslint no-console:0 */

'use strict';

process.chdir(__dirname);
process.env.DEBUG = process.env.DEBUG || '*,-babel';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

require('babel-register')({
  ignore: [
    /node_modules/
  ],
  babelrc: false,
  presets: [],
  plugins: [
    'syntax-flow',
    'transform-class-properties',
    'transform-es2015-modules-commonjs',
    'transform-flow-strip-types',
    'transform-object-rest-spread'
  ]
});

const service = require('./src/').default;
const createModules = require('alaska-modules').default;

const modules = createModules(service);

service.launch(modules).then(() => {
  console.log('server started');
  console.log('listen :' + service.getConfig('port'));
  console.log(service.getConfig('middlewares'));
}, (error) => {
  console.error(error.stack);
  process.exit(1);
});
