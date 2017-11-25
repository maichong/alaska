// @flow

import { Field } from 'alaska';
import fs from 'fs';
import Path from 'path';
import moment from 'moment';
import mime from 'mime-types';
import mkdirp from 'mkdirp';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export default class ImageField extends Field {
  static plain = mongoose.Schema.Types.Mixed;
  static viewOptions = ['multi', 'allowed'];
  static defaultOptions = {
    cell: 'ImageFieldCell',
    view: 'ImageFieldView',
    dir: 'public/uploads/',
    pathFormat: 'YYYY/MM/DD/',
    prefix: '/uploads/',
    allowed: ['jpg', 'png', 'gif']
  };

  dir: string;
  pathFormat: string;
  prefix: string;
  allowed: string[];

  /**
   * 上传
   * @param {File|string|Buffer} file
   * @param {Field} field
   * @returns {{}}
   */
  static upload(file: Alaska$UploadFile | string | Buffer, field: ImageField): Promise<{
    _id: string,
    ext: string,
    size: number,
    path: string,
    thumbUrl: string,
    url: string,
    name: string
  }> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('File not found'));
        return;
      }
      // $Flow
      let name: string = file.filename || '';
      // $Flow
      let ext: string = (file.ext || '').toLowerCase();
      // $Flow
      let mimeType: string = file.mime || file.mimeType || '';
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
        mimeType = mime.lookup(file);
        name = Path.basename(file);
        filePath = file;
      } else if (file.path) {
        //上传文件
        filePath = file.path;
      } else {
        reject(new Error('Unknown image file'));
        return;
      }

      if (!ext && name) {
        ext = Path.extname(name);
        if (ext) {
          ext = ext.substr(1).toLowerCase();
        }
      }
      if (!ext) {
        ext = mime.extension(mimeType).replace('jpeg', 'jpg');
      }
      if (field.allowed && field.allowed.indexOf(ext) < 0) {
        reject(new Error('Image format error'));
        return;
      }

      function writeFile() {
        // $Flow
        fs.writeFile(local, buffer, (error: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(img);
        });
      }

      function onReadFile(error: Error | null, data: Buffer) {
        if (error) {
          reject(error);
          return;
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

        fs.stat(dir, (e) => {
          if (e) {
            //文件夹不存在
            mkdirp(dir, (err) => {
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
        fs.readFile(file.path, onReadFile);
      } else {
        // $Flow
        onReadFile(null, file);
      }
    });
  }

  initSchema() {
    let field = this;
    let schema: Mongoose$Schema = this._schema;
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

    let imageSchema = new mongoose.Schema(paths);

    if (field.multi) {
      imageSchema = [imageSchema];
    }

    schema.add({
      [field.path]: imageSchema
    }, '');

    this.underscoreMethod('upload', function (file) {
      let record = this;
      return ImageField.upload(file, field).then((img) => {
        record.set(field.path, img);
        return Promise.resolve();
      });
    });

    this.underscoreMethod('data', function () {
      let value = this.get(field.path);
      if (!field.multi) {
        return value && value.url ? value.url : '';
      }
      return (value || []).map((v) => (v && v.url ? v.url : '')).filter((v) => v);
    });
  }
}
