'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  const storeOpts = options.store || {};
  const cookieOpts = options.cookie || {};
  const key = cookieOpts.key || 'alaska.sid';
  const Store = _alaska2.default.modules.drivers[storeOpts.type];
  if (!Store) {
    _alaska2.default.panic(`Session store driver '${storeOpts.type}' not found!`);
  }
  const store = new Store(_alaska2.default.main, storeOpts);
  let ignore = null;

  function convert(input) {
    if (typeof input === 'string') {
      // $Flow
      ignore.push((0, _pathToRegexp2.default)(input));
    } else if (input instanceof RegExp || typeof input === 'function') {
      // $Flow
      ignore.push(input);
    } else {
      throw new Error('Invalid session ignore option: ' + String(input));
    }
  }

  if (options.ignore) {
    ignore = [];
    if (Array.isArray(options.ignore)) {
      options.ignore.forEach(convert);
    } else {
      convert(options.ignore);
    }
  }

  return async function sessionMiddleware(ctx, next) {
    if (ignore) {
      for (let reg of ignore) {
        if (reg instanceof RegExp && reg.test(ctx.path) || typeof reg === 'function' && reg(ctx.path)) {
          await next();
          return;
        }
      }
    }
    ctx.sessionKey = key;
    let sid = '';
    if (cookieOpts && cookieOpts.get) {
      ctx.sessionId = cookieOpts.get(ctx, key, cookieOpts);
      sid = ctx.sessionId;
    } else {
      // $Flow
      ctx.sessionId = ctx.cookies.get(key, cookieOpts);
      sid = ctx.sessionId;
    }
    let json;
    let session;

    if (sid) {
      json = await store.get(sid);
    } else {
      ctx.sessionId = (0, _stringRandom2.default)(24);
      sid = ctx.sessionId;
      if (cookieOpts && cookieOpts.set) {
        cookieOpts.set(ctx, key, sid, cookieOpts);
      } else {
        ctx.cookies.set(key, sid, cookieOpts);
      }
    }

    if (json) {
      ctx.sessionId = sid;
      try {
        session = new _session2.default(ctx, json);
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err;
        }
        session = new _session2.default(ctx, {});
      }
    } else {
      session = new _session2.default(ctx, {});
    }

    // $Flow
    Object.defineProperty(ctx, 'session', {
      get() {
        if (session) return session;
        if (session === false) return null;
        return null;
      },
      set(val) {
        if (val === null) {
          session = false;
          return;
        }
        if (typeof val === 'object') {
          session = new _session2.default(ctx, val);
          return;
        }
        throw new Error('ctx.session can only be set as null or an object.');
      }
    });

    let jsonString = JSON.stringify(json);

    function onNext() {
      if (session === false) {
        // 清除Session
        if (cookieOpts && cookieOpts.set) {
          cookieOpts.set(ctx, key, '', cookieOpts);
        } else {
          ctx.cookies.set(key, '', cookieOpts);
        }
        store.del(sid);
      } else if (!json && !session.length) {
        // 未更改
      } else if (session.isChanged(jsonString)) {
        // 保存
        json = session.toJSON();
        store.set(sid, json);
      }
    }

    try {
      await next();
      onNext();
    } catch (error) {
      onNext();
    }
  };
};

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _stringRandom = require('string-random');

var _stringRandom2 = _interopRequireDefault(_stringRandom);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }