'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _aliOss = require('ali-oss');

var _aliOss2 = _interopRequireDefault(_aliOss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Types.ObjectId;

class AliyunImageField extends _alaska.Field {

  /**
   * 上传
   * @param {File|string|Buffer} file
   * @param {Field} field
   * @returns {{}}
   */
  static async upload(file, field) {
    if (!file) {
      throw new Error('File not found');
    }
    let name = file.filename || '';
    let ext = (file.ext || '').toLowerCase();
    let mimeType = file.mime || file.mimeType;
    let filePath;
    let size = 0;
    let data = null;

    if (Buffer.isBuffer(file)) {
      //文件数据
      if (!mimeType) {
        mimeType = 'image/jpeg';
      }
      data = file;
      size = file.length;
    } else if (typeof file === 'string') {
      //文件路径
      mimeType = _mimeTypes2.default.lookup(file);
      name = _path2.default.basename(file);
      filePath = file;
    } else if (file.path) {
      //上传文件
      filePath = file.path;
    } else {
      throw new Error('Unknown image file');
    }

    if (filePath) {
      let stat = await _fs2.default.stat(file.path);
      size = stat.size;
      data = _fs2.default.createReadStream(filePath);
    }

    if (!ext && name) {
      ext = _path2.default.extname(name);
      if (ext) {
        ext = ext.substr(1).toLowerCase();
      }
    }
    if (!ext) {
      ext = _mimeTypes2.default.extension(mimeType).replace('jpeg', 'jpg');
    }
    if (field.allowed.indexOf(ext) < 0) {
      throw new Error('Image format error');
    }

    let url = field.prefix;
    let id = new ObjectId();
    let img = {
      _id: id,
      ext,
      size,
      path: '',
      thumbUrl: '',
      url: '',
      name
    };
    if (field.pathFormat) {
      img.path += (0, _moment2.default)().format(field.pathFormat);
    }
    img.path += id.toString() + '.' + img.ext;
    url += img.path;
    img.url = url;
    img.thumbUrl = url;
    if (field.thumbSuffix) {
      img.thumbUrl += (field.thumbSuffix || '').replace('EXT', img.ext);
    }

    await (0, _co2.default)(field._oss.put(img.path, data));

    return img;
  }

  initSchema() {
    let field = this;
    let schema = this._schema;
    if (!field.oss) {
      throw new Error(`Aliyun image field config "oss" is required in '${field._model.modelName}'.'${field.path}`);
    }

    field._oss = (0, _aliOss2.default)(field.oss);

    let defaultValue = field.default || {};

    let paths = {};

    function addPath(p, type) {
      let options = { type, default: '' };
      if (defaultValue[p] !== undefined) {
        options.default = defaultValue[p];
      }
      paths[p] = options;
    }

    addPath('_id', String);
    addPath('ext', String);
    addPath('path', String);
    addPath('url', String);
    addPath('thumbUrl', String);
    addPath('name', String);
    addPath('size', Number);

    let imageSchema = new _mongoose2.default.Schema(paths);

    if (field.multi) {
      imageSchema = [imageSchema];
    }

    schema.add({
      [field.path]: imageSchema
    }, '');

    if (!field.dir) {
      field.dir = '';
    }

    if (!field.pathFormat) {
      field.pathFormat = '';
    }

    if (!field.prefix) {
      field.prefix = '';
    }

    if (!field.thumbSuffix && field.thumbSuffix !== false) {
      field.thumbSuffix = '@2o_200w_1l_90Q.EXT';
    }

    if (!field.allowed) {
      field.allowed = ['jpg', 'png', 'gif'];
    }

    this.underscoreMethod('upload', function (file) {
      let record = this;
      return AliyunImageField.upload(file, field).then(img => {
        record.set(field.path, img);
        return Promise.resolve();
      });
    });

    this.underscoreMethod('data', function () {
      let value = this.get(field.path);
      if (!field.multi) {
        return value && value.url ? value.url : '';
      }
      return (value || []).map(v => v && v.url ? v.url : '').filter(v => v);
    });

    if (!field.cell) {
      field.cell = 'ImageFieldCell';
    }
    if (!field.view) {
      field.view = 'ImageFieldView';
    }
  }
}
exports.default = AliyunImageField;
AliyunImageField.plain = _mongoose2.default.Schema.Types.Mixed;
AliyunImageField.viewOptions = ['multi', 'allowed', 'cell', 'view'];