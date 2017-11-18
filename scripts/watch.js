'use strict';

const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');
const babel = require('babel-core');
const utils = require('./utils');

const dir = process.cwd() + '/';
const packagesPath = dir + 'packages/';
const distPath = dir + 'dist/';
let projectPath = dir + 'example/';
//projectPath = '/Users/liang/dev/cloud/core/';
//projectPath = '/Users/liang/www/supervise/';

chokidar.watch(packagesPath, {
  ignored: /node_modules|[\/\\]\./
}).on('all', (event, file) => {
  if (utils.isFile(file)) {
    let relative = path.relative(packagesPath, file);
    let dist = path.join(distPath, relative);
    //console.log(file, relative);
    let transformd = false;
    if (file.endsWith('.js') && !relative.match(/\/flow\//)) {
      transformd = true;
      let { code } = babel.transformFileSync(file, {
        babelrc: false,
        plugins: [
          'syntax-export-extensions',
          'syntax-flow',
          'transform-class-properties',
          'transform-es2015-modules-commonjs',
          'transform-export-extensions',
          'transform-flow-strip-types',
          'transform-object-rest-spread'
        ]
      });
      fs.writeFileSync(dist, code);
    } else {
      mkdirp.sync(path.dirname(dist));
      fs.copySync(file, dist);
    }
    if (!utils.isDirectory(path.join(projectPath, 'node_modules', relative.split('/')[0]))) {
      if (transformd) {
        console.log(chalk.blue.underline(relative));
      } else {
        console.log(chalk.blue(relative));
      }
      return;
    }
    let target = path.join(projectPath, 'node_modules', relative);
    mkdirp.sync(path.dirname(target));
    fs.copySync(file, target);
    if (transformd) {
      console.log(chalk.green.underline(relative));
    } else {
      console.log(chalk.green(relative));
    }
  }
});
