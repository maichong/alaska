'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _downloadGithubRepo = require('download-github-repo');

var _downloadGithubRepo2 = _interopRequireDefault(_downloadGithubRepo);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function github(url, destination) {
  return new Promise((resolve, reject) => {
    (0, _downloadGithubRepo2.default)(url, destination, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/* eslint no-console:0 */

exports.default = async function create(name) {
  let rootDir = _path2.default.join(process.cwd(), name);
  if (utils.isDirectory(rootDir)) {
    console.error(_chalk2.default.red(`项目创建失败："${rootDir}" 已经存在`));
    process.exit();
  }
  let tips = `
  1: Alaska core project without any services & plugins.
  2: Basic project with React server side rendering.
  3: With User service and RBAC system.
  4: With Admin service for generate admin dashboard automatically.
  5: With Post service for blog site.
  6: With Goods and Order service for shopping site.
`;
  console.log(tips);
  let type = await utils.readValue({
    prompt: 'Please select project template?',
    default: 6
  }, p => p >= 1 && p <= 5);
  let branch = '';
  switch (type) {
    case '1':
      branch = 'core';
      break;
    case '2':
      branch = 'base';
      break;
    case '3':
      branch = 'user';
      break;
    case '4':
      branch = 'admin';
      break;
    case '5':
      branch = 'post';
      break;
    case '6':
    default:
      branch = 'goods';
      break;
  }
  console.log(_chalk2.default.green('Download project code...'));
  await github(`maichong/alaska-init#${branch}`, rootDir);

  console.log(_chalk2.default.green('Download Completed.'));
  let pkgFile = _path2.default.join(rootDir, 'package.json');
  let pkg = utils.readJSON(pkgFile);
  pkg.name = name;
  utils.writeJson(pkgFile, pkg);

  console.log(_chalk2.default.green('Install dependencies...'));

  (0, _child_process.execSync)('npm install', {
    cwd: rootDir,
    stdio: ['inherit', 'inherit', 'inherit'],
    env: Object.assign({
      NPM_CONFIG_LOGLEVEL: 'http',
      NPM_CONFIG_PROGRESS: 'false'
    }, process.env)
  });

  console.log(_chalk2.default.green('--- Alaska project created, please type the following commands for start server. ---'));
  console.log(_chalk2.default.gray('>'), _chalk2.default.blue('cd ' + name));
  console.log(_chalk2.default.gray('>'), _chalk2.default.blue('node server.js'));
};