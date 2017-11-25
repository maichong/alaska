'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class PostService
 */
class PostService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-post';
    super(options);
  }
}

exports.default = new PostService();