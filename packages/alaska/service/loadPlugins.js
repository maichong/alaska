'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function loadPlugins() {
  this.loadPlugins = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadPlugins();
  }

  this.debug('loadPlugins');

  let serviceModules = this.alaska.modules.services[this.id];

  this.plugins = {};

  _lodash2.default.forEach(serviceModules.plugins, ({ Plugin }, key) => {
    if (!Plugin) return;
    this.plugins[key] = new Plugin(this);
  });
};