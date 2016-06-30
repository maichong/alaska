/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import * as util from '../util';

function deepCopy(dst, src) {
  dst = dst || {};
  for (let key in src) {
    if (typeof dst[key] !== 'object' || Array.isArray(dst[key])) {
      dst[key] = src[key];
    } else {
      dst[key] = _.defaultsDeep({}, src[key], dst[key]);
    }
  }
  return dst;
}

export default async function loadModels() {
  this.loadModels = util.resolved;
  const service = this;
  const alaska = this.alaska;

  if (this.config('db') !== false) {
    this._models = util.include(this.dir + '/models', true, { alaska, service }) || {};
  }

  for (let s of this._services) {
    await s.loadModels();
  }

  if (this.config('db') === false) return;
  this.debug('loadModels');

  //遍历模型
  for (let name in this._models) {
    let Model = this._models[name];
    Model.service = service;
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/models/' + name + '.js';
      if (util.isFile(file)) {
        let ext = util.include(file, false, { alaska, service });
        if (ext.virtuals) {
          if (!Model.virtuals) {
            Model.virtuals = ext.virtuals;
          } else {
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
        }
        if (ext.methods) {
          _.assign(Model.prototype, ext.methods);
        }

        ['fields', 'groups', 'populations', 'relationships', 'actions'].forEach(key => {
          if (ext[key]) {
            Model[key] = deepCopy(Model[key], ext[key]);
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
          if (['fields', 'groups', 'scopes', 'populations', 'relationships', 'actions', 'methods', 'virtuals'].indexOf(key) > -1 || /^(pre|post)(Init|Validate|Save|Remove)$/.test(key)) {
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
