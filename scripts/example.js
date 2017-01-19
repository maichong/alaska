'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const shell = require('shelljs');

const exampleDir = path.join(__dirname, '../example');
const packagesDir = path.join(__dirname, '../packages');
const exampleModulesDir = path.join(__dirname, '../example/node_modules');

if (!fs.existsSync(exampleModulesDir)) {
  fs.mkdirSync(exampleModulesDir);
}

fs.readdirSync(packagesDir).forEach((lib) => {
  if (!/^alaska/.test(lib)) return;
  try {
    if (fs.existsSync(exampleModulesDir + '/' + lib)) {
      shell.rm('-rf', exampleModulesDir + '/' + lib);
    }
    console.log('copy ', lib);
    shell.cp('-R', packagesDir + '/' + lib, exampleModulesDir + '/' + lib);
  } catch (e) {
    console.log(e);
  }
});

// try {
//   execSync('npm install', {
//     cwd: exampleDir,
//     stdio: ['inherit', 'inherit', 'inherit']
//   });
// } catch (e) {
// }

try {
  execSync('node example.js', {
    cwd: exampleDir,
    stdio: ['inherit', 'inherit', 'inherit']
  });
} catch (e) {
}
