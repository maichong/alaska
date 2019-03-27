import { ObjectMap } from 'alaska';
import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';
import { Image } from '.';
import * as AdminView from 'alaska-admin-view';
import { ImageService } from 'alaska-image';

const ObjectId = mongoose.Types.ObjectId;

interface PathOptions {
  type: Function;
  default: any;
}

export default class ImageField extends Field {
  static fieldName = 'Image';
  static plainName = 'mixed';
  static plain = mongoose.Schema.Types.Mixed;

  static viewOptions = ['multi', 'max', (options: AdminView.Field, field: ImageField) => {
    if (options.disabled === true) return;
    let main = field._model.service.main;
    let imageService = main.allServices.get('alaska-image') as ImageService;
    if (imageService) {
      let driver = field.driver || 'default';
      let driverConfig = imageService.drivers[driver];
      if (driverConfig) {
        options.allowed = driverConfig.allowed;
        options.maxSize = driverConfig.maxSize;
        options.thumbSuffix = driverConfig.thumbSuffix;
        options.driver = driver;
        return;
      }
    }
    // 没有找到 alaska-image Service，无法上传图片
    options.disabled = true;
    return;
  }];

  static defaultOptions = {
    max: 1000,
    cell: 'ImageFieldCell',
    view: 'ImageFieldView'
  };

  max: number;
  driver: string;

  initSchema() {
    const field = this;
    const schema = this._schema;
    const defaultValue = field.default || {};

    let main = field._model.service.main;
    let imageService = main.allServices.get('alaska-image') as ImageService;
    if (imageService) {
      let driver = field.driver || 'default';
      if (!imageService.drivers.hasOwnProperty(driver)) throw new Error('Image storage driver not found!');
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
    addPath('thumbUrl', String);
    addPath('name', String);
    addPath('size', Number);
    addPath('width', Number);
    addPath('height', Number);

    let imageSchema = new mongoose.Schema(paths);

    function stringToImage(value: string) {
      let matchs = String(value).match(/([a-f0-9]{24})/);
      let id = matchs ? matchs[1] : null;
      return { _id: new ObjectId(id), url: value };
    }

    if (field.multi) {
      schema.add({
        [field.path]: {
          type: [imageSchema],
          set(value: Image | string | string[] | Image[]) {
            if (typeof value === 'string') {
              return [stringToImage(value)];
            }
            if (Array.isArray(value)) {
              return (value as Array<Image | string>).map((img: Image | string) => {
                if (typeof img === 'string') {
                  return stringToImage(img);
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
          type: imageSchema,
          set(value: Image | string | string[] | Image[]) {
            if (Array.isArray(value)) {
              value = value[0] || null;
            }
            if (typeof value === 'string') {
              return stringToImage(value);
            }
            return value;
          }
        }
      }, '');
    }

    this.underscoreMethod('data', function () {
      const value = this.get(field.path);
      if (!field.multi) {
        return value && value.url ? value.url : '';
      }
      return (value || []).map((v: Image) => (v && v.url ? v.url : '')).filter((v: string) => v);
    });
  }
}
