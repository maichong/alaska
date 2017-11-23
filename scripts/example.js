'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const shell = require('shelljs');
const _ = require('lodash');

const exampleDir = path.join(__dirname, '../example');
const packagesDir = path.join(__dirname, '../dist');
const exampleModulesDir = path.join(__dirname, '../example/node_modules');

if (!fs.existsSync(exampleModulesDir)) {
  fs.mkdirSync(exampleModulesDir);
}

if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}

let pkgs = [require(exampleDir + '/package.json')];
let dependencies = {};
fs.readdirSync(packagesDir).forEach((lib) => {
  if (!/^alaska/.test(lib)) return;
  pkgs.push(require(packagesDir + '/' + lib + '/package.json'));
});

pkgs.forEach((json) => {
  _.forEach(json.dependencies, (v, key) => {
    if (/^alaska/.test(key)) return;
    dependencies[key] = true;
  });
  _.forEach(json.devDependencies, (v, key) => {
    if (/^alaska/.test(key)) return;
    dependencies[key] = true;
  });
});

console.log(chalk.green('Install dependencies...'));
execSync('npm install --no-save ' + _.keys(dependencies).join(' '), {
  cwd: exampleDir,
  stdio: ['inherit', 'inherit', 'inherit']
});

console.log(chalk.green('Copy packages...'));
fs.readdirSync(packagesDir).forEach((lib) => {
  if (!/^alaska/.test(lib)) return;
  if (fs.existsSync(exampleModulesDir + '/' + lib)) {
    shell.rm('-rf', exampleModulesDir + '/' + lib);
  }
  console.log('copy ', chalk.blue(lib));
  shell.cp('-R', packagesDir + '/' + lib, exampleModulesDir + '/' + lib);
});

console.log(chalk.green('Start server...'));
try {
  execSync('node server.js', {
    cwd: exampleDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
} catch (e) {
}
