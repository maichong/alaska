import { MainService } from 'alaska';
import { Context } from 'alaska-http';
import * as random from 'string-random';
import * as pathToRegexp from 'path-to-regexp';
import Session from './session';
import {
  SessionMiddlewareOptions,
  CustomIgnoreFunction,
  IngoreRule
} from '.';
import CacheDriver from 'alaska-cache';

export default function (options: SessionMiddlewareOptions, main: MainService) {
  const storeOpts = options.store;
  if (!storeOpts) throw new Error('Missing config [/middlewares.alaska-middleware-session.store]');
  const cookieOpts = options.cookie || {};
  const key: string = cookieOpts.key || 'alaska.sid';
  const Store: typeof CacheDriver = main.modules.libraries[storeOpts.type];
  if (!Store) throw new Error(`Session store driver '${storeOpts.type}' not found!`);
  const store = new Store(storeOpts, main);
  let ignore: Array<RegExp | CustomIgnoreFunction> = null;

  function convert(input: IngoreRule) {
    if (typeof input === 'string') {
      ignore.push(pathToRegexp(input));
    } else if (input instanceof RegExp || typeof input === 'function') {
      ignore.push(input);
    } else {
      throw new Error(`Invalid session ignore option: ${String(input)}`);
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

  return async function sessionMiddleware(ctx: Context, next: Function) {
    if (ignore) {
      for (let reg of ignore) {
        if (
          (reg instanceof RegExp && reg.test(ctx.path))
          // @ts-ignore
          || (typeof reg === 'function' && reg(ctx.path, ctx))
        ) {
          await next();
          return;
        }
      }
    }
    ctx.sessionKey = key;
    let sid = '';
    if (cookieOpts && options.getSessionId) {
      ctx.sessionId = options.getSessionId(ctx, key, cookieOpts);
      sid = ctx.sessionId;
    } else {
      // @ts-ignore
      ctx.sessionId = ctx.cookies.get(key, cookieOpts);
      sid = ctx.sessionId;
    }
    let json: Object;
    let session: Session | false;

    if (sid) {
      json = await store.get(sid);
    } else {
      ctx.sessionId = random(24);
      sid = ctx.sessionId;
      if (cookieOpts && options.setSessionId) {
        options.setSessionId(ctx, key, sid, cookieOpts);
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
        if (cookieOpts && options.setSessionId) {
          options.setSessionId(ctx, key, '', cookieOpts);
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
      throw error;
    }
  };
}
