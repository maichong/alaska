// @flow

import { Field } from 'alaska';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import mime from 'mime';
import mongoose from 'mongoose';
import ALI from 'aliyun-sdk';

const ObjectId = mongoose.Types.ObjectId;

export default class AliyunImageField extends Field {
  static plain = mongoose.Schema.Types.Mixed;
  static viewOptions = ['multi', 'allowed', 'cell', 'view'];

  oss: ALI.OSS;
  dir: string;
  pathFormat: string;
  prefix: string;
  thumbSuffix: string;
  allowed: string[];

  /**
   * 上传
   * @param {File|string|Buffer} file
   * @param {Field} field
   * @returns {{}}
   */
  static upload(file: any, field: any) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('File not found'));
        return;
      }
      let name = file.filename || '';
      let ext = (file.ext || '').toLowerCase();
      let mimeType = file.mime || file.mimeType;
      let filePath;

      function onReadFile(error, data) {
        if (error) {
          reject(error);
          return;
        }

        let url = field.prefix;
        let id = new ObjectId();
        let img = {
          _id: id,
          ext,
          size: data.length,
          path: '',
          thumbUrl: '',
          url: '',
          name
        };
        if (field.pathFormat) {
          img.path += moment().format(field.pathFormat);
        }
        img.path += id.toString() + '.' + img.ext;
        url += img.path;
        img.url = url;
        img.thumbUrl = url;
        if (field.thumbSuffix) {
          img.thumbUrl += (field.thumbSuffix || '').replace('EXT', img.ext);
        }

        field.oss.putObject({
          Bucket: field.Bucket,
          Key: img.path,
          Body: data,
          AccessControlAllowOrigin: field.AccessControlAllowOrigin,
          ContentType: mimeType,
          CacheControl: field.CacheControl || 'no-cache',
          ContentDisposition: field.ContentDisposition || '',
          ServerSideEncryption: field.ServerSideEncryption,
          Expires: field.Expires
        }, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(img);
        });
      }

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
        reject(new Error('Unknown image file'));
        return;
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
        reject(new Error('Image format error'));
        return;
      }

      if (filePath) {
        fs.readFile(file.path, onReadFile);
      } else {
        onReadFile(null, file);
      }
    });
  }

  initSchema() {
    let field = this;
    let schema = this._schema;
    ['Bucket', 'oss'].forEach((key) => {
      if (!field[key]) {
        throw new Error(`Aliyun image field config "'${key}'" is required in '${field._model.name}'.'${field.path}`);
      }
    });

    if (!field.oss.putObject) {
      field.oss = new ALI.OSS(field.oss);
    }

    let defaultValue = field.default || {};

    let paths = {};

    function addPath(p: string, type: any) {
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

    let imageSchema = new mongoose.Schema(paths);

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
      return AliyunImageField.upload(file, field).then((img) => {
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

    if (!field.cell) {
      field.cell = 'ImageFieldCell';
    }
    if (!field.view) {
      field.view = 'ImageFieldView';
    }
  }
}
