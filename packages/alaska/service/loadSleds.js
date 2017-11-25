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

exports.default = async function loadSleds() {
  this.loadSleds = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadSleds();
  }

  this.debug('loadSleds');

  let serviceModules = this.alaska.modules.services[this.id];

  _lodash2.default.forEach(this.sleds, (Sled, name) => {
    // 加载扩展配置
    _lodash2.default.forEach(serviceModules.plugins, plugin => {
      if (!plugin.sleds || !plugin.sleds[name]) return;
      let ext = plugin.sleds[name];
      if (ext.pre) {
        Sled.pre(ext.pre);
      }
      if (ext.post) {
        Sled.post(ext.post);
      }
      if (ext.default) {
        ext.default(Sled);
      }
    });
  });
};