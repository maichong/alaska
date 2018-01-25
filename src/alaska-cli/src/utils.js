import fs from 'fs';
import Path from 'path';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import * as babel from 'babel-core';
import read from 'read-promise';
import isFile from 'is-file';

export function readJSON(file) {
  let data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

export function writeJson(file, data) {
  return fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export async function readValue(options, checker) {
  let value = await read(options);
  if (!checker) {
    checker = function (v) {
      return v;
    };
  }
  if (checker(value)) {
    return value;
  }
  return await readValue(options, checker);
}

function transformSrouceFile(from, to) {
  mkdirp.sync(Path.dirname(to));
  let relative = Path.relative(process.cwd(), from);

  let needBabel = false;
  if (/\.jsx?$/.test(to)) {
    needBabel = true;
  }
  if (needBabel) {
    console.log(chalk.blue('    transform'), relative);
    let code = babel.transformFileSync(from, {}).code;
    fs.writeFileSync(to, code);
  } else {
    console.log(chalk.blue('    copy'), relative);
    fs.copyFileSync(from, to);
  }
}

export function transformSrouceDir(from, to) {
  mkdirp.sync(Path.dirname(to));

  let files = fs.readdirSync(from);

  for (let file of files) {
    if (file === '.DS_Store') continue;
    let fromPath = Path.join(from, file);
    let toPath = Path.join(to, file);
    if (isFile.sync(fromPath)) {
      transformSrouceFile(fromPath, toPath);
    } else {
      transformSrouceDir(fromPath, toPath);
    }
  }
}

