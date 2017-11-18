// @flow

import * as utils from '../utils';

export default async function loadMiddlewares() {
  this.loadMiddlewares = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadMiddlewares();
  }
  if (this.config('prefix') === false || !this.config('middlewares')) return;

  this.debug('loadMiddlewares');

  const { router } = this;

  this.config('middlewares', []).forEach((item: Alaska$Config$middleware) => {
    let { id, path } = item;
    if (id.startsWith('.')) {
      id = this.dir + id;
    }
    // $Flow
    let middleware = require(id);
    if (!path) {
      router.use(middleware(item.options));
      return;
    }
    if (item.methods) {
      router.register(path, item.methods, middleware(item.options));
    } else {
      router.all(path, middleware(item.options));
    }
  });

  function load(dir) {
    let file = dir + '/middlewares/index.js';
    if (utils.isFile(file)) {
      // $Flow
      require(file).default(router);
    }
  }

  this._configDirs.forEach((dir) => load(dir));
  load(this.dir);
}
