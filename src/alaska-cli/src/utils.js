import fs from 'fs';
import Path from 'path';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import * as babel from 'babel-core';
import read from 'read-promise';

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
export function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
export function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

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

export async function readBool(options, def) {
  if (typeof options === 'string') {
    options = {
      prompt: options
    };
  }
  if (def !== undefined) {
    options.default = (def === true || def === 'yes' || def === 'y') ? 'yes' : 'no';
  }
  let value = await read(options);
  if (['yes', 'y'].indexOf(value) > -1) {
    return true;
  }
  if (['no', 'n'].indexOf(value) > -1) {
    return false;
  }
  return await readBool(options);
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
    if (isFile(fromPath)) {
      transformSrouceFile(fromPath, toPath);
    } else {
      transformSrouceDir(fromPath, toPath);
    }
  }
}

