'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = async function mount() {
  this.mount = utils.resolved;
  const { alaska } = this;

  for (let sub of this.serviceList) {
    await sub.mount('mount');
  }

  const domain = this.getConfig('domain', '', true) || '';
  let prefix = this.getConfig('prefix');
  if (prefix === false) return;
  this.debug('mount');
  if (!prefix) {
    prefix = '';
  }

  if (!prefix.endsWith('/')) {
    prefix += '/';
  }

  let point = domain + prefix;
  if (alaska._mounts[point]) {
    throw new Error(`Service mount error at ${point}, ${this.id} conflict to ${alaska._mounts[point].id}`);
  }
  alaska._mounts[point] = this;
  this.domain = domain;
  this.prefix = prefix;
  this.routes = this.router.routes();
};