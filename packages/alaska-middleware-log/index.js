'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  let ignore = null;

  function convert(input) {
    if (typeof input === 'string') {
      // $Flow
      ignore.push((0, _pathToRegexp2.default)(input));
    } else if (input.test) {
      // $Flow
      ignore.push(input);
    } else if (input instanceof Function) {
      // $Flow
      ignore.push(input);
    } else {
      throw new Error('Invalid session ignore option: ' + String(input));
    }
  }

  if (options && options.ignore) {
    ignore = [];
    if (Array.isArray(options.ignore)) {
      options.ignore.forEach(convert);
    } else {
      convert(options.ignore);
    }
  }

  return function logMiddleware(ctx, next) {
    if (ignore) {
      for (let reg of ignore) {
        if (reg.test) {
          if (reg.test(ctx.path)) return next();
        }
      }
    }
    let start = Date.now();

    function log() {
      let time = Date.now() - start;
      let status = ctx.status;
      let level = 'info';
      switch (status) {
        case 404:
        case 403:
          level = 'warning';
          break;
        case 400:
        case 500:
          level = 'error';
          break;
        default:
          level = 'info';
      }
      let details = {};
      if (options && options.headers && typeof Array.isArray(options.headers)) {
        details.headers = _lodash2.default.pick(ctx.headers, options.headers);
      } else if (options && options.headers === true) {
        details.headers = options.headers;
      } else {
        details = undefined;
      }
      _Create2.default.run({
        title: ctx.url,
        type: 'http',
        method: ctx.method,
        level,
        ip: ctx.ip,
        status,
        length: ctx.length,
        time,
        details
      });
    }

    return next().then(log, log);
  };
};

var _Create = require('alaska-log/sleds/Create');

var _Create2 = _interopRequireDefault(_Create);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }