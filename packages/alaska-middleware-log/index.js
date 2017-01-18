// @flow

import Create from 'alaska-log/sleds/Create';
import pathToRegexp from 'path-to-regexp';
import _ from 'lodash';

export default function (options?: Object) {
  let ignore: ?RegExp[] = null;

  function convert(input) {
    if (typeof input === 'string') {
      // $Flow
      ignore.push(pathToRegexp(input));
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

  return function logMiddleware(ctx: Alaska$Context, next: Function) {
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
      }
      let details = {};
      if (options && options.headers && typeof Array.isArray(options.headers)) {
        details.headers = _.pick(ctx.headers, options.headers);
      } else if (options && options.headers === true) {
        details.headers = options.headers;
      } else {
        details = undefined;
      }
      Create.run({
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
