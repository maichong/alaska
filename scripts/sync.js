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

fs.readdirSync(path.join(path.dirname(__dirname), 'packages'))
  .forEach(sync);
