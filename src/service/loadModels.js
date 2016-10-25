/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import * as util from '../util';

function deepCopy(dst, src) {
  dst = dst || {};
  Object.keys(src).forEach((key) => {
    if (typeof dst[key] !== 'object' || Array.isArray(dst[key])) {
      dst[key] = src[key];
    } else {
      dst[key] = _.defaultsDeep({}, src[key], dst[key]);
    }
  });
  return dst;
}

export default async function loadModels() {
  this.loadModels = util.resolved;
  const service = this;

  if (this.config('db') !== false) {
    this._models = util.include(this.dir + '/models', true) || {};
  }
  //设置service属性
  for (let Model of this.modelList) {
    Model.service = service;
  }

  for (let sub of this.serviceList) {
    await sub.loadModels();
  }

  if (this.config('db') === false) return;
  this.debug('loadModels');

  //遍历模型
  for (let Model of this.modelList) {
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/models/' + Model.name + '.js';
      if (util.isFile(file)) {
        let ext = util.include(file, false);
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
        ['Init', 'Validate', 'Save', 'Remove'].forEach((Action) => {
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
          if (['fields', 'groups', 'scopes', 'populations', 'relationships', 'actions', 'methods', 'virtuals'].indexOf(key) === -1 && !/^(pre|post)(Init|Validate|Save|Remove)$/.test(key)) {
            Model[key] = ext[key];
          }
        });
        if (ext.default) {
          ext.default(Model);
        }
      }
    } //end of 加载扩展配置
    await this.registerModel(Model);
  } //end of 遍历模型
};
