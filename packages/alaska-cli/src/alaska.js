// @flow

/* eslint global-require:0 */

// $Flow
import program from 'commander';
// $Flow
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
    require('./create').default(name, options).catch((error) => console.error(error));
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
    require('./install').default(name, options).catch((error) => console.error(error));
  });

program.parse(process.argv);

if (!program.args.length) program.help();
