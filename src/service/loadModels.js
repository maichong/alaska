/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');
const _ = require('lodash');

module.exports = async function loadModels() {
  this.loadModels = util.noop;
  this.debug('%s load', this.id);

  for (let service of this._services) {
    await service.loadModels();
  }

  if (this.config('db') !== false) {
    global.__service = this;
    this._models = util.include(this.dir + '/models');
    //遍历模型
    for (let name in this._models) {
      let Model = this._models[name];
      //加载扩展配置
      for (let dir of this._configDirs) {
        let file = dir + '/models/' + name + '.js';
        if (util.isFile(file)) {
          let ext = require(file);
          ['fields', 'groups', 'api'].forEach(key => {
            if (typeof ext[key] !== 'undefined') {
              _.assign(Model[key], ext[key]);
            }
          });
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
          if (ext['default']) {
            ext['default'](Model);
          }
        }
      } //end of 加载扩展配置
      await this.registerModel(Model);
    } //end of 遍历模型
  }
};
