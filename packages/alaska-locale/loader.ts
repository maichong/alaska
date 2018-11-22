import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import * as isDirectory from 'is-directory';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-locale';

export default class ModelLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('loadService', async (res: any, meta: ServiceMetadata) => {
      debug(meta.id + ' load locales');
      let locales: ObjectMap<string> = {};
      meta.locales = locales;
      let localesDir = Path.join(meta.path, 'locales');
      if (!fs.existsSync(localesDir)) return;
      let names = fs.readdirSync(localesDir);
      for (let name of names) {
        if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts')) continue;
        name = name.replace(/\.[tj]sx?$/, '');
        locales[name] = Path.join(localesDir, name);
      }
    });

    metadata.post('loadServicePlugin', async (res: any, service: ServiceMetadata, plugin: PluginMetadata) => {
      if (plugin.dismiss) return;
      let localesDir = Path.join(plugin.path, 'locales');
      if (!isDirectory.sync(localesDir)) return;
      let locales: ObjectMap<string> = {};
      plugin.locales = locales;
      let names = fs.readdirSync(localesDir);
      for (let name of names) {
        if (name[0] === '.') continue;
        if (/\.[tj]sx?$/.test(name)) {
          // .ts .js .tsx .jsx 文件
          name = name.replace(/\.[tj]sx?$/, '');
          locales[name] = Path.join(localesDir, name);
        }
      }
    });

    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(meta.id + ' build locales');
      let allowedLocales = metadata.config.locales || [];
      let locales = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].locales = locales;
      _.forEach(meta.locales, (path, name) => {
        if (allowedLocales.indexOf(name) === -1) return;
        locales[name] = new Module(path, 'ESModule');
      });
    });

    metadata.post('buildPlugin', async (res: any, service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) => {
      if (!pluginMeta.locales) return;
      let locales = new ModuleTree();
      plugin.locales = locales;
      _.forEach(pluginMeta.locales, (path, name) => {
        locales[name] = new Module(path, 'ESModule');
      });
    });
  }
}
