import fs from 'fs';
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
