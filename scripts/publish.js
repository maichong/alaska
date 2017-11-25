'use strict';

const ChildProcess = require('child_process');
const fs = require('mz/fs');
const Path = require('path');
const chalk = require('chalk');
const babel = require('babel-core');
const utils = require('./utils');

const dir = process.cwd() + '/';
const srcPath = dir + 'src/';
const distPath = dir + 'packages/';

async function copyFile(file) {
  if (file.indexOf('node_modules') > -1) return;

  let dist = Path.join(distPath, file);
  await utils.mkdirpAsync(Path.dirname(dist));

  let needBabel = false;
  if (file.endsWith('.js')) {
    needBabel = true;
    if (/flow|views/.test(file)) {
      needBabel = false;
    }
  }
  if (needBabel) {
    console.log(chalk.green('compile'), file);
    let srcFull = Path.join(srcPath, file);
    let code = babel.transformFileSync(srcFull, {
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
    await fs.writeFile(dist, code);
  } else {
    console.log(chalk.blue('copy'), file);
    await fs.copyFile(Path.join(srcPath, file), dist);
  }
}

async function copyDir(dir) {
  let dirFull = Path.join(srcPath, dir);
  let files = await fs.readdir(dirFull);
  let promises = files.map(async(file) => {
    if (file === '.DS_Store') return;
    let fileFull = Path.join(dirFull, file);
    if (await utils.isFileAsync(fileFull)) {
      await copyFile(Path.join(dir, file));
    } else if (utils.isDirectoryAsync(fileFull)) {
      await copyDir(Path.join(dir, file));
    }
  });

  await Promise.all(promises);
}

if (utils.isDirectory(distPath)) {
  console.log(chalk.green('Remove dist directory...'));
  ChildProcess.execSync(`rm -R ${distPath}`);
}
copyDir('').then(() => {
});
