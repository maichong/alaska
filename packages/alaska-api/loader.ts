import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import * as isDirectory from 'is-directory';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-api';

export default class ApiLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('loadService', async (res: any, meta: ServiceMetadata) => {
      debug(meta.id + ' load api');
      let api: ObjectMap<string> = {};
      meta.api = api;
      let apiDir = Path.join(meta.path, 'api');
      if (!fs.existsSync(apiDir)) return;
      let names = fs.readdirSync(apiDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          api[name] = Path.join(apiDir, name);
        }
      }
    });

    metadata.post('loadServicePlugin', async (res: any, service: ServiceMetadata, plugin: PluginMetadata) => {
      if (plugin.dismiss) return;
      let apiDir = Path.join(plugin.path, 'api');
      if (!isDirectory.sync(apiDir)) return;
      let api: ObjectMap<string> = {};
      plugin.api = api;
      let names = fs.readdirSync(apiDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          api[name] = Path.join(apiDir, name);
        } else if (isDirectory.sync(Path.join(apiDir, name))) {
          // 目录
          api[name] = Path.join(apiDir, name, 'index');
        }
      }
    });

    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(meta.id + ' build api');
      let api = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].api = api;
      _.forEach(meta.api, (path, name) => {
        api[name] = new Module(path, 'CommonJs');
      });
    });

    metadata.post('buildPlugin', async (res: any, service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) => {
      if (!pluginMeta.api) return;
      let api = new ModuleTree();
      plugin.api = api;
      _.forEach(pluginMeta.api, (path, name) => {
        api[name] = new Module(path, 'CommonJs');
      });
    });
  }
}
