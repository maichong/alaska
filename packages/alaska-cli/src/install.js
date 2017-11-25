'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _esprima = require('esprima');

var _esprima2 = _interopRequireDefault(_esprima);

var _escodegen = require('escodegen');

var _escodegen2 = _interopRequireDefault(_escodegen);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console:0 */

exports.default = async function install(name) {
  const rcFile = process.cwd() + '/.alaska';

  if (!utils.isFile(rcFile)) {
    throw new Error(`Can not find project file '${rcFile}'`);
  }

  const rc = utils.readJSON(rcFile);
  const configFile = process.cwd() + '/config/' + rc.id + '.js';

  if (!utils.isFile(configFile)) {
    throw new Error(`Can not find config file '${configFile}'`);
  }
  console.log(_chalk2.default.green('Install service packages...'));

  (0, _child_process.execSync)('npm install --save ' + name, {
    pwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit'],
    env: Object.assign({
      NPM_CONFIG_LOGLEVEL: 'http',
      NPM_CONFIG_PROGRESS: 'false'
    }, process.env)
  });

  console.log(_chalk2.default.green('Update config file...'));

  let content = _fs2.default.readFileSync(configFile, 'utf8');
  let data;
  try {
    data = _esprima2.default.parse(content, {
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
      if (prop.key.name !== 'services') {
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

  content = _escodegen2.default.generate(data, {
    format: { indent: { style: '  ' } },
    comment: true
  });

  _fs2.default.writeFileSync(configFile, content);

  rc.services[name] = true;
  _fs2.default.writeFileSync(rcFile, JSON.stringify(rc, null, 2));
};