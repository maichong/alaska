'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class FavoriteService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-favorite';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

exports.default = new FavoriteService();