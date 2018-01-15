'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const akita = require('akita-node');
const read = require('read-promise');
const utils = require('./utils');
const dir = process.cwd() + '/src';

const libVersions = {};

async function getVersions(pkg) {
  if (!libVersions[pkg]) {
    let json = await akita.get('http://registry.npm.taobao.org/' + pkg);
    if (json['dist-tags']) {
      libVersions[pkg] = json['dist-tags'];
    }
  }
  return libVersions[pkg];
}

async function update(pkg, newVersion) {
  let pkgFile = path.join(dir, pkg, 'package.json');
  if (!utils.isFile(pkgFile)) return;
  let needSave = false;
  let info = require(pkgFile);
  if (newVersion && info.version !== newVersion) {
    info.version = newVersion;
    needSave = true;
  }
  console.log('update ' + info.name + '...');
  for (let p of ['dependencies', 'devDependencies', 'peerDependencies']) {
    let libs = info[p];
    if (!libs) continue;
    for (let name in libs) {
      if (/^alaska/.test(name) && newVersion) {
        // alaska
        info[p][name] = '^' + newVersion;
        needSave = true;
        continue;
      }
      try {
        if (libs[name] === '*' || libs[name][0] !== '^') continue;
        let v = await getVersions(name, libs[name]);
        if (!v) {
          console.log(name + ' last version not found');
          continue;
        }
        let latest = v.latest;
        let old = libs[name].substr(1);
        if (semver.gte(old, latest)) continue;

        try {
          let yes = await read({
            prompt: `${name} : ^${old} => ^${latest} ?`,
            default: 'yes'
          });
          if (yes === 'yes') {
            info[p][name] = '^' + latest;
            needSave = true;
          }
        } catch (err) {
          console.error(err);
          process.exit();
          continue;
        }
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
  if (needSave) {
    fs.writeFileSync(pkgFile, JSON.stringify(info, null, 2) + '\n');
  }
}

async function start() {
  let newVersion = '';
  if (process.argv.length === 3) {
    newVersion = process.argv[2];
  }
  let pkgs = fs.readdirSync(dir);
  for (let pkg of pkgs) {
    await update(pkg, newVersion);
  }
  console.log('done');
}

start();
