import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import * as isDirectory from 'is-directory';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-sled';

export default class ModelLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('loadService', async (res: any, meta: ServiceMetadata) => {
      debug(`${meta.id} load sleds`);
      let sleds: ObjectMap<string> = {};
      meta.sleds = sleds;
      let sledsDir = Path.join(meta.path, 'sleds');
      if (!fs.existsSync(sledsDir)) return;
      let names = fs.readdirSync(sledsDir);
      for (let name of names) {
        if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts')) continue;
        name = name.replace(/\.[tj]sx?$/, '');
        sleds[name] = Path.join(sledsDir, name);
      }
    });

    metadata.post('loadServicePlugin', async (res: any, service: ServiceMetadata, plugin: PluginMetadata) => {
      if (plugin.dismiss) return;
      let sledsDir = Path.join(plugin.path, 'sleds');
      if (!isDirectory.sync(sledsDir)) return;
      let sleds: ObjectMap<string> = {};
      plugin.sleds = sleds;
      let names = fs.readdirSync(sledsDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          sleds[name] = Path.join(sledsDir, name);
        }
      }
    });

    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(`${meta.id} build sleds`);
      let sleds = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].sleds = sleds;
      _.forEach(meta.sleds, (path, name) => {
        sleds[name] = new Module(path, 'ESModule');
      });
    });

    metadata.post('buildPlugin', async (res: any, service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) => {
      if (!pluginMeta.sleds) return;
      let sleds = new ModuleTree();
      plugin.sleds = sleds;
      _.forEach(pluginMeta.sleds, (path, name) => {
        sleds[name] = new Module(path, 'ESModule');
      });
    });
  }
}
