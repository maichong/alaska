'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class EventService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-event';
    options.dir = options.dir || __dirname;
    super(options);
  }
}

exports.default = new EventService();