'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function loadConfig() {
  this.loadConfig = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadConfig();
  }

  this.debug('loadConfig');

  let serviceModules = this.alaska.modules.services[this.id];

  _lodash2.default.forEach(serviceModules.plugins, plugin => {
    if (plugin.config) {
      this.applyConfig(plugin.config);
    }
  });

  if (this.isMain()) {
    let mainMiddlewares = this.getConfig('middlewares', {});
    for (let sub of this.serviceList) {
      let middlewares = sub.getConfig('middlewares', {});
      _lodash2.default.forEach(middlewares, (cfg, id) => {
        if (!mainMiddlewares[id]) {
          mainMiddlewares[id] = cfg;
        }
      });
    }
  }

  let mainDir = this.alaska.main.dir;
  _lodash2.default.forEach(serviceModules.templatesDirs, dir => {
    this.templatesDirs.push(_path2.default.join(mainDir, dir));
  });
};