/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import * as util from '../util';

export default async function loadModels() {
  this.loadModels = util.resolved;
  const service = this;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.loadModels();
  }

  if (this.config('db') === false) return;
  this.debug('loadModels');

  this._models = util.include(this.dir + '/models', true, { alaska, service }) || {};
  //遍历模型
  for (let name in this._models) {
    let Model = this._models[name];
    Model.service = service;
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/models/' + name + '.js';
      if (util.isFile(file)) {
        let ext = util.include(file, false, { alaska, service });
        if (typeof ext.groups !== 'undefined') {
          _.assign(Model.groups, ext.groups);
        }
        if (ext.fields) {
          for (let key in ext.fields) {
            if (Model.fields[key]) {
              _.assign(Model.fields[key], ext.fields[key]);
            } else {
              Model.fields[key] = ext.fields[key];
            }
          }
        }
        if (ext.scopes) {
          if (!Model.scopes) {
            Model.scopes = ext.scopes;
          } else {
            _.forEach(ext.scopes, (fields, key) => {
              if (Model.scopes[key]) {
                Model.scopes[key] += ',' + fields;
              } else {
                Model.scopes[key] = fields;
              }
            });
          }
        }
        if (ext.virtuals) {
          if (!Model.virtuals) {
            Model.virtuals = {};
          }
          for (let path in ext.virtuals) {
            let getter = ext.virtuals.__lookupGetter__(path);
            if (getter) {
              Model.virtuals.__defineGetter__(path, getter);
            }
            let setter = ext.virtuals.__lookupSetter__(path);
            if (setter) {
              Model.virtuals.__defineSetter__(path, setter);
            }
          }
        }
        if (ext.populations) {
          Model.populations = _.defaultsDeep({}, Model.populations, ext.populations);
        }
        if (ext.relationships) {
          Model.relationships = _.defaultsDeep({}, Model.relationships, ext.relationships);
        }
        //扩展模型事件
        ['Init', 'Validate', 'Save', 'Remove'].forEach(Action => {
          let pre = ext['pre' + Action];
          if (pre) {
            Model.pre(Action.toLowerCase(), pre);
          }
          let post = ext['post' + Action];
          if (post) {
            Model.post(Action.toLowerCase(), post);
          }
        });
        for (let key in ext) {
          if (['fields', 'virtuals', 'groups', 'scopes', 'populations', 'relationships'].indexOf(key) > -1 || /^(pre|post)(Init|Validate|Save|Remove)$/.test(key)) {
            continue;
          }
          Model[key] = ext[key];
        }
        if (ext.default) {
          ext.default(Model);
        }
      }
    } //end of 加载扩展配置
    await this.registerModel(Model);
  } //end of 遍历模型

};
