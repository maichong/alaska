'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  middlewares: {
    'koa-bodyparser': {
      sort: 1000
    },
    'alaska-middleware-upload': {
      sort: 1000
    }
  },
  renderer: {
    type: 'alaska-renderer-art'
  },
  prefix: '/admin',
  statics: [{
    root: process.cwd() + '/runtime/alaska-admin-view/build',
    prefix: '/js'
  }, {
    root: _path2.default.join(__dirname, '../statics'),
    prefix: '/statics'
  }],
  services: {
    'alaska-user': {},
    'alaska-settings': {}
  },
  superMode: false,
  /**
   * run Init sled when every launch
   */
  autoInit: true,
  dashboardTitle: 'Alaska admin dashboard',
  defaultHorizontal: false
};