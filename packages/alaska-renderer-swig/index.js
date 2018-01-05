'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _swig = require('swig');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//const Swig = swig.Swig;

// $Flow
class SwigRenderer extends _alaska.Renderer {

  constructor(service, options) {
    super(service, options);

    let me = this;
    let swigOptions = {};
    swigOptions.loader = {
      resolve(to, from) {
        if (to[0] === '/' || !from) {
          return to;
        }
        let map = me.getFileMap();
        if (map[from]) {
          return _path2.default.join(from, '..', to);
        }
        return _path2.default.join(from, to);
      },
      load(identifier, cb) {
        identifier = (0, _slash2.default)(identifier);
        let map = me.getFileMap();
        let file = map[identifier];
        if (!file) {
          file = map[identifier + '.swig'];
        }
        if (!file) {
          me.service.panic(`Template file ${service.id}:${identifier} is not exists!`);
        }
        if (!cb) {
          return _fs2.default.readFileSync(file, 'utf8');
        }
        return _fs2.default.readFile(file, 'utf8', cb);
      }
    };

    this.swig = new _swig.Swig(Object.assign({}, this.options, swigOptions));
  }

  /**
   * 渲染模板文件
   * @param {string} pathName 模板文件路径
   * @param {Object} locals   模板值
   * @returns {Promise<string>}
   */
  renderFile(pathName, locals) {
    return new Promise((resolve, reject) => {
      this.swig.renderFile(pathName, locals, (error, output) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }

  /**
   * 渲染模板
   * @param {string} template 模板代码
   * @param {Object} locals   模板值
   * @returns {string}
   */
  render(template, locals) {
    return this.swig.render(template, { locals });
  }
}
exports.default = SwigRenderer;

/* eslint import/no-extraneous-dependencies:0 */
/* eslint import/no-unresolved:0 */
/* eslint import/extensions:0 */