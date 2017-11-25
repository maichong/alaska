'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ObjectId = _mongoose2.default.Types.ObjectId;

class ImageField extends _alaska.Field {

  /**
   * 上传
   * @param {File|string|Buffer} file
   * @param {Field} field
   * @returns {{}}
   */
  static upload(file, field) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('File not found'));
        return;
      }
      // $Flow
      let name = file.filename || '';
      // $Flow
      let ext = (file.ext || '').toLowerCase();
      // $Flow
      let mimeType = file.mime || file.mimeType || '';
      let filePath;
      let buffer;
      let { dir } = field;
      let local = field.dir;
      let url = field.prefix;
      let id = new ObjectId();
      let img = {
        _id: id,
        ext: '',
        size: 0,
        path: '',
        thumbUrl: '',
        url: '',
        name: ''
      };

      if (Buffer.isBuffer(file)) {
        //文件数据
        if (!mimeType) {
          mimeType = 'image/jpeg';
        }
      } else if (typeof file === 'string') {
        //文件路径
        mimeType = _mimeTypes2.default.lookup(file);
        name = _path2.default.basename(file);
        filePath = file;
      } else if (file.path) {
        //上传文件
        filePath = file.path;
      } else {
        reject(new Error('Unknown image file'));
        return;
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
      if (field.allowed && field.allowed.indexOf(ext) < 0) {
        reject(new Error('Image format error'));
        return;
      }

      function writeFile() {
        // $Flow
        _fs2.default.writeFile(local, buffer, error => {
          if (error) {
            reject(error);
            return;
          }
          resolve(img);
        });
      }

      function onReadFile(error, data) {
        if (error) {
          reject(error);
          return;
        }
        buffer = data;
        img.ext = ext;
        img.size = data.length;
        img.name = name;

        if (field.pathFormat) {
          img.path += (0, _moment2.default)().format(field.pathFormat);
        }
        dir += img.path;
        img.path += id.toString() + '.' + img.ext;
        local += img.path;
        url += img.path;
        img.url = url;
        img.thumbUrl = url;

        _fs2.default.stat(dir, e => {
          if (e) {
            //文件夹不存在
            (0, _mkdirp2.default)(dir, err => {
              if (err) {
                reject(err);
                return;
              }
              writeFile();
            });
          } else {
            writeFile();
          }
        });
      }

      if (filePath) {
        // $Flow
        _fs2.default.readFile(file.path, onReadFile);
      } else {
        // $Flow
        onReadFile(null, file);
      }
    });
  }

  initSchema() {
    let field = this;
    let schema = this._schema;
    let defaultValue = field.default || {};

    let paths = {};

    function addPath(mPath, type) {
      let options = { type, default: null };
      if (defaultValue[mPath] !== undefined) {
        options.default = defaultValue[mPath];
      }
      paths[mPath] = options;
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

    this.underscoreMethod('upload', function (file) {
      let record = this;
      return ImageField.upload(file, field).then(img => {
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
  }
}
exports.default = ImageField;
ImageField.plain = _mongoose2.default.Schema.Types.Mixed;
ImageField.viewOptions = ['multi', 'allowed'];
ImageField.defaultOptions = {
  cell: 'ImageFieldCell',
  view: 'ImageFieldView',
  dir: 'public/uploads/',
  pathFormat: 'YYYY/MM/DD/',
  prefix: '/uploads/',
  allowed: ['jpg', 'png', 'gif']
};