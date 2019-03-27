"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const updateNotifier = require("update-notifier");
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
    require('./create').default(name).catch((error) => {
        console.error(error);
        process.exit(1);
    });
});
program
    .command('build')
    .alias('b')
    .description('Build source code and admin dashboard')
    .option('--id <id>', 'main service id, default: {package.name}')
    .option('--src <src>', 'main service resource dir, default: src')
    .option('--dist <dist>', 'distribution dir, default: dist')
    .option('--config <config>', 'config file, default: {main.id}.js')
    .option('--ts [tsConfig]', 'enable transform typescript files')
    .option('--babel', 'enable transform files with babel')
    .option('--skipTransform', 'skip transform files')
    .option('--skipAdminView', 'skip build admin view')
    .option('--require <preload>', 'module to preload')
    .option('--modules-dirs <modulesDirs>', 'modules paths', (dirs) => dirs.split(','))
    .action((options) => {
    command = 'build';
    require('./build').default(options).catch((error) => {
        if (options.preload) {
            require(options.preload);
        }
        console.error(error);
        process.exit(1);
    });
});
program.parse(process.argv);
if (!program.args.length || !command)
    program.help();
