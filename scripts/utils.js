'use strict';

const mkdirp = require('mkdirp');
const fs = require('fs');

exports.mkdirpAsync = function mkdirpAsync(dir, opts) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, opts, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
exports.isFile = function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
};

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
exports.isDirectory = function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
};

exports.isFileAsync = function isFileAsync(path) {
  return new Promise((resolve) => {
    return fs.stat(path, (error, stats) => {
      if (error) {
        resolve(false);
      } else {
        resolve(stats.isFile());
      }
    });
  });
};

exports.isDirectoryAsync = function isDirectoryAsync(path) {
  return new Promise((resolve) => {
    return fs.stat(path, (error, stats) => {
      if (error) {
        resolve(false);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
};
