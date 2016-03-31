'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-02-28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    this.loadModels = util.noop;
    const service = this;
    const alaska = this.alaska;

    for (let s of this._services) {
      yield s.loadModels();
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
              _lodash2.default.assign(Model.groups, ext.groups);
            }
            if (ext.fields) {
              for (let key in ext.fields) {
                if (Model.fields[key]) {
                  _lodash2.default.assign(Model.fields[key], ext.fields[key]);
                } else {
                  Model.fields[key] = ext.fields[key];
                }
              }
            }
            //扩展模型事件
            ['Init', 'Validate', 'Save', 'Remove'].forEach(function (Action) {
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
        yield this.registerModel(Model);
      } //end of 遍历模型
    }
  });

  function loadModels() {
    return ref.apply(this, arguments);
  }

  return loadModels;
})();