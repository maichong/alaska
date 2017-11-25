'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class FeedbackService
 */
class FeedbackService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-feedback';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

exports.default = new FeedbackService();