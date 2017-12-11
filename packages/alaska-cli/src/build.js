'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

var _utils = require('./utils');

var uitls = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

exports.default = async function build() {
  console.log(_chalk2.default.green('Alaska build...'));
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
  console.log(_chalk2.default.green('Build modules...'));
  let alaskaModulesPath = _path2.default.join(modulesDir, 'alaska-modules');
  if (!uitls.isDirectory(alaskaModulesPath)) {
    console.log(_chalk2.default.red('alaska-modules is not installed!'));
  } else {
    // $Flow
    const createScript = require(_path2.default.join(alaskaModulesPath, 'script')).default;
    createScript(rc.id, process.cwd() + '/src', rc.id + '.js');
  }

  // babel transform
  console.log(_chalk2.default.green('Babel transform...'));
  uitls.transformSrouceDir(_path2.default.join(dir, 'src'), _path2.default.join(dir, 'dist'));

  // build admin
  console.log(_chalk2.default.green('Build admin dashboard...'));
  if (!uitls.isDirectory(_path2.default.join(modulesDir, 'alaska-admin-view'))) {
    console.log(_chalk2.default.grey('alaska-admin-view is not installed!'));
    return;
  }

  if (!uitls.isDirectory(dir + 'runtime/alaska-admin-view')) {
    _mkdirp2.default.sync('runtime/alaska-admin-view');
  }

  const modulesList = _fs2.default.readdirSync(modulesDir).filter(file => file[0] !== '.' && file.startsWith('alaska-') && file !== 'alaska-admin-view');

  let runtimeStyleFile = dir + 'runtime/alaska-admin-view/style.less';

  let styles = modulesList.map(name => {
    let styleFile = _path2.default.join(modulesDir, name, 'style.less');
    if (uitls.isFile(styleFile)) {
      let p = (0, _slash2.default)(_path2.default.relative(_path2.default.dirname(runtimeStyleFile), styleFile));
      return `@import "${p}";`;
    }
    return false;
  }).filter(f => f).join('\n');

  _fs2.default.writeFileSync(runtimeStyleFile, styles);

  let views = {};
  let wrappers = {};
  let routes = [];
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
        m.routes.forEach(route => routes.push(route));
      } else if (m.routes.component) {
        routes.push(m.routes);
      }
    }
    if (m.navs && m.navs.length) {
      m.navs.forEach(nav => navs.push(nav));
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

  modulesList.forEach(name => {
    try {
      let viewsDir = _path2.default.join(modulesDir, name, 'views');
      let viewsFile = _path2.default.join(viewsDir, 'index.js');
      if (uitls.isFile(viewsFile)) {
        // 如果views配置文件存在
        // $Flow require()
        parse(require(viewsFile));
      } else if (uitls.isDirectory(viewsDir)) {
        let config = {
          views: {}
        };
        _fs2.default.readdirSync(viewsDir).filter(f => f[0] !== '.' && f.endsWith('.jsx')).forEach(f => {
          config.views[f.replace(/\.jsx$/, '')] = _path2.default.join(viewsDir, f);
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
    let r = (0, _slash2.default)(_path2.default.relative(dir, views[name]));
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
      let r = (0, _slash2.default)(_path2.default.relative(dir, file));
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
    let r = (0, _slash2.default)(_path2.default.relative(dir, route.component));
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
    let r = (0, _slash2.default)(_path2.default.relative(dir, nav));
    let com = 'Nav' + index;
    content += `import ${com} from '../../${r}';\n`;
    contentTmp += `  ${com},\n`;
    console.log(`nav : ${r}`);
  });
  content += contentTmp + '];\n';

  _fs2.default.writeFileSync(runtimeViewsFile, content);
};