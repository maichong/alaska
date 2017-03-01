// @flow

/* eslint no-console:0 */

import esprima from 'esprima';
import escodegen from 'escodegen';
import fs from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';
import * as utils from './utils';

export default async function install(name: string) {
  const rcFile = process.cwd() + '/.alaska';

  if (!utils.isFile(rcFile)) {
    throw new Error(`Can not find project file '${rcFile}'`);
  }

  const rc = utils.readJSON(rcFile);
  const configFile = process.cwd() + '/config/' + rc.id + '.js';

  if (!utils.isFile(configFile)) {
    throw new Error(`Can not find config file '${configFile}'`);
  }
  console.log(chalk.green('Install service packages...'));

  execSync('npm install --save ' + name, {
    pwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit'],
    env: {
      NPM_CONFIG_LOGLEVEL: 'http',
      NPM_CONFIG_PROGRESS: 'false',
      NPM_CONFIG_COLOR: 'false'
    }
  });

  console.log(chalk.green('Update config file...'));

  let content = fs.readFileSync(configFile, 'utf8');
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
      properties.push({
        type: 'Property',
        key: {
          type: 'Literal',
          value: name,
          raw: `'${name}'`
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

  rc.services[name] = true;
  fs.writeFileSync(rcFile, JSON.stringify(rc, null, 2));
}
