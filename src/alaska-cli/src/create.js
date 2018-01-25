// @flow

/* eslint no-console:0 */

import path from 'path';
import download from 'download-github-repo';
import chalk from 'chalk';
import { execSync } from 'child_process';
import * as utils from './utils';

function github(url, destination) {
  return new Promise((resolve, reject) => {
    download(url, destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default async function create(name: string) {
  let rootDir = path.join(process.cwd(), name);
  if (utils.isDirectory(rootDir)) {
    console.error(chalk.red(`项目创建失败："${rootDir}" 已经存在`));
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
  }, (p) => (p >= 1 && p <= 5));
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
  console.log(chalk.green('Download project code...'));
  await github(`maichong/alaska-init#${branch}`, rootDir);

  console.log(chalk.green('Download Completed.'));
  let pkgFile = path.join(rootDir, 'package.json');
  let pkg = utils.readJSON(pkgFile);
  pkg.name = name;
  utils.writeJson(pkgFile, pkg);

  console.log(chalk.green('Install dependencies...'));

  execSync('npm install', {
    cwd: rootDir,
    stdio: ['inherit', 'inherit', 'inherit'],
    env: Object.assign({
      NPM_CONFIG_LOGLEVEL: 'http',
      NPM_CONFIG_PROGRESS: 'false'
    }, process.env)
  });

  console.log(chalk.green('--- Alaska project created, please type the following commands for start server. ---'));
  console.log(chalk.gray('>'), chalk.blue('cd ' + name));
  console.log(chalk.gray('>'), chalk.blue('node server.js'));
}
