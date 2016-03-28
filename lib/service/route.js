'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const path = require('path');
const _ = require('lodash');
const util = require('../util');
const asyncBusboy = require('async-busboy');

module.exports = (() => {
  var ref = _asyncToGenerator(function* () {
    this.route = util.noop;
    this.debug('%s route', this.id);

    let app = this.alaska.app;
    let service = this;
    let router = this.router;

    if (this.isMain()) {
      //session
      let sessionOpts = this.config('session');
      if (sessionOpts) {
        let storeOpts = sessionOpts.store || {};
        let cookieOpts = sessionOpts.cookie || {};
        let key = cookieOpts.key || 'alaska.sid';
        let Session = require('../session');
        let Store = require(storeOpts.type);
        let store = new Store(storeOpts);
        let random = require('string-random');
        app.use((() => {
          var ref = _asyncToGenerator(function* (ctx, next) {
            ctx.sessionKey = key;
            ctx.sessionId = null;
            let sid = ctx.cookies.get(key, cookieOpts);
            let json;
            let session;
            if (sid) {
              try {
                json = yield store.get(sid);
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
              if (val === null) return session = false;
              if (typeof val === 'object') return session = new Session(ctx, val);
              throw new Error('ctx.session can only be set as null or an object.');
            });

            let jsonString = JSON.stringify(json);

            try {
              yield next();
            } catch (err) {
              throw err;
            } finally {
              if (session === false) {
                // 清除Session
                ctx.cookies.set(key, '', cookieOpts);
                yield store.del(sid);
              } else if (!json && !session.length) {
                // 未更改
              } else if (session.isChanged(jsonString)) {
                  // 保存
                  json = session.toJSON();
                  yield store.set(sid, json);
                }
            }
          });

          return function (_x, _x2) {
            return ref.apply(this, arguments);
          };
        })());
      }

      //upload
      app.use((() => {
        var ref = _asyncToGenerator(function* (ctx, next) {
          ctx.files = {};
          if (ctx.method != 'POST') return yield next();
          if (!ctx.request.is('multipart/*')) return yield next();

          var _ref = yield asyncBusboy(ctx.req);

          const files = _ref.files;
          const fields = _ref.fields;

          ctx.files = {};
          files.forEach(function (file) {
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
          yield next();
        });

        return function (_x3, _x4) {
          return ref.apply(this, arguments);
        };
      })());
      yield this.loadAppMiddlewares();
    }

    //配置子Service路由
    for (let sub of this._services) {
      yield sub.route();
    }

    //中间件
    yield this.loadMiddlewares();

    //API 接口
    if (this.config('api')) {
      yield this.loadApi();
    }

    //控制器
    if (this.config('controllers')) {
      yield this.loadControllers();
    }

    //静态服务
    if (this.config('statics')) {
      yield this.loadStatics();
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

    app.use(function (ctx, next) {
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

      ctx.locals = {};
      ctx.render = function (template, locals) {
        let path = templatesDir + template;
        if (!util.isFile(path)) {
          throw new Error(`Template is not exist: ${ path }`);
        }
        return new Promise(function (resolve, reject) {
          service.engine.renderFile(path, _.assign({}, ctx.locals, locals), function (error, result) {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          });
        });
      };

      ctx.show = (() => {
        var ref = _asyncToGenerator(function* (template, locals) {
          ctx.body = yield ctx.render(template, locals);
        });

        return function (_x5, _x6) {
          return ref.apply(this, arguments);
        };
      })();

      return routes(ctx, next);
    });
  });

  function route() {
    return ref.apply(this, arguments);
  }

  return route;
})();