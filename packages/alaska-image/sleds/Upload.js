'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Image = require('../models/Image');

var _Image2 = _interopRequireDefault(_Image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const client = _akita2.default.resolve('alaska-image');

class Upload extends _alaska.Sled {
  async exec(params) {
    let {
      file, data, url, user, headers, filename, ext, mimeType, returnImage
    } = params;

    if (!file && data) {
      if (Buffer.isBuffer(data)) {
        //buffer
        file = data;
      } else if (typeof data === 'string') {
        //base64
        file = Buffer.from(data, 'base64');
      }
    }

    if (!file && url) {
      let res = await client.get(url, { headers }).response();
      file = await res.buffer();
      if (!filename) {
        filename = _path2.default.basename(url);
      }
      if (!mimeType) {
        mimeType = _mimeTypes2.default.lookup(url);
      }
    }
    if (!file) _alaska2.default.error('No file found');
    if (filename) {
      // $Flow file 类型不固定
      file.filename = filename;
    }
    if (ext) {
      // $Flow file 类型不固定
      file.ext = ext;
    }
    if (mimeType) {
      // $Flow file 类型不固定
      file.mimeType = mimeType;
    }
    let record = new _Image2.default({ user });
    await record._.pic.upload(file);
    if (record.pic._id) {
      record._id = record.pic._id;
    }
    await record.save();
    return returnImage ? record.pic : record;
  }
}
exports.default = Upload;