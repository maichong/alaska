import { ObjectMap } from 'alaska';
import * as fs from 'fs';
import * as Path from 'path';
import * as util from 'util';
import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as mime from 'mime-types';
import { UploadFile } from 'alaska-middleware-upload';
import * as FSD from 'fsd';
import { Image } from '.';

const stat = util.promisify(fs.stat);
const ObjectId = mongoose.Types.ObjectId;

interface PathOptions {
  type: Function;
  default: any;
}

export default class ImageField extends Field {
  static fieldName = 'Image';
  static plainName = 'mixed';
  static plain = mongoose.Schema.Types.Mixed;

  static viewOptions = ['multi', 'thumbSuffix', 'max', 'allowed'];

  static defaultOptions = {
    max: 1000,
    cell: 'ImageFieldCell',
    view: 'ImageFieldView',
    pathFormat: 'YYYY/MM/DD/',
    thumbSuffix: '',
    allowed: ['jpg', 'png', 'gif'],
    adapter: 'fs'
  };

  max: number;
  pathFormat: string;
  thumbSuffix: string;
  allowed: string[];
  adapter: string;
  fs?: any;
  oss?: any;
  fsd: FSD.fsd;

  init() {
    let service = this._model.service;
    let adapter = this.adapter || service.error(`Missing adapter type!`);
    // @ts-ignore
    let adapterOptions: any = this[adapter] || service.error(`Missing adapter options!`);
    let lib = `fsd-${adapter}`;
    let Adapter = service.main.modules.libraries[lib] || service.error(`Missing adapter library [${lib}]!`);

    // 生成 fsd() 函数
    this.fsd = FSD({ adapter: new Adapter(adapterOptions) });
  }

  async upload(file: UploadFile | Buffer | NodeJS.ReadStream): Promise<Image> {
    // @ts-ignore
    let filePath: string = file.path;
    // @ts-ignore
    let name: string = file.filename || '';
    // @ts-ignore
    let ext: string = (file.ext || '').toLowerCase();
    // @ts-ignore
    let mimeType: string = file.mime || file.mimeType || '';

    if (filePath && !name) {
      name = Path.basename(filePath);
    }
    if (name && !ext) {
      ext = Path.extname(name).toLowerCase();
    }
    if (ext && ext[0] === '.') {
      ext = ext.substr(1);
    }
    if (this.allowed.indexOf(ext) < 0) this._model.service.error('Image type not allowed!');

    if (name && !mimeType) {
      mimeType = mime.lookup(name) || '';
    }

    let size: number = 0;
    let id = new ObjectId();
    let path = '';

    if (this.pathFormat) {
      path += moment().format(this.pathFormat);
    }
    path += `${id.toString()}.${ext}`;

    if (Buffer.isBuffer(file)) {
      size = file.length;
    } else if (filePath) {
      let s = await stat(filePath);
      size = s.size;
    }

    let fsd = this.fsd(path);
    if (fsd.needEnsureDir) {
      let dir = this.fsd(fsd.dir);
      if (!await dir.exists()) {
        await dir.mkdir(true);
      }
    }
    await fsd.write(file);

    let url = await fsd.createUrl();

    let image: Image = {
      _id: id,
      ext,
      size,
      path,
      thumbUrl: url,
      url,
      name
    };

    if (this.thumbSuffix) {
      image.thumbUrl += (this.thumbSuffix || '').replace('EXT', ext);
    }

    return image;
  }

  initSchema() {
    const field = this;
    const schema = this._schema;
    const defaultValue = field.default || {};

    const paths: ObjectMap<PathOptions> = {};

    function addPath(mPath: string, type: Function) {
      const options: PathOptions = { type, default: null };
      if (typeof defaultValue[mPath] !== 'undefined') {
        options.default = defaultValue[mPath];
      }
      paths[mPath] = options;
    }

    addPath('_id', mongoose.SchemaTypes.ObjectId);
    addPath('ext', String);
    addPath('path', String);
    addPath('url', String);
    addPath('thumbUrl', String);
    addPath('name', String);
    addPath('size', Number);

    let options = {
      type: new mongoose.Schema(paths),
      set(value: Image | string) {
        if (typeof value === 'string') return { _id: new ObjectId(), url: value };
        return value;
      }
    };

    schema.add({
      [field.path]: field.multi ? [options] : options,
    }, '');

    this.underscoreMethod('data', function () {
      const value = this.get(field.path);
      if (!field.multi) {
        return value && value.url ? value.url : '';
      }
      return (value || []).map((v: Image) => (v && v.url ? v.url : '')).filter((v: string) => v);
    });
  }
}
