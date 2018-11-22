import * as _ from 'lodash';
import * as collie from 'collie';
import * as Path from 'path';
import * as isDirectory from 'is-directory';
import { Loader } from 'alaska';
import { ModulesMetadata, MiddlewareMetadata } from 'alaska-modules';
import debug from './debug';
import { ModuleTree, Module } from 'alaska-modules/tree';
import { } from 'alaska-http';

export default class HttpLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);

    metadata.middlewares = {};

    // 加载中间件
    collie(metadata, 'loadMiddlewares', async () => {
      debug('loadMiddlewares');
      let { middlewares } = metadata.config;
      if (!middlewares) return;
      for (let id of Object.keys(middlewares)) {
        let meta: MiddlewareMetadata = {
          path: '',
          dismiss: false
        };
        if (id[0] === '.') {
          // 相对路径
          meta.path = Path.join(metadata.dir, 'config', id);
          metadata.middlewares[id] = meta;
          continue;
        }
        // 外部库
        _.find(metadata.modulesDirs, (mDir) => {
          let path = Path.join(process.cwd(), mDir, id);
          if (!isDirectory.sync(path)) return false;
          // 找到了扩展目录
          meta.path = path;
          return true;
        });
        if (!meta.path) throw new Error(`Middleware ${id} not found!`);
        metadata.middlewares[id] = meta;
      }
    });

    metadata.post('loadPlugins', async () => {
      await metadata.loadMiddlewares();
    });

    metadata.post('build', async (res: ModuleTree) => {
      let middlewares = new ModuleTree();
      res.middlewares = middlewares;

      for (let id of Object.keys(metadata.middlewares)) {
        let meta: MiddlewareMetadata = metadata.middlewares[id];
        if (meta.dismiss) continue;
        middlewares[id] = new Module(meta.path, 'Auto');
      }
    });
  }
}
