'use strict';

const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');
const utils = require('./utils');

const dir = process.cwd() + '/';
const packagesPath = dir + 'packages/';
let projectPath = dir + 'example/';

chokidar.watch(packagesPath, {
  ignored: /node_modules|[\/\\]\./
}).on('all', (event, file) => {
  if (utils.isFile(file)) {
    let relative = path.relative(packagesPath, file);
    let target = path.join(projectPath, 'node_modules', relative);
    console.log(chalk.blue(relative));
    mkdirp.sync(path.dirname(target));
    fs.copySync(file, target);
  }
});
