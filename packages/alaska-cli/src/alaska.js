'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint global-require:0 */

const pkg = require('../package.json');

const notifier = (0, _updateNotifier2.default)({
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

_commander2.default.version(pkg.version);

_commander2.default.command('create <name>').alias('c').description('Create new project').action(name => {
  command = 'create';
  require('./create').default(name).catch(error => {
    console.error(error);
    process.exit(1);
  });
});

_commander2.default.command('build').alias('b').description('Build source code and admin dashboard').option('--modules-dirs <modulesDirs>', 'modules paths', dirs => dirs.split(',')).action(options => {
  command = 'build';
  require('./build').default(options).catch(error => {
    console.error(error);
    process.exit(1);
  });
});

_commander2.default.parse(process.argv);

// $Flow
if (!_commander2.default.args.length || !command) _commander2.default.help();