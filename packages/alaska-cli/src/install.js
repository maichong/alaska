// @flow

import esprima from 'esprima';
import escodegen from 'escodegen';
import fs from 'fs';
import * as utils from './utils';
import * as npm from './npm';

const rcFile = process.cwd() + '/.alaska';

if (!utils.isFile(rcFile)) {
  throw new Error(`Can not find project file '${rcFile}'`);
}
const rc = utils.readJSON(rcFile);
const configFile = process.cwd() + '/config/' + rc.id + '.js';
if (!utils.isFile(configFile)) {
  throw new Error(`Can not find config file '${rcFile}'`);
}

export default async function install(name: []) {
  console.log(`Install service packages`);
  let conf = {
    save: true,
    argv: {
      remain: name,
      cooked: ['install', '--save'].concat(name),
      original: ['install', '-S'].concat(name)
    },
    _exit: true
  };
  await npm.load(conf);
  await npm.commands.install(process.cwd(), name);
}

export async function update(services: Object[]) {
  console.log('Update config file...');

  let content = fs.readFileSync(configFile, 'utf8');
  //console.log(content);
  let data;
  try {
    data = esprima.parse(content, {
      comment: true,
      attachComment: true,
      range: false,
      loc: false,
      sourceType: 'module'
    });
  } catch (err) {
    throw new Error('Can not parse config file:' + err.message);
  }


  let success = false;
  for (let d of data.body) {
    if (d.type !== 'ExportDefaultDeclaration') {
      continue;
    }
    for (let prop of d.declaration.properties) {
      if (prop.key.value !== 'services') {
        continue;
      }
      let properties = prop.value.properties;
      services.forEach((s) => {
        properties.push({
          type: 'Property',
          key: {
            type: 'Literal',
            value: s.id,
            raw: `'${s.id}'`
          },
          computed: false,
          value: {
            type: 'ObjectExpression',
            properties: []
          },
          kind: 'init',
          method: false,
          shorthand: false
        });
      });
      success = true;
    }
  }
  if (!success) {
    throw new Error('Can not find services config');
  }

  content = escodegen.generate(data, {
    format: { indent: { style: '  ' } },
    comment: true
  });

  fs.writeFileSync(configFile, content);

  services.forEach(s => {
    rc.services[s.id] = true;
  });
  fs.writeFileSync(rcFile, JSON.stringify(rc, null, 2));
}
