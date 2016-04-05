/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import path from 'path';
import asyncBusboy from 'async-busboy';
import * as util from '../util';
import Session from '../session';

export default async function route() {
  this.route = util.noop;
  this.debug('%s route', this.id);

  let app = this.alaska.app;
  let service = this;

  if (this.isMain()) {
    //session
    let sessionOpts = this.config('session');
    if (sessionOpts) {
      let storeOpts = sessionOpts.store || {};
      let cookieOpts = sessionOpts.cookie || {};
      let key = cookieOpts.key || 'alaska.sid';
      let Store = require(storeOpts.type);
      let store = new Store(storeOpts);
      let random = require('string-random');
      app.use(async function (ctx, next) {
        ctx.sessionKey = key;
        let sid = ctx.sessionId = ctx.cookies.get(key, cookieOpts);
        let json;
        let session;
        if (sid) {
          try {
            json = await store.get(sid);
          } catch (e) {
            json = null;
          }
        } else {
          sid = ctx.sessionId = random(24);
          ctx.cookies.set(key, sid, cookieOpts);
        }

        if (json) {
          ctx.sessionId = sid;
          try {
            session = new Session(ctx, json);
          } catch (err) {
            if (!(err instanceof SyntaxError)) throw err;
            session = new Session(ctx, {});
          }
        } else {
          session = new Session(ctx, {});
        }

        ctx.__defineGetter__('session', function () {
          if (session) return session;
          if (session === false) return null;
        });

        ctx.__defineSetter__('session', function (val) {
          if (val === null) return (session = false);
          if (typeof val === 'object') return (session = new Session(ctx, val));
          throw new Error('ctx.session can only be set as null or an object.');
        });

        let jsonString = JSON.stringify(json);

        try {
          await next();
        } catch (err) {
          throw err;
        } finally {
          if (session === false) {
            // 清除Session
            ctx.cookies.set(key, '', cookieOpts);
            await store.del(sid);
          } else if (!json && !session.length) {
            // 未更改
          } else if (session.isChanged(jsonString)) {
            // 保存
            json = session.toJSON();
            await store.set(sid, json);
          }
        }
      });
    }

    //upload
    app.use(async function (ctx, next) {
      ctx.files = {};
      if (ctx.method !== 'POST') return await next();
      if (!ctx.request.is('multipart/*')) return await next();
      const { files, fields } = await asyncBusboy(ctx.req);
      ctx.files = {};
      files.forEach(file => {
        let fieldname = file.fieldname;
        if (ctx.files[fieldname]) {
          if (_.isArray(ctx.files[fieldname])) {
            ctx.files[fieldname].push(file);
          } else {
            ctx.files[fieldname] = [ctx.files[fieldname], file];
          }
        } else {
          ctx.files[fieldname] = file;
        }
      });
      ctx.request.body = fields;
      await next();
    });
    await this.loadAppMiddlewares();
  }

  //配置子Service路由
  for (let sub of this._services) {
    await sub.route();
  }

  if (this.config('prefix') === false) {
    return;
  }

  let router = this.router;

  //中间件
  if (this.config('middlewares')) {
    await this.loadMiddlewares();
  }

  //API 接口
  if (this.config('api')) {
    await this.loadApi();
  }

  //控制器
  if (this.config('controllers')) {
    await this.loadControllers();
  }

  //静态服务
  if (this.config('statics')) {
    await this.loadStatics();
  }

  //路由表
  let routes = router.routes();
  //精确匹配域名
  let exact = true;
  //Service域名
  let domain = this.config('domain', '');
  if (domain.startsWith('*.')) {
    domain = domain.substr(2);
    exact = false;
  }
  //如果是主域名,匹配失败后的跳转地址
  let redirect;
  if (this.isMain()) {
    redirect = this.config('redirect', '');
  }

  let templatesDir = path.join(this.dir, this.config('templates')) + '/';

  const MAIN = this.alaska.main;
  const locales = MAIN.config('locales');
  const defaultLocale = MAIN.config('defaultLocale');
  const localeCookieKey = MAIN.config('localeCookieKey');

  app.use((ctx, next) => {
    ctx.subdomain = '';
    ctx.service = service;

    if (domain) {
      let hostname = ctx.hostname;
      if (exact) {
        //如果精确匹配域名
        if (hostname !== domain) {
          redirect && ctx.redirect(redirect);
          return;
        }
      } else {
        //分析子域名
        let index = hostname.lastIndexOf(domain);
        if (index === -1) {
          redirect && ctx.redirect(redirect);
          return;
        }
        ctx.subdomain = hostname.substring(0, index - 1);
      }
    }
    //domain not set

    let toJSON = ctx.toJSON;
    ctx.toJSON = function () {
      let json = toJSON.call(ctx);
      json.subdomain = ctx.subdomain;
      json.alaska = ctx.alaska.toJSON();
      json.service = ctx.service.toJSON();
      return json;
    };

    ctx.__defineGetter__('locale', () => {
      let locale = ctx._locale;
      if (locale) {
        return locale;
      }
      locale = ctx.cookies.get(localeCookieKey) || '';
      if (!locale || locales.indexOf(locale) < 0) {
        //没有cookie设置
        //自动判断
        locale = defaultLocale;
        let languages = util.pareseAcceptLanguage(ctx.get('accept-language'));
        for (let lang of languages) {
          if (locales.indexOf(lang) > -1) {
            locale = lang;
            break;
          }
        }
        if (locale) {
          ctx._locale = locale;
        }
      }
      return locale;
    });

    ctx.t = (message, locale, values) => {
      if (_.isObject(locale)) {
        values = locale;
        locale = null;
      }
      if (!locale) {
        locale = ctx.locale;
      }
      return service.t(message, locale, values);
    };

    ctx.locals = {
      t: ctx.t
    };
    ctx.render = function (template, locals) {
      let path = templatesDir + template;
      if (!util.isFile(path)) {
        throw new Error(`Template is not exist: ${path}`);
      }
      return new Promise((resolve, reject) => {
        service.engine.renderFile(path, _.assign({}, ctx.locals, locals), (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      });
    };

    ctx.show = async function (template, locals) {
      ctx.body = await ctx.render(template, locals);
    };

    return routes(ctx, next);
  });
};
