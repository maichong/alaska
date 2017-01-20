// @flow

/* eslint global-require:0 */

import program from 'commander';
import updateNotifier from 'update-notifier';

const pkg = require('../package.json');

const notifier = updateNotifier({
  pkg,
  callback(error, update) {
    if (update && ['major', 'minor', 'patch'].indexOf(update.type) > -1) {
      notifier.update = update;
      notifier.notify({
        defer: false
      });
    }
  }
});


program
  .command('create <name>')
  .alias('c')
  .description('Create new project')
  .action((name, options) => {
    require('./create').default(name, options);
  });

program
  .command('build')
  .alias('b')
  .description('Build admin dashboard')
  .option('-w, --watch', 'watch mode')
  .option('-d, --dev', 'build dev lib')
  .action((options) => {
    require('./build').default(options);
  });

program
  .command('install <name>')
  .alias('i')
  .description('Install service')
  .option('-w, --watch', 'watch mode')
  .option('-d, --dev', 'build dev lib')
  .action((name, options) => {
    require('./install').default(name, options);
  });

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate controller/api/model/sled')
  .action((type, name, options) => {
    switch (type) {
      case 'controller':
        require('./generate-controller').default(name, options);
        return;
      case 'api':
        require('./generate-api').default(name, options);
        return;
      case 'model':
        require('./generate-model').default(name, options);
        return;
      case 'sled':
        require('./generate-sled').default(name, options);
        return;
      default:
        console.log('Unknown type to generate, controller|api|model|sled');
    }
  });

program.parse(process.argv);

if (!program.args.length) program.help();
