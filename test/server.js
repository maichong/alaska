/* eslint no-console:0 */

process.chdir(__dirname);
process.env.DEBUG = process.env.DEBUG || '*,-babel';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

require('babel-register')({
  ignore: /node_modules/
});

const service = require('./src/index').default;
const createModules = require('./modules/alaska-modules').default;

const modules = createModules(service, ['modules']);

//const modules = require('./src/modules');

service.launch(modules).then(() => {
  console.log('server started');
  console.log('listen :' + service.getConfig('port'));
}, (error) => {
  console.error(error.stack);
  process.exit(1);
});
