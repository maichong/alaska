/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-11-21
 * @author Liang <liang@maichong.it>
 */

const service = require('./').default;
const modules = require('./modules');

service.launch(modules).then(() => {
  console.log('example started');
  console.log('listen :' + service.getConfig('port'));
}, (error) => {
  console.error(error.stack);
  process.exit(1);
});
