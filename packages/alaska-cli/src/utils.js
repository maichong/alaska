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
exports.transformSrouceDir = transformSrouceDir;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _readPromise = require('read-promise');

var _readPromise2 = _interopRequireDefault(_readPromise);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function transformSrouceFile(from, to) {
  _mkdirp2.default.sync(_path2.default.dirname(to));
  let relative = _path2.default.relative(process.cwd(), from);

  let needBabel = false;
  if (/\.jsx?$/.test(to)) {
    needBabel = true;
  }
  if (needBabel) {
    console.log(_chalk2.default.blue('    transform'), relative);
    let code = babel.transformFileSync(from, {}).code;
    _fs2.default.writeFileSync(to, code);
  } else {
    console.log(_chalk2.default.blue('    copy'), relative);
    _fs2.default.copyFileSync(from, to);
  }
}

function transformSrouceDir(from, to) {
  _mkdirp2.default.sync(_path2.default.dirname(to));

  let files = _fs2.default.readdirSync(from);

  for (let file of files) {
    if (file === '.DS_Store') continue;
    let fromPath = _path2.default.join(from, file);
    let toPath = _path2.default.join(to, file);
    if (isFile(fromPath)) {
      transformSrouceFile(fromPath, toPath);
    } else {
      transformSrouceDir(fromPath, toPath);
    }
  }
}