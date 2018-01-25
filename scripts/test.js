'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const glob = require('glob');
const chokidar = require('chokidar');
const _ = require('lodash');
const utils = require('./utils');

const argv = require('minimist')(process.argv.slice(2));
const testDir = path.join(__dirname, '../test');
const srcDir = path.join(__dirname, '../src');
const testModulesDir = path.join(testDir, 'modules');

if (argv.install) {
  if (!fs.existsSync(testModulesDir)) {
    fs.mkdirSync(testModulesDir);
  }

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
  }

  let pkgs = [require(testDir + '/package.json')];
  let dependencies = {};
  fs.readdirSync(srcDir).forEach((lib) => {
    if (!/^alaska/.test(lib)) return;
    pkgs.push(require(srcDir + '/' + lib + '/package.json'));
  });

  pkgs.forEach((json) => {
    _.forEach(json.dependencies, (v, key) => {
      if (/^alaska/.test(key)) return;
      dependencies[key] = v;
    });
    _.forEach(json.devDependencies, (v, key) => {
      if (dependencies[key] || /^alaska/.test(key)) return;
      dependencies[key] = v;
    });
  });

  console.log(chalk.green('Install dependencies...'));
  let cmd = 'npm install ' + _.map(dependencies, (v, k) => (k + '@' + v)).join(' ');
  console.log(chalk.blue(cmd));
  execSync(cmd, {
    cwd: testDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
}

function copySrcFile(file) {
  console.log(chalk.blue('copy'), file);
  let srcFile = path.join(srcDir, file);
  let distFile = path.join(testModulesDir, file);
  if (/\.jsx?$/.test(srcFile)) {
    let content = fs.readFileSync(srcFile, 'utf8');
    content = content.replace(/from\s+'alaska/g, (match) => {
      return 'from \'' + path.relative(file, 'alaska').substr(3);
    });
    // require('alaska
    content = content.replace(/require\('alaska/g, (match) => {
      return 'require(\'' + path.relative(file, 'alaska').substr(3);
    });
    fs.writeFileSync(distFile, content);
  } else {
    fs.copyFileSync(srcFile, distFile);
  }
}

if (argv.copy) {
  console.log(chalk.green('Copy packages...'));
  glob('**/*', {
    cwd: 'src',
    nodir: true
  }, (error, files) => {
    for (let file of files) {
      copySrcFile(file);
    }
  });
}

if (argv.watch) {
  console.log(chalk.green('Watching...'));

  chokidar.watch(srcDir, {
    ignored: /node_modules|[\/\\]\./
  }).on('all', (event, srcFile) => {
    if (srcFile.endsWith('_')) return;
    if (utils.isFile(srcFile)) {
      let file = path.relative(srcDir, srcFile);
      copySrcFile(file);
    }
  });
}

if (argv.test) {
  console.log(chalk.green('Start test...'));
  execSync('npm run test', {
    cwd: testDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
} else if (argv.cover) {
  console.log(chalk.green('Start cover...'));
  execSync('npm run cover', {
    cwd: testDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
} else if (argv.start) {
  console.log(chalk.green('Start server...'));
  execSync('node server.js', {
    cwd: testDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
}
