/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import * as util from '../util';

export default async function loadModels() {
  this.loadModels = util.noop;
  const service = this;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.loadModels();
  }

  if (this.config('db') !== false) {
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
            if (key === 'fields' || key === 'groups' || /^(pre|post)(Init|Validate|Save|Remove)$/.test(key)) {
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
  }
};
