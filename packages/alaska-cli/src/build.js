// @flow

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import fs from 'fs';
import mkdirp from 'mkdirp';
import Path from 'path';
import chalk from 'chalk';
import slash from 'slash';
import * as uitls from './utils';

export default async function build() {
  console.log(chalk.green('Alaska build...'));
  const dir = process.cwd() + '/';
  if (!uitls.isFile(dir + '.alaska')) {
    throw new Error('Current folder is not an alaska project!');
  }

  let rc = uitls.readJSON(dir + '.alaska');
  if (!rc || !rc.id) {
    throw new Error('.alaska file error!');
  }

  const modulesDir = dir + 'node_modules/';

  // build modules
  console.log(chalk.green('Build modules...'));
  let alaskaModulesPath = Path.join(modulesDir, 'alaska-modules');
  if (!uitls.isDirectory(alaskaModulesPath)) {
    console.log(chalk.red('alaska-modules is not installed!'));
  } else {
    const createScript = require(Path.join(alaskaModulesPath, 'script')).default;
    createScript(rc.id, process.cwd() + '/src', rc.id + '.js');
  }

  // build admin
  console.log(chalk.green('Build admin dashboard...'));
  if (!uitls.isDirectory(Path.join(modulesDir, 'alaska-admin-view'))) {
    console.log(chalk.grey('alaska-admin-view is not installed!'));
    return;
  }

  if (!uitls.isDirectory(dir + 'runtime/alaska-admin-view')) {
    mkdirp.sync('runtime/alaska-admin-view');
  }

  const modulesList = fs.readdirSync(modulesDir)
    .filter((file) => file[0] !== '.' && file.startsWith('alaska-') && file !== 'alaska-admin-view');

  let runtimeStyleFile = dir + 'runtime/alaska-admin-view/style.less';

  let styles = modulesList.map((name) => {
    let styleFile = Path.join(modulesDir, name, 'style.less');
    if (uitls.isFile(styleFile)) {
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
    let viewsFile = process.cwd() + '/views/views.js';
    if (uitls.isFile(viewsFile)) {
      // $Flow require()
      parse(require(viewsFile));
    }
  }

  modulesList.forEach((name) => {
    try {
      let viewsDir = Path.join(modulesDir, name, 'views');
      let viewsFile = Path.join(viewsDir, 'index.js');
      if (uitls.isFile(viewsFile)) {
        // 如果views配置文件存在
        // $Flow require()
        parse(require(viewsFile));
      } else if (uitls.isDirectory(viewsDir)) {
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

  let runtimeViewsFile = dir + 'runtime/alaska-admin-view/views.js';
  let content = '/* This file is created by alaska build command, please do NOT modify this file manually. */\n\n';

  // 输出views
  for (let name of Object.keys(views)) {
    let r = slash(Path.relative(dir, views[name]));
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
      let r = slash(Path.relative(dir, file));
      let com = 'Wrapper$' + index + '$' + i;
      content += `import ${com} from '../../${r}';\n`;
      contentTmp += ` ${com},`;
      console.log(`\t-> ${r}`);
    });
    contentTmp += ' ]\n';
  });
  content += contentTmp + '};';

  // 输出 routes
  content += '\n\n';
  contentTmp = '\nexport const routes = [\n';
  routes.forEach((route, index) => {
    let r = slash(Path.relative(dir, route.component));
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
    let r = slash(Path.relative(dir, nav));
    let com = 'Nav' + index;
    content += `import ${com} from '../../${r}';\n`;
    contentTmp += `  ${com},\n`;
    console.log(`nav : ${r}`);
  });
  content += contentTmp + '];\n';

  fs.writeFileSync(runtimeViewsFile, content);
}

