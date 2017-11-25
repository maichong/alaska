'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.readJSON = readJSON;
exports.writeJson = writeJson;
exports.readValue = readValue;
exports.readBool = readBool;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readPromise = require('read-promise');

var _readPromise2 = _interopRequireDefault(_readPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
function isFile(path) {
  try {
    return _fs2.default.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
function isDirectory(path) {
  try {
    return _fs2.default.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

function readJSON(file) {
  let data = _fs2.default.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

function writeJson(file, data) {
  return _fs2.default.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function readValue(options, checker) {
  let value = await (0, _readPromise2.default)(options);
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

async function readBool(options, def) {
  if (typeof options === 'string') {
    options = {
      prompt: options
    };
  }
  if (def !== undefined) {
    options.default = def === true || def === 'yes' || def === 'y' ? 'yes' : 'no';
  }
  let value = await (0, _readPromise2.default)(options);
  if (['yes', 'y'].indexOf(value) > -1) {
    return true;
  }
  if (['no', 'n'].indexOf(value) > -1) {
    return false;
  }
  return await readBool(options);
}