import { ObjectMap } from 'alaska';
import { Model, Field, FieldDataType } from 'alaska-model';
import * as mongoose from 'mongoose';
import * as events from 'events';

const TypeObjectId = mongoose.Schema.Types.ObjectId;
const { ObjectId } = mongoose.Types;

export default class RelationshipField extends Field {
  static fieldName = 'Relationship';
  static plain = TypeObjectId;
  static viewOptions = [
    'multi', 'checkbox', 'switch',
    (options: any, field: RelationshipField) => {
      let ref = field.ref;
      if (ref && ref instanceof Model) {
        options.ref = (<typeof Model>ref).id;
        options.title = (<typeof Model>ref).titleField;
      }
    }
  ];

  static defaultOptions = {
    cell: 'RelationshipFieldCell',
    view: 'RelationshipFieldView',
    filter: 'RelationshipFieldFilter',
    defaultValue: ''
  };

  static _defaults = new Map();
  static _defaultsWatcher = new Map();

  static watchDefault(ref: typeof Model, defaultField: string): { record: Model, watcher: events.EventEmitter } {
    let watcher = this._defaultsWatcher.get(ref.id);
    if (!watcher) {
      watcher = new events.EventEmitter();

      function watch() {
        ref.findOne().sort(`-${defaultField}`).then((record) => {
          if (record) {
            RelationshipField._defaults.set(ref.id, record);
            watcher.emit('change', record);
          }
        });
        let $match: any = {};
        $match[`fullDocument.${defaultField}`] = true;
        let changeStream = ref.watch([{ $match }], {
          fullDocument: 'updateLookup'
        });
        changeStream.on('change', async (change) => {
          let doc = change.fullDocument;
          if (['insert', 'update'].includes(change.operationType) && doc && doc[defaultField]) {
            let record = ref.hydrate(doc);
            RelationshipField._defaults.set(ref.id, record);
            watcher.emit('change', record);
          }
        });
        changeStream.on('close', () => {
          setTimeout(watch, 2000);
        });
      }

      if (ref.registered) {
        watch();
      } else {
        ref.post('register', watch);
      }
    }

    return { record: this._defaults.get(ref.id), watcher };
  };

  // Model id
  model: string;

  /**
   * 初始化Schema
   */
  initSchema() {
    const field = this;
    const schema = field._schema;
    const model = field._model;
    const service = model.service;
    const main = service.main;
    let { plain, ref } = this;

    if (typeof ref === 'string') {
      // 查找引用模型
      // ref有可能为null
      ref = model.lookup(ref);

      if (!ref) {
        throw new Error(`${model.id}.fields.${field.path}.ref not found [${field.ref}]`);
      }
    }

    let options: ObjectMap<any> = {};
    let type: FieldDataType;

    if (plain) {
      type = plain;
    } else if (ref.fields._id) {
      let idField = ref.fields._id;
      let idType: string | FieldDataType | typeof Field | typeof Model = idField.type;
      if (idField.plain) {
        type = idField.plain;
      } else if (idType) {
        // eslint-disable-next-line

        if (typeof idType === 'string') {
          let fieldLib = `alaska-field-${idType}`;
          let idFieldClass: typeof Field = main.modules.libraries[fieldLib];
          if (!idFieldClass) {
            throw new Error(`Field type '${fieldLib}' not found!`);
          }
          type = idFieldClass.plain;
          if (idFieldClass.plainName) {
            field.plainName = idFieldClass.plainName;
          }
        } else if (idType instanceof Field) {
          type = (<typeof Field>idType).plain;
          if (idType.plainName) {
            field.plainName = idType.plainName;
          }
        } else {
          type = <FieldDataType>idType;
        }
      }
    }
    if (!type) {
      type = TypeObjectId;
    }
    options = {
      type,
      ref: ref.modelName
    };

    field.model = ref.id;

    if (type === TypeObjectId && !field.plainName) {
      field.plainName = 'objectid';
    }

    options.set = (value: any) => {
      if (value === '' && type === TypeObjectId) {
        // eslint-disable-next-line
        return undefined;
      }
      // eslint-disable-next-line
      return value;
    };

    [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].forEach((key) => {
      // @ts-ignore Field 对象可遍历
      if (typeof this[key] !== 'undefined') {
        // @ts-ignore Field 对象可遍历
        options[key] = this[key];
      }
    });

    if (!options.default && field.defaultField) {
      options.default = function () {
        return RelationshipField._defaults.get(field.model);
      };
      let { record, watcher } = RelationshipField.watchDefault(ref, field.defaultField);
      if (record) {
        field.default = record._id;
      }
      watcher.on('change', (record: Model) => {
        field.default = record._id;
      });
    }

    field.ref = ref;
    field.plain = type;
    schema.path(field.path, field.multi ? [options] : options);
  }

  parse(value: any): any {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    if (this.plain === TypeObjectId) {
      if (ObjectId.isValid(value)) {
        if (typeof value === 'object') {
          return value;
        }
        return new ObjectId(value);
      }
    } else if (this.plain === String) {
      return String(value);
    } else if (this.plain === Number) {
      return parseInt(value) || null;
    } else if (this.plain === Boolean) {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      if (value === true || value === false) return value;
    }

    return null;
  }
}
