import Path from 'path';
import glob from 'glob';
import test from 'tape';
import akita from 'akita';
import service from '../src/index';
import createModules from '../modules/alaska-modules';

akita.setOptions({
  apiRoot: 'http://localhost:5555'
});

const modules = createModules(service, ['modules']);

service.launch(modules).then(() => {
  console.log('server started');
  console.log('listen :' + service.getConfig('port'));

  glob('**/*.js', {
    cwd: __dirname
  }, (error, files) => {
    test.onFinish(() => {
      console.log('test finished');
      process.exit();
    });
    for (let file of files) {
      if (file.indexOf('/') === -1) continue;
      require(Path.join(__dirname, file));
    }
  });
}, (error) => {
  console.error(error.stack);
  process.exit(1);
});
