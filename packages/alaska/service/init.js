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

/* eslint no-console:0 */

exports.default = async function init() {
  this.debug('init');
  this.init = utils.resolved;

  try {
    const { alaska } = this;
    let serviceModules = alaska.modules.services[this.id];
    if (!serviceModules) {
      this.panic('Invalid service modules settings!');
    }
    this.applyConfig(serviceModules.config);
    let services = this.getConfig('services') || {};
    _lodash2.default.forEach(services, (config, serviceId) => {
      if (config.optional && !alaska.hasService(serviceId)) return;
      let sub = alaska.getService(serviceId);
      sub.applyConfig(config);
      this.services[serviceId] = sub;
    });

    // Models
    _lodash2.default.forEach(serviceModules.models, (Model, name) => {
      Model.service = this;
      this.models[name] = Model;
    });

    // Sleds
    _lodash2.default.forEach(serviceModules.sleds, (Sled, name) => {
      Sled.service = this;
      Sled.sledName = name;
      Sled.key = utils.nameToKey(this.id + '.' + name);
      this.sleds[name] = Sled;
    });

    for (let sub of this.serviceList) {
      await sub.init();
    }
  } catch (error) {
    console.error(`${this.id} init field:`, error.message);
    throw error;
  }
};