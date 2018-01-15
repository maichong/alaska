'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  prefix: '/user',
  services: {
    'alaska-settings': {}
  },
  cache: {
    id: 'default-of-service',
    type: 'alaska-cache-lru',
    prefix: false,
    maxAge: 3600 * 1000
  }
};