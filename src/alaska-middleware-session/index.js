// @flow

import alaska from 'alaska';
import random from 'string-random';
import pathToRegexp from 'path-to-regexp';
import Session from './session';

export default function (options: Alaska$Config$session) {
  const storeOpts = options.store || {};
  const cookieOpts = options.cookie || {};
  const key: string = cookieOpts.key || 'alaska.sid';
  const Store = alaska.modules.drivers[storeOpts.type];
  if (!Store) {
    alaska.panic(`Session store driver '${storeOpts.type}' not found!`);
  }
  const store = new Store(alaska.main, storeOpts);
  let ignore: ?RegExp[] = null;

  function convert(input) {
    if (typeof input === 'string') {
      // $Flow
      ignore.push(pathToRegexp(input));
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

  return async function sessionMiddleware(ctx: Alaska$Context, next: Function) {
    if (ignore) {
      for (let reg of ignore) {
        if (
          (reg instanceof RegExp && reg.test(ctx.path))
          || (typeof reg === 'function' && reg(ctx.path))
        ) {
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
      ctx.sessionId = random(24);
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
        session = new Session(ctx, json);
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err;
        }
        session = new Session(ctx, {});
      }
    } else {
      session = new Session(ctx, {});
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
          session = new Session(ctx, val);
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
}
