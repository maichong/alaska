'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createScript;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _metadata = require('./metadata');

var _metadata2 = _interopRequireDefault(_metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const indents = {}; /**
                     * @copyright Maichong Software Ltd. 2017 http://maichong.it
                     * @date 2017-11-21
                     * @author Liang <liang@maichong.it>
                     */

/* eslint quotes:0 */

for (let i = 0; i <= 16; i += 1) {
  let str = '';
  let j = i;
  while (j > 0) {
    str += ' ';
    j -= 1;
  }
  indents[i] = str;
}

function wrapWord(word) {
  if (/^[a-z]/i.test(word) && /^[a-z_0-9]+$/i.test(word)) {
    return word;
  }
  return `'${word}'`;
}

function createScript(id, dir, configFile) {
  let metadata = (0, _metadata2.default)(id, dir, configFile);

  const moduleFilePath = _path2.default.join(dir, 'modules.js');

  function relative(file) {
    let modulesDir = _path2.default.join(process.cwd(), 'node_modules');
    let res = _path2.default.relative(modulesDir, file);
    if (res && res[0] !== '.') {
      return (0, _slash2.default)(res);
    }
    res = _path2.default.relative(_path2.default.dirname(moduleFilePath), file);
    if (res[0] !== '.') {
      res = './' + res;
    }
    return (0, _slash2.default)(res);
  }

  let script = '// This file is auto-created by alaska, please DO NOT modify the file manually!\n\n';

  // fields
  script += 'exports.fields = {\n';
  _lodash2.default.forEach(metadata.fields, lib => {
    console.log('field :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // drivers
  script += 'exports.drivers = {\n';
  _lodash2.default.forEach(metadata.drivers, lib => {
    console.log('driver :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // renderers
  script += 'exports.renderers = {\n';
  _lodash2.default.forEach(metadata.renderers, lib => {
    console.log('renderer :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // middlewares
  script += 'exports.middlewares = {\n';
  _lodash2.default.forEach(metadata.middlewares, lib => {
    console.log('middleware :', lib);
    script += `  '${lib}': require('${lib}'),\n`;
  });
  script += '};\n\n';

  // services
  script += 'exports.services = {\n';

  function renderList(indent, object, name, withDefault) {
    let defaultStr = withDefault ? '.default' : '';
    if (_lodash2.default.size(object)) {
      script += `${indents[indent]}${name}: {\n`;
      _lodash2.default.forEach(object, (file, key) => {
        script += `${indents[indent]}  ${wrapWord(key)}: require('${relative(file)}')${defaultStr},\n`;
      });
      script += `${indents[indent]}},\n`;
    }
  }

  _lodash2.default.forEach(metadata.services, (service, serviceId) => {
    console.log('service :', serviceId);
    script += `  ${wrapWord(serviceId)}: {\n`;
    script += `    id: '${serviceId}',\n`;
    script += `    service: require('${relative(service.dir)}').default,\n`;
    script += `    config: require('${relative(service.config)}').default,\n`;

    renderList(4, service.api, 'api');
    renderList(4, service.controllers, 'controllers');
    renderList(4, service.routes, 'routes', true);
    renderList(4, service.locales, 'locales', true);
    renderList(4, service.models, 'models', true);
    renderList(4, service.sleds, 'sleds', true);
    renderList(4, service.updates, 'updates', true);

    // plugins
    if (_lodash2.default.size(service.plugins)) {
      script += `    plugins: {\n`;
      _lodash2.default.forEach(service.plugins, (plugin, key) => {
        console.log('    plugin :', (0, _slash2.default)(_path2.default.relative(process.cwd(), plugin.dir)));
        script += `      ${wrapWord(key)}: {\n`;
        if (plugin.pluginClass) {
          script += `        pluginClass: require('${relative(plugin.pluginClass)}').default,\n`;
        }
        if (plugin.config) {
          script += `        config: require('${relative(plugin.config)}').default,\n`;
        }
        renderList(8, plugin.api, 'api');
        renderList(8, plugin.controllers, 'controllers');
        renderList(8, plugin.routes, 'routes', true);
        renderList(8, plugin.locales, 'locales', true);
        renderList(8, plugin.models, 'models');
        renderList(8, plugin.sleds, 'sleds');
        script += `      },\n`;
      });
      script += `    },\n`;
    }

    // templatesDirs
    if (_lodash2.default.size(service.templatesDirs)) {
      script += `    templatesDirs: [\n`;
      _lodash2.default.forEach(service.templatesDirs, d => {
        script += `      '${(0, _slash2.default)(_path2.default.relative(dir, d))}',\n`;
      });
      script += `    ],\n`;
    }

    // react views
    script += `    reactViews: {\n`;
    _lodash2.default.forEach(service.reactViews, (file, name) => {
      script += `      '${(0, _slash2.default)(name)}': require('./${(0, _slash2.default)(_path2.default.relative(dir, file))}').default,\n`;
    });
    script += `    },\n`;

    // end
    script += `  },\n`;
  });

  script += '};\n\n';

  _fs2.default.writeFileSync(moduleFilePath, script);
}