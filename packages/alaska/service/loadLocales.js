'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _locales = require('../locales');

var _locales2 = _interopRequireDefault(_locales);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function loadLocales() {
  this.loadLocales = utils.resolved;
  const { alaska } = this;

  for (let sub of this.serviceList) {
    await sub.loadLocales();
  }

  this.debug('loadLocales');

  let serviceModules = this.alaska.modules.services[this.id];

  this.locales = {};

  const { locales } = this;

  _lodash2.default.forEach(serviceModules.locales, (messages, name) => {
    locales[name] = _lodash2.default.assign({}, _locales2.default[name], messages);
  });

  _lodash2.default.forEach(serviceModules.plugins, plugin => {
    if (plugin.locales) {
      _lodash2.default.forEach(plugin.locales, (messages, name) => {
        _lodash2.default.assign(locales[name], messages);
      });
    }
  });

  Object.keys(locales).forEach(locale => {
    if (!alaska.locales[locale]) {
      alaska.locales[locale] = {};
    }
    Object.assign(alaska.locales[locale], locales[locale]);
  });
};