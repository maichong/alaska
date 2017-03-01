'use strict';

const fs = require('fs');

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
