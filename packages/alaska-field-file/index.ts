import { ObjectMap } from 'alaska';
import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';
import * as AdminView from 'alaska-admin-view';
import { FileService } from 'alaska-file';
import FileModel from 'alaska-file/models/File';
import { File } from '.';

const ObjectId = mongoose.Types.ObjectId;

interface PathOptions {
  type: Function;
  default: any;
}

export default class FileField extends Field {
  static fieldName = 'File';
  static plainName = 'mixed';
  static plain = mongoose.Schema.Types.Mixed;

  static viewOptions = ['multi', 'max', (options: AdminView.Field, field: FileField) => {
    if (options.disabled === true) return;
    let service = field._model.service;
    let fileService = service.lookup('alaska-file') as FileService;
    if (fileService) {
      let driver = field.driver || 'default';
      let driverConfig = fileService.drivers[driver];
      if (driverConfig) {
        options.allowed = driverConfig.allowed;
        options.maxSize = driverConfig.maxSize;
        options.driver = driver;
        return;
      }
    }
    // 没有找到 alaska-file Service，无法上传图片
    options.disabled = true;
    return;
  }];

  static defaultOptions = {
    max: 1000,
    cell: 'FileFieldCell',
    view: 'FileFieldView'
  };

  max: number;
  driver: string;

  initSchema() {
    const field = this;
    const schema = this._schema;
    const defaultValue = field.default || {};

    const fileService = field._model.service.lookup('alaska-file') as FileService;
    if (fileService) {
      let driver = field.driver || 'default';
      if (!fileService.drivers.hasOwnProperty(driver)) throw new Error('File storage driver not found!');
    }

    const paths: ObjectMap<PathOptions> = {};

    function addPath(mPath: string, type: Function) {
      const options: PathOptions = { type, default: null };
      if (typeof defaultValue[mPath] !== 'undefined') {
        options.default = defaultValue[mPath];
      }
      paths[mPath] = options;
    }

    addPath('_id', mongoose.SchemaTypes.ObjectId);
    addPath('user', mongoose.SchemaTypes.ObjectId);
    addPath('ext', String);
    addPath('path', String);
    addPath('url', String);
    addPath('name', String);
    addPath('size', Number);

    let fileSchema = new mongoose.Schema(paths);

    function stringToFile(value: string) {
      let matchs = String(value).match(/([a-f0-9]{24})/);
      let id = matchs ? matchs[1] : null;
      return { _id: new ObjectId(id), url: value };
    }

    if (field.multi) {
      schema.add({
        [field.path]: {
          type: [fileSchema],
          set(value: File | string | string[] | File[]) {
            if (typeof value === 'string') {
              return [stringToFile(value)];
            }
            if (Array.isArray(value)) {
              return (value as Array<File | string>).map((img: File | string) => {
                if (typeof img === 'string') {
                  return stringToFile(img);
                }
                return img;
              });
            }
            return value;
          }
        }
      });
    } else {
      schema.add({
        [field.path]: {
          type: fileSchema,
          set(value: File | string | string[] | File[]) {
            if (Array.isArray(value)) {
              value = value[0] || null;
            }
            if (typeof value === 'string') {
              // @ts-ignore
              value = stringToFile(value);
            }
            // @ts-ignore
            if (value && typeof value === 'object' && value._doc) value = value._doc;
            if (!this[field.path]) return value;
            this[field.path].set(value);
            return this[field.path];
          }
        }
      }, '');
    }

    if (fileService) {
      fileSchema.pre('validate', async function (next: Function) {
        // @ts-ignore
        let doc: FileModel = this;
        if (!doc._id || !doc.url || doc.name) {
          next();
          return;
        }
        // 有 id、url，但是没有名字大小等信息，尝试补全信息
        let file = await fileService.getFile(doc._id);
        if (file && file.url === doc.url) {
          doc.set(file.toObject());
        }
        next();
      });
    }

    this.underscoreMethod('data', function () {
      const value = this.get(field.path);
      if (!field.multi) {
        return value && value.url ? value.url : '';
      }
      return (value || []).map((v: File) => (v && v.url ? v.url : '')).filter((v: string) => v);
    });
  }
}
