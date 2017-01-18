/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-14
 * @author Liang <liang@maichong.it>
 */

'use strict';

const alaska = require('alaska');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const mime = require('mime');
const mkdirp = require('mkdirp');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class ImageField extends alaska.Field {
  initSchema() {
    let field = this;
    let schema = this._schema;
    let defaultValue = field.default || {};

    let paths = {};

    function addPath(path, type) {
      let options = { type };
      if (defaultValue[path] !== undefined) {
        options.default = defaultValue[path];
      }
      paths[path] = options;
    }

    addPath('_id', mongoose.Schema.Types.ObjectId);
    addPath('ext', String);
    addPath('path', String);
    addPath('url', String);
    addPath('thumbUrl', String);
    addPath('name', String);
    addPath('size', Number);

    let imageSchema = new mongoose.Schema(paths);

    if (field.multi) {
      imageSchema = [imageSchema];
    }

    schema.add({
      [field.path]: imageSchema
    });

    if (!field.dir) {
      field.dir = '';
    }

    if (!field.pathFormat) {
      field.pathFormat = '';
    }

    if (!field.prefix) {
      field.prefix = '';
    }

    if (!field.allowed) {
      field.allowed = ['jpg', 'png', 'gif'];
    }

    this.underscoreMethod('upload', function (file) {
      let record = this;
      return ImageField.upload(file, field).then(function (img) {
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

ImageField.views = {
  cell: {
    name: 'ImageFieldCell',
    path: __dirname + '/lib/cell.js'
  },
  view: {
    name: 'ImageFieldView',
    path: __dirname + '/lib/view.js'
  }
};

ImageField.plain = mongoose.Schema.Types.Mixed;

ImageField.viewOptions = ['multi', 'allowed'];

/**
 * 上传
 * @param {File|string|Buffer} file
 * @param {Field} field
 * @returns {{}}
 */
ImageField.upload = function (file, field) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      return reject(new Error('File not found'));
    }
    let name = file.filename || '';
    let ext = (file.ext || '').toLowerCase();
    let mimeType = file.mime || file.mimeType;
    let filePath;
    let buffer;
    let local = field.dir;
    let dir = field.dir;
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
      mimeType = mime.lookup(file);
      name = path.basename(file);
      filePath = file;
    } else if (file.path) {
      //上传文件
      filePath = file.path;
    } else {
      return reject(new Error('Unknown image file'));
    }

    if (!ext && name) {
      ext = path.extname(name);
      if (ext) {
        ext = ext.substr(1).toLowerCase();
      }
    }
    if (!ext) {
      ext = mime.extension(mimeType).replace('jpeg', 'jpg');
    }
    if (field.allowed.indexOf(ext) < 0) {
      return reject(new Error('Image format error'));
    }

    if (filePath) {
      fs.readFile(file.path, onReadFile);
    } else {
      onReadFile(null, file);
    }


    function onReadFile(error, data) {
      if (error) {
        return reject(error);
      }
      buffer = data;
      img.ext = ext;
      img.size = data.length;
      img.name = name;

      if (field.pathFormat) {
        img.path += moment().format(field.pathFormat);
      }
      dir += img.path;
      img.path += id.toString() + '.' + img.ext;
      local += img.path;
      url += img.path;
      img.url = url;
      img.thumbUrl = url;

      fs.stat(dir, function (e) {
        if (e) {
          //文件夹不存在
          mkdirp(dir, function (error) {
            if (error) {
              return reject(error);
            }
            writeFile();
          });
        } else {
          writeFile();
        }
      });
    }

    function writeFile() {
      fs.writeFile(local, buffer, function (error) {
        if (error) {
          return reject(error);
        }
        resolve(img);
      });
    }
  });
};

module.exports = ImageField;
