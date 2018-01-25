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

let command = '';

program.version(pkg.version);

program
  .command('create <name>')
  .alias('c')
  .description('Create new project')
  .action((name) => {
    command = 'create';
    require('./create').default(name).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  });

program
  .command('build')
  .alias('b')
  .description('Build source code and admin dashboard')
  .option('--modules-dirs <modulesDirs>', 'modules paths', (dirs) => dirs.split(','))
  .action((options) => {
    command = 'build';
    require('./build').default(options).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  });

program.parse(process.argv);

// $Flow
if (!program.args.length || !command) program.help();
