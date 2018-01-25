// @flow

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import fs from 'fs';
import mkdirp from 'mkdirp';
import Path from 'path';
import chalk from 'chalk';
import slash from 'slash';
import isFile from 'is-file';
import isDirectory from 'is-directory';
import * as uitls from './utils';

export default async function build(options: Object) {
  console.log(chalk.green('Alaska build...'));
  const cwd = process.cwd();
  let rcFile = Path.join(cwd, '.alaska');
  if (!isFile.sync(rcFile)) {
    throw new Error('Current folder is not an alaska project!');
  }

  let rc = uitls.readJSON(rcFile);
  if (!rc || !rc.id) {
    throw new Error('.alaska file error!');
  }

  let mdirs = options.modulesDirs || [];
  if (mdirs.indexOf('node_modules') < 0) {
    mdirs.push('node_modules');
  }

  mdirs = mdirs.map((d) => Path.join(cwd, d));

  // build modules
  console.log(chalk.green('Build modules...'));
  let alaskaModulesPath = '';
  for (let d of mdirs) {
    let tmp = Path.join(d, 'alaska-modules');
    if (isDirectory.sync(tmp)) {
      alaskaModulesPath = tmp;
      break;
    }
  }
  if (!alaskaModulesPath) {
    console.log(chalk.red('alaska-modules is not installed!'));
  } else {
    // $Flow
    const createScript = require(Path.join(alaskaModulesPath, 'script')).default;
    createScript(rc.id, process.cwd() + '/src', rc.id + '.js', options.modulesDirs);
  }

  // babel transform
  console.log(chalk.green('Babel transform...'));
  uitls.transformSrouceDir(Path.join(cwd, 'src'), Path.join(cwd, 'dist'));

  // build admin
  console.log(chalk.green('Build admin dashboard...'));
  let adminViewInstalled = false;
  for (let d of mdirs) {
    if (isDirectory.sync(Path.join(d, 'alaska-admin-view'))) {
      adminViewInstalled = true;
      break;
    }
  }
  if (!adminViewInstalled) {
    console.log(chalk.grey('alaska-admin-view is not installed!'));
    return;
  }

  let adminViewRuntime = Path.join(cwd, 'runtime/alaska-admin-view');
  if (!isDirectory.sync(adminViewRuntime)) {
    mkdirp.sync(adminViewRuntime);
  }

  const viewModulesList = [];
  for (let d of mdirs) {
    fs.readdirSync(d)
      .filter((file) => file[0] !== '.' && file.startsWith('alaska-') && file !== 'alaska-admin-view')
      .forEach((file) => viewModulesList.push(Path.join(d, file)));
  }

  let runtimeStyleFile = Path.join(adminViewRuntime, 'style.less');

  let styles = viewModulesList.map((dir) => {
    let styleFile = Path.join(dir, 'style.less');
    if (isFile.sync(styleFile)) {
      let p = slash(Path.relative(Path.dirname(runtimeStyleFile), styleFile));
      return `@import "${p}";`;
    }
    return false;
  }).filter((f) => (f)).join('\n');

  fs.writeFileSync(runtimeStyleFile, styles);

  let views: { [name: string]: string } = {};
  let wrappers: { [name: string]: string[] } = {};
  let routes: Object[] = [];
  let navs = [];

  function parse(m) {
    if (m.views && typeof m.views === 'object') {
      for (let name of Object.keys(m.views)) {
        let view = m.views[name];
        if (typeof view === 'string') {
          views[name] = view;
        } else if (typeof view === 'object' && view.name) {
          views[view.name] = view.path || view.field;
        }
      }
    }
    if (m.wrappers) {
      for (let name of Object.keys(m.wrappers)) {
        let wrapper = m.wrappers[name];
        if (!wrappers[name]) {
          wrappers[name] = [];
        }
        wrappers[name] = wrappers[name].concat(wrapper);
      }
    }
    if (m.routes) {
      if (Array.isArray(m.routes)) {
        m.routes.forEach((route) => routes.push(route));
      } else if (m.routes.component) {
        routes.push(m.routes);
      }
    }
    if (m.navs && m.navs.length) {
      m.navs.forEach((nav) => navs.push(nav));
    }
  }

  {
    // views 配置文件
    let viewsFile = process.cwd() + '/src/views/admin-views.js';
    if (isFile.sync(viewsFile)) {
      // $Flow require()
      parse(require(viewsFile));
    }
  }

  viewModulesList.forEach((dir) => {
    try {
      let viewsDir = Path.join(dir, 'views');
      let viewsFile = Path.join(viewsDir, 'index.js');
      if (isFile.sync(viewsFile)) {
        // 如果views配置文件存在
        // $Flow require()
        parse(require(viewsFile));
      } else if (isDirectory.sync(viewsDir)) {
        let config = {
          views: {}
        };
        fs.readdirSync(viewsDir)
          .filter((f) => f[0] !== '.' && f.endsWith('.jsx'))
          .forEach((f) => {
            config.views[f.replace(/\.jsx$/, '')] = Path.join(viewsDir, f);
          });
        parse(config);
      }
    } catch (err) {
      console.log(err);
    }
  });

  let runtimeViewsFile = Path.join(adminViewRuntime, 'views.js');
  let content = '/* This file is created by alaska build command, please do NOT modify this file manually. */\n\n';

  // 输出views
  for (let name of Object.keys(views)) {
    let r = slash(Path.relative(cwd, views[name]));
    content += `export ${name} from '../../${r}';\n`;
    console.log(`view : ${name} -> ${r}`);
  }

  // 输出 wrappers
  content += '\n\n';
  let contentTmp = '\nexport const wrappers = {\n';
  Object.keys(wrappers).forEach((name, index) => {
    console.log(`wrapper : ${name}`);
    contentTmp += `  '${name}':[`;
    wrappers[name].forEach((file, i) => {
      let r = slash(Path.relative(cwd, file));
      let com = 'Wrapper$' + index + '$' + i;
      content += `import ${com} from '../../${r}';\n`;
      contentTmp += ` ${com},`;
      console.log(`\t-> ${r}`);
    });
    contentTmp += ' ],\n';
  });
  content += contentTmp + '};';

  // 输出 routes
  content += '\n\n';
  contentTmp = '\nexport const routes = [\n';
  routes.forEach((route, index) => {
    let r = slash(Path.relative(cwd, route.component));
    let com = 'Route' + index;
    content += `import ${com} from '../../${r}';\n`;
    contentTmp += `  {\n    component: ${com},\n    path: '${route.path}'\n  },\n`;
    console.log(`route : ${route.path} -> ${r}`);
  });
  content += contentTmp + '];\n';

  // 输出 navs
  content += '\n\n';
  contentTmp = '\nexport const navs = [\n';

  navs.forEach((nav, index) => {
    let r = slash(Path.relative(cwd, nav));
    let com = 'Nav' + index;
    content += `import ${com} from '../../${r}';\n`;
    contentTmp += `  ${com},\n`;
    console.log(`nav : ${r}`);
  });
  content += contentTmp + '];\n';

  fs.writeFileSync(runtimeViewsFile, content);
}

