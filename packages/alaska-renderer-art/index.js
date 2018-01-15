'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _artTemplate = require('art-template');

var _artTemplate2 = _interopRequireDefault(_artTemplate);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SwigRenderer extends _alaska.Renderer {
  constructor(service, options) {
    options = _lodash2.default.assign({
      loader: filename => {
        // $Flow
        let map = this.getFileMap();
        filename = (0, _slash2.default)(filename);
        let file = map[filename];
        if (!file) {
          file = map[filename + (options.extname || '.art')];
        }
        if (!file) {
          service.panic(`Template file ${service.id}:${filename} is not exists!`);
        }
        return _fs2.default.readFileSync(file, 'utf8');
      },
      resolveFilename: (filename, opt) => {
        if (filename === opt.filename) return filename;
        return _path2.default.join(opt.filename, '..', filename);
      }
    }, options);
    super(service, options);
  }

  /**
   * 渲染模板文件
   * @param {string} pathName 模板文件路径
   * @param {Object} locals   模板值
   * @returns {Promise<string>}
   */
  renderFile(pathName, locals) {
    try {
      let html = _artTemplate2.default.compile(_lodash2.default.assign({ filename: pathName }, this.options))(locals);
      return Promise.resolve(html);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 渲染模板
   * @param {string} template 模板代码
   * @param {Object} locals   模板值
   * @returns {string}
   */
  render(template, locals) {
    return _artTemplate2.default.render(template, { locals }, _lodash2.default.assign({}, this.options));
  }
}
exports.default = SwigRenderer;