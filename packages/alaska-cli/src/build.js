// @flow

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import chalk from 'chalk';
import * as uitls from './utils';

function filepath(file: string): string {
  return process.platform === 'win32' ? file.replace(/\\/g, '\\\\') : file;
}

export default async function build() {
  console.log(chalk.green('Alaska build admin dashboard...'));
  const dir = process.cwd() + '/';
  if (!uitls.isFile(dir + '.alaska')) {
    throw new Error('Current folder is not an alaska project!');
  }

  let rc = uitls.readJSON(dir + '.alaska');
  if (!rc || !rc.id) {
    throw new Error('.alaska file error!');
  }

  if (!uitls.isDirectory(dir + 'runtime/alaska-admin-view')) {
    mkdirp.sync('runtime/alaska-admin-view');
  }

  const modulesDir = dir + 'node_modules/';
  const modulesList = fs.readdirSync(modulesDir)
    .filter((file) => file[0] !== '.' && file.startsWith('alaska-') && file !== 'alaska-admin-view');

  let runtimeStyleFile = dir + 'runtime/alaska-admin-view/style.less';

  let styles = modulesList.map((name) => {
    let styleFile = path.join(modulesDir, name, 'style.less');
    if (uitls.isFile(styleFile)) {
      let p = path.relative(path.dirname(runtimeStyleFile), styleFile);
      return `@import "${p}";`;
    }
    return false;
  }).filter((f) => (f)).join('\n');

  fs.writeFileSync(runtimeStyleFile, styles);

  let views: { [name:string]:string } = {};
  let wrappers: { [name:string]:string[] } = {};
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
      let viewsDir = path.join(modulesDir, name, 'views');
      let viewsFile = path.join(viewsDir, 'index.js');
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
            config.views[f.replace(/\.jsx$/, '')] = path.join(viewsDir, f);
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
    let file = filepath(views[name]);
    let r = path.relative(dir, file);
    content += `export ${name} from '../../${r}';\n`;
    console.log(`view : ${name} -> ${r}`);
  }

  // 输出 wrappers
  content += '\nexport const wrappers = {\n';
  Object.keys(wrappers).forEach((name) => {
    console.log(`wrapper : ${name}`);
    content += `  '${name}':[`;
    wrappers[name].forEach((file) => {
      file = filepath(file);
      content += ` require('${file}').default,`;
      console.log(`\t-> ${file}`);
    });
    content += ' ]\n';
  });
  content += '};';

  // 输出 routes
  content += '\n\nexport const routes = [\n';
  routes.forEach((route) => {
    let file = filepath(route.component);
    content += `  {\n    component: require('${file}').default,\n    path: '${route.path}'\n  },\n`;
    console.log(`route : ${route.path} -> ${file}`);
  });
  content += '];\n';

  // 输出 navs
  content += '\nexport const navs = [\n';

  navs.forEach((nav) => {
    let file = filepath(nav);
    content += `  require('${file}').default,\n`;
  });
  content += '];\n';

  fs.writeFileSync(runtimeViewsFile, content);
}

