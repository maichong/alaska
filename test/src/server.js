const service = require('./').default;
const modules = require('./modules');

service.launch(modules).then(() => {
  console.log('server started');
  console.log('listen :' + service.getConfig('port'));
}, (error) => {
  console.error(error.stack);
  process.exit(1);
});
