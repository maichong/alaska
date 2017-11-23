// @flow

import _ from 'lodash';
import * as utils from '../utils';

export default async function loadModels() {
  this.loadModels = utils.resolved;

  let serviceModules = this.alaska.modules.services[this.id];

  for (let sub of this.serviceList) {
    await sub.loadModels();
  }

  if (this.getConfig('db') === false) return;
  this.debug('loadModels');

  //遍历模型
  for (let name in this.models) { // eslint-disable-line no-restricted-syntax guard-for-in
    let Model = this.models[name];
    //加载扩展配置
    _.forEach(serviceModules.plugins, (plugin) => {
      if (!plugin.models || !plugin.models[name]) return;
      let ext = plugin.models[name];
      if (ext.virtuals) {
        if (!Model.virtuals) {
          Model.virtuals = ext.virtuals;
        } else {
          Object.keys(ext.virtuals).forEach((path) => {
            let getter = ext.virtuals.__lookupGetter__(path);
            let setter = ext.virtuals.__lookupSetter__(path);
            Object.defineProperty(Model.virtuals, path, {
              get: getter,
              set: setter,
              enumerable: true
            });
          });
        }
      }
      if (ext.methods) {
        Object.assign(Model.prototype, ext.methods);
      }

      ['fields', 'groups', 'populations', 'relationships', 'actions'].forEach((key) => {
        if (ext[key]) {
          Model[key] = utils.deepClone(Model[key], ext[key]);
        }
      });

      if (ext.scopes) {
        if (!Model.scopes) {
          Model.scopes = ext.scopes;
        } else {
          _.forEach(ext.scopes, (fields, key) => {
            if (Model.scopes[key]) {
              Model.scopes[key] += ' ' + fields;
            } else {
              Model.scopes[key] = fields;
            }
          });
        }
      }
      //扩展模型事件
      ['Register', 'Init', 'Validate', 'Save', 'Remove'].forEach((Action) => {
        let pre = ext['pre' + Action];
        if (pre) {
          Model.pre(Action.toLowerCase(), pre);
        }
        let post = ext['post' + Action];
        if (post) {
          Model.post(Action.toLowerCase(), post);
        }
      });
      Object.keys(ext).forEach((key) => {
        if (
          [
            'fields',
            'groups',
            'scopes',
            'populations',
            'relationships',
            'actions',
            'methods',
            'virtuals'
          ].indexOf(key) === -1
          && !/^(pre|post)(Init|Validate|Save|Remove)$/.test(key)
        ) {
          Model[key] = ext[key];
        }
      });
      if (ext.default) {
        ext.default(Model);
      }
    });
    await this.registerModel(name, Model);
  }
}
