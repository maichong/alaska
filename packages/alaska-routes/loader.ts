import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import * as isDirectory from 'is-directory';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-routes';

export default class RoutesLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('loadService', async (res: any, meta: ServiceMetadata) => {
      debug(`${meta.id} load routes`);
      let routes: ObjectMap<string> = {};
      meta.routes = routes;
      let routesDir = Path.join(meta.path, 'routes');
      if (!fs.existsSync(routesDir)) return;
      let names = fs.readdirSync(routesDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          routes[name] = Path.join(routesDir, name);
        } else if (isDirectory.sync(Path.join(routesDir, name))) {
          // 目录
          routes[name] = Path.join(routesDir, name, 'index');
        }
      }
    });

    metadata.post('loadServicePlugin', async (res: any, service: ServiceMetadata, plugin: PluginMetadata) => {
      if (plugin.dismiss) return;
      let routesDir = Path.join(plugin.path, 'routes');
      if (!isDirectory.sync(routesDir)) return;
      let routes: ObjectMap<string> = {};
      plugin.routes = routes;
      let names = fs.readdirSync(routesDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          routes[name] = Path.join(routesDir, name);
        } else if (isDirectory.sync(Path.join(routesDir, name))) {
          // 目录
          routes[name] = Path.join(routesDir, name, 'index');
        }
      }
    });

    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(`${meta.id} build routes`);
      let routes = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].routes = routes;
      _.forEach(meta.routes, (path, name) => {
        routes[name] = new Module(path, 'ESModule');
      });
    });

    metadata.post('buildPlugin', async (res: any, service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) => {
      if (!pluginMeta.routes) return;
      let routes = new ModuleTree();
      plugin.routes = routes;
      _.forEach(pluginMeta.routes, (path, name) => {
        routes[name] = new Module(path, 'ESModule');
      });
    });
  }
}
