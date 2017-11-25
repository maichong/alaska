'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class CartService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-cart';
    super(options);
  }
}

exports.default = new CartService();