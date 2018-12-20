import * as _ from 'lodash';
import * as Path from 'path';
import * as fs from 'fs';
import { Loader, ObjectMap } from 'alaska';
import { ModulesMetadata, ServiceMetadata } from 'alaska-modules';
import { ModuleTree, Module } from 'alaska-modules/tree';
import debug from './debug';
import { } from 'alaska-update';

export default class UpdateLoader extends Loader {
  constructor(metadata: ModulesMetadata, extConfig: Object) {
    super(metadata, extConfig);
    metadata.post('buildService', async (res: any, meta: ServiceMetadata, tree: ModuleTree) => {
      debug(`${meta.id} build updates`);
      let updates: ObjectMap<string> = {};
      meta.updates = updates;
      let updatesDir = Path.join(meta.path, 'updates');
      if (!fs.existsSync(updatesDir)) return;
      let names = fs.readdirSync(updatesDir);
      for (let name of names) {
        if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts')) continue;
        name = name.replace(/\.[tj]sx?$/, '');
        updates[name] = Path.join(updatesDir, name);
      }
      let moduleTreeUpdates = new ModuleTree();
      // @ts-ignore services 一定为 ModuleTree
      tree.services[meta.id].updates = moduleTreeUpdates;
      _.forEach(meta.updates, (path, name) => {
        moduleTreeUpdates[name] = new Module(path, 'ESModule');
      });
    });
  }
}
