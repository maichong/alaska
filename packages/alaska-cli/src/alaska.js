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

_commander2.default.command('create <name>').alias('c').description('Create new project').action(name => {
  require('./create').default(name).catch(error => console.error(error));
});

_commander2.default.command('build').alias('b').description('Build source code and admin dashboard').option('-w, --watch', 'watch mode').option('-d, --dev', 'build dev lib').action(() => {
  require('./build').default();
});

_commander2.default.command('install <name>').alias('i').description('Install service').option('-w, --watch', 'watch mode').option('-d, --dev', 'build dev lib').action(name => {
  require('./install').default(name).catch(error => console.error(error));
});

_commander2.default.parse(process.argv);

// $Flow
if (!_commander2.default.args.length) _commander2.default.help();