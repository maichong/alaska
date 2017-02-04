// @flow

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import fs from 'fs';
import { execFileSync } from 'child_process';
import mkdirp from 'mkdirp';
import * as uitls from './utils';

function filepath(file: string): string {
  return process.platform === 'win32' ? file.replace(/\\/g, '\\\\') : file;
}

export default async function build(options: Object) {
  console.log('Alaska build admin dashboard...');
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
  const modulesList = fs.readdirSync(modulesDir);

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

  let viewsFile = process.cwd() + '/views/views.js';
  if (uitls.isFile(viewsFile)) {
    // $Flow require()
    parse(require(viewsFile));
  }

  modulesList.forEach((name) => {
    try {
      // $Flow require()
      parse(require(modulesDir + name));
      return;
    } catch (err) {
      console.log(err);
    }
  });

  let content = '/* This file is created by alaska build command, please modify this file manually. */\n\n';

  for (let name of Object.keys(views)) {
    let file = filepath(views[name]);
    content += `exports['${name}'] = require('${file}').default;\n`;
    console.log(`view : ${name} -> ${file}`);
  }
  content += '\nexports.wrappers={\n';
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

  content += '\n\nexports.routes=[\n';
  routes.forEach((route) => {
    let file = filepath(route.component);
    content += `  {\n    component: require('${file}').default,\n    path: '${route.path}'\n  },\n`;
    console.log(`route : ${route.path} -> ${file}`);
  });
  content += '];\n';

  content += '\nexports.navs=[\n';

  navs.forEach((nav) => {
    let file = filepath(nav);
    content += `  require('${file}').default,\n`;
  });
  content += '];\n';

  fs.writeFileSync(dir + 'runtime/alaska-admin-view/views.js', content);

  let args = ['webpack', '--config'];

  if (options.dev) {
    args.push('webpack.admin.dev.js');
  } else {
    args.push('webpack.admin.pro.js');
  }

  if (options.watch) {
    args.push('-w');
  }

  console.log(args.join(' '));
  let execFile = modulesDir + '.bin/webpack';
  if (process.platform === 'win32') {
    execFile += '.cmd';
  }
  execFileSync(execFile, args.slice(1), {
    stdio: ['inherit', 'inherit', 'inherit']
  });
}

