'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function sync(lib) {
  if (lib[0] === '.') return;
  console.log(lib);
  let cmd = `open http://npm.taobao.org/sync/${lib}`;
  child_process.execSync(cmd, {
    stdio: 'inherit'
  });
}

const packagesPath = path.join(path.dirname(__dirname), 'packages');

const version = require(path.join(path.dirname(__dirname), 'lerna.json')).version;

fs.readdirSync(packagesPath)
  .filter((file) => {
    let pkg = path.join(packagesPath, file, 'package.json');
    try {
      let data = require(pkg);
      return version === data.version;
    } catch (e) {
      return false;
    }
  })
  .forEach(sync);
