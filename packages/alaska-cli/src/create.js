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
  1: Basic project without any services.
  2: With User service and RBAC system.
  3: With Admin service for auto generate admin dashboard.
  4: With Post service for blog site.
  5: With Goods and Order service for shopping site.
`;
  console.log(tips);
  let type = await utils.readValue({
    prompt: 'Please select project template?',
    default: 5
  }, (p) => (p >= 1 && p <= 5));
  let branch = '';
  switch (type) {
    case 1:
      branch = 'base';
      break;
    case 2:
      branch = 'user';
      break;
    case 3:
      branch = 'admin';
      break;
    case 4:
      branch = 'post';
      break;
    case 5:
    default:
      branch = 'goods';
      break;
  }
  console.log(chalk.green('Download project code...'));
  await github(`maichong/alaska#${branch}`, rootDir);

  console.log(chalk.green('Download Completed.'));
  let pkgFile = path.join(rootDir, 'package.json');
  let pkg = utils.readJSON(pkgFile);
  pkg.name = name;
  utils.writeJson(pkgFile, pkg);

  console.log(chalk.green('Install dependencies...'));

  execSync('npm install', {
    pwd: rootDir,
    stdio: ['inherit', 'inherit', 'inherit'],
    env: {
      NPM_CONFIG_LOGLEVEL: 'http',
      NPM_CONFIG_PROGRESS: 'false',
      NPM_CONFIG_COLOR: 'false'
    }
  });
}
