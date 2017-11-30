'use strict';

const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');
const babel = require('babel-core');
const utils = require('./utils');

const dir = process.cwd() + '/';
const srcPath = dir + 'src/';
const distPath = dir + 'packages/';
let projectPath = dir + 'example/';
projectPath = '/Users/liang/dev/cloud/core/';

chokidar.watch(srcPath, {
  ignored: /node_modules|[\/\\]\./
}).on('all', (event, file) => {
  if (file.endsWith('_')) return;
  if (utils.isFile(file)) {
    let relative = path.relative(srcPath, file);
    let dist = path.join(distPath, relative);
    //console.log(file, relative);
    mkdirp.sync(path.dirname(dist));
    let transformd = false;
    let code = '';
    if (file.endsWith('.js') && !/\/flow\//.test(file)) {
      transformd = true;
      try {
        code = babel.transformFileSync(file, {
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
        }).code;
      } catch (e) {
        console.error(e);
        return;
      }
      fs.writeFileSync(dist, code);
    } else {
      fs.copySync(file, dist);
    }
    if (0 && !utils.isDirectory(path.join(projectPath, 'node_modules', relative.split('/')[0]))) {
      if (transformd) {
        console.log(chalk.blue.underline(relative));
      } else {
        console.log(chalk.blue(relative));
      }
      return;
    }
    let target = path.join(projectPath, 'node_modules', relative);
    mkdirp.sync(path.dirname(target));
    if (transformd) {
      fs.writeFileSync(target, code);
    } else {
      fs.copySync(file, target);
    }
    if (transformd) {
      console.log(chalk.green.underline(relative));
    } else {
      console.log(chalk.green(relative));
    }
  }
});
