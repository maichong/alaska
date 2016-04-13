/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadMiddlewares() {
  this.loadMiddlewares = util.resolved;

  for (let s of this._services) {
    await s.loadMiddlewares();
  }
  if (this.config('prefix') === false || !this.config('middlewares')) {
    return;
  }
  this.debug('loadMiddlewares');

  const service = this;
  const router = this.router;

  this.config('middlewares', []).forEach(function (item) {
    if (typeof item === 'string') {
      item = {
        name: item
      };
    }
    let name = item.name;
    if (name.startsWith('.')) {
      name = this.dir + name;
    }
    let middleware = require(name);
    let path = item.path;
    if (!path) {
      router.use(path, middleware(item.options));
      return;
    }
    let methods = item.methods || ['GET', 'POST'];
    if (methods === 'all') {
      router.all(path, middleware(item.options));
      return;
    }
    if (typeof methods === 'string') {
      methods = [methods];
    }
    router.register(path, methods, middleware(item.options));
  });

  function load(dir) {
    let file = dir + '/middlewares/index.js';
    if (util.isFile(file)) {
      let middlewares = util.include(file, true, {
        service,
        alaska: service.alaska
      });
      middlewares(router);
    }
  }

  this._configDirs.forEach(dir => load(dir));
  load(this.dir);
};
