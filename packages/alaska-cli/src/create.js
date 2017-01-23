// @flow

import path from 'path';
import download from 'download-github-repo';
import * as utils from './utils';

function github(url, uri) {
  return new Promise(function (resolve, reject) {
    download(url, uri, (err) => {
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
    console.error(`项目创建失败："${rootDir}" 已经存在`.red);
    process.exit();
  }
  let tips = `
  1: base    alaska基本框架;
  2: user    alaska用户权限框架;
  3: admin   alaska管理后台框架;
  4: post    alaska博客框架;
  5: goods   alaska商城框架
`;
  console.log(tips.green);
  let type = await utils.readValue({ prompt: '请选择项目类型?', default: 5 }, (p) => (p >= 1 && p <= 5));
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
  console.log('开始下载项目...'.green);
  await github(`maichong/alaska#${branch}`, rootDir);

  console.log('下载完毕'.green);
  let pkgFile = path.join(rootDir, 'package.json');
  let pkg = utils.readJSON(pkgFile);
  pkg.name = name;
  utils.writeJson(pkgFile, pkg);

  console.log('安装npm依赖'.green);
  exec((which('yarn') ? 'yarn' : 'npm install'), {
    cwd: rootDir
  }, () => process.exit());
}
