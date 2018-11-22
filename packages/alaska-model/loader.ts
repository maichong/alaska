import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import * as isDirectory from 'is-directory';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-model';

export default class ModelLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('loadService', async (res: any, meta: ServiceMetadata) => {
      debug(meta.id + ' load models');
      let models: ObjectMap<string> = {};
      meta.models = models;
      let modelsDir = Path.join(meta.path, 'models');
      if (!fs.existsSync(modelsDir)) return;
      let names = fs.readdirSync(modelsDir);
      for (let name of names) {
        if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts')) continue;
        name = name.replace(/\.[tj]sx?$/, '');
        models[name] = Path.join(modelsDir, name);
      }
    });

    metadata.post('loadServicePlugin', async (res: any, service: ServiceMetadata, plugin: PluginMetadata) => {
      if (plugin.dismiss) return;
      let modelsDir = Path.join(plugin.path, 'models');
      if (!isDirectory.sync(modelsDir)) return;
      let models: ObjectMap<string> = {};
      plugin.models = models;
      let names = fs.readdirSync(modelsDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          models[name] = Path.join(modelsDir, name);
        }
      }
    });

    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(meta.id + ' build models');
      let models = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].models = models;
      _.forEach(meta.models, (path, name) => {
        models[name] = new Module(path, 'ESModule');
      });
    });

    metadata.post('buildPlugin', async (res: any, service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) => {
      if (!pluginMeta.models) return;
      let models = new ModuleTree();
      plugin.models = models;
      _.forEach(pluginMeta.models, (path, name) => {
        models[name] = new Module(path, 'ESModule');
      });
    });
  }
}
