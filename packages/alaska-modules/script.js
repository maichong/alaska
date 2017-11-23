/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-11-21
 * @author Liang <liang@maichong.it>
 */

/* eslint quotes:0 */

import fs from 'fs';
import Path from 'path';
import slash from 'slash';
import _ from 'lodash';
import createMetadata from './metadata';

const indents = {};
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

export default function createScript(id: string, dir: string, configFile: string) {
  let metadata = createMetadata(id, dir, configFile);

  const moduleFilePath = Path.join(dir, 'modules.js');

  function relative(file) {
    let modulesDir = Path.join(process.cwd(), 'node_modules');
    let res = Path.relative(modulesDir, file);
    if (res && res[0] !== '.') {
      return slash(res);
    }
    res = Path.relative(Path.dirname(moduleFilePath), file);
    if (res[0] !== '.') {
      res = './' + res;
    }
    return slash(res);
  }

  let script = '// This file is auto-created by alaska, please DO NOT modify the file manually!\n\n';

  // fields
  script += 'exports.fields = {\n';
  _.forEach(metadata.fields, (lib) => {
    console.log('field :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // drivers
  script += 'exports.drivers = {\n';
  _.forEach(metadata.drivers, (lib) => {
    console.log('driver :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // renderers
  script += 'exports.renderers = {\n';
  _.forEach(metadata.renderers, (lib) => {
    console.log('renderer :', lib);
    script += `  '${lib}': require('${lib}').default,\n`;
  });
  script += '};\n\n';

  // middlewares
  script += 'exports.middlewares = {\n';
  _.forEach(metadata.middlewares, (lib) => {
    console.log('middleware :', lib);
    script += `  '${lib}': require('${lib}'),\n`;
  });
  script += '};\n\n';

  // services
  script += 'exports.services = {\n';

  function renderList(indent: number, object: Object, name: string, withDefault?: boolean) {
    let defaultStr = (withDefault ? '.default' : '');
    if (_.size(object)) {
      script += `${indents[indent]}${name}: {\n`;
      _.forEach(object, (file, key) => {
        script += `${indents[indent]}  ${wrapWord(key)}: require('${relative(file)}')${defaultStr},\n`;
      });
      script += `${indents[indent]}},\n`;
    }
  }

  _.forEach(metadata.services, (service, serviceId) => {
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
    if (_.size(service.plugins)) {
      script += `    plugins: [{\n`;
      _.forEach(service.plugins, (plugin, index) => {
        console.log('plugin :', slash(Path.relative(process.cwd(), plugin.dir)));
        if (index > 0) {
          script += `    }, {\n`;
        }
        if (plugin.config) {
          script += `      config: require('${relative(plugin.config)}').default,\n`;
        }
        renderList(6, plugin.api, 'api');
        renderList(6, plugin.controllers, 'controllers');
        renderList(6, plugin.routes, 'routes', true);
        renderList(6, plugin.locales, 'locales', true);
        renderList(6, plugin.models, 'models');
        renderList(6, plugin.sleds, 'sleds');
      });
      script += `    }],\n`;
    }

    // templatesDirs
    if (_.size(service.templatesDirs)) {
      script += `    templatesDirs: [\n`;
      _.forEach(service.templatesDirs, (dir) => {
        script += `      '${slash(Path.relative(process.cwd(), dir))}',\n`;
      });
      script += `    ],\n`;
    }

    // end
    script += `  },\n`;
  });

  script += '};\n\n';

  fs.writeFileSync(moduleFilePath, script);
}
