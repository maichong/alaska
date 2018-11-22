import * as program from 'commander';
import * as updateNotifier from 'update-notifier';

const pkg = require('./package.json');

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
    require('./create').default(name).catch((error: string) => {
      console.error(error);
      process.exit(1);
    });
  });

program
  .command('build')
  .alias('b')
  .description('Build source code and admin dashboard')
  .option('--config <config>', 'config file')
  .option('--ts [tsConfig]', 'enable transform typescript files')
  .option('--babel', 'enable transform files with babel')
  .option('--skip <skips>', 'skip transform files')
  .option('--require <preload>', 'module to preload')
  .option('--modules-dirs <modulesDirs>', 'modules paths', (dirs) => dirs.split(','))
  .action((options) => {
    command = 'build';
    require('./build').default(options).catch((error: string) => {
      if (options.preload) {
        require(options.preload);
      }
      console.error(error);
      process.exit(1);
    });
  });

program.parse(process.argv);

if (!program.args.length || !command) program.help();
