'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');
const _ = require('lodash');

module.exports = function () {
  var ref = _asyncToGenerator(function* () {
    this.loadModels = util.noop;
    this.debug('%s load', this.id);

    for (let service of this._services) {
      yield service.loadModels();
    }

    if (this.config('db') !== false) {
      global.__service = this;
      this._models = util.include(this.dir + '/models') || {};
      //遍历模型
      for (let name in this._models) {
        let Model = this._models[name];
        //加载扩展配置
        for (let dir of this._configDirs) {
          let file = dir + '/models/' + name + '.js';
          if (util.isFile(file)) {
            let ext = require(file);
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
            if (ext['default']) {
              ext['default'](Model);
            }
          }
        } //end of 加载扩展配置
        yield this.registerModel(Model);
      } //end of 遍历模型
    }
  });

  return function loadModels() {
    return ref.apply(this, arguments);
  };
}();