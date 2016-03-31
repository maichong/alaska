/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default function loadMiddlewares() {
  this.loadMiddlewares = util.noop;
  let router = this.router;
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
};
