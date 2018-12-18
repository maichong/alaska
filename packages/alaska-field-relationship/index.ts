import { ObjectMap } from 'alaska';
import { Model, Field, FieldDataType } from 'alaska-model';
import * as mongoose from 'mongoose';

const TypeObjectId = mongoose.Schema.Types.ObjectId;
const { ObjectId } = mongoose.Types;

export default class RelationshipField extends Field {
  static fieldName = 'Relationship';
  static plain = TypeObjectId;
  static viewOptions = [
    'filters', 'multi', 'checkbox', 'switch',
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

  // Model id
  model: string;
  optional: boolean;

  /**
   * 初始化Schema
   */
  initSchema() {
    const schema = this._schema;
    const model = this._model;
    const service = model.service;
    const main = service.main;
    let { plain, ref } = this;

    if (typeof ref === 'string') {
      // 查找引用模型
      // ref有可能为null
      ref = model.lookup(ref);

      if (!this.optional && !ref) {
        service.panic(`${model.id}.fields.${this.path}.ref not found [${this.ref}]`);
      }
    }

    let options: ObjectMap<any> = {};
    let type: FieldDataType;
    if (ref) {
      // 找到了引用模型
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
              main.panic(`Field type '${fieldLib}' not found!`);
            }
            type = idFieldClass.plain;
            this.filter = idFieldClass.prototype.filter;
            if (idFieldClass.plainName) {
              this.plainName = idFieldClass.plainName;
            }
          } else if (idType instanceof Field) {
            type = (<typeof Field>idType).plain;
            this.filter = (<typeof Field>idType).prototype.filter;
            if (idType.plainName) {
              this.plainName = idType.plainName;
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

      this.model = ref.id;
    } else {
      // 如果没有找到引用,说明是可选引用
      this.hidden = true;
      type = plain || TypeObjectId;
      options.type = type;
      if (typeof this.ref === 'string') {
        let _ref: string = this.ref;
        if (_ref.indexOf('.') > -1) {
          this.model = this.ref;
        } else {
          this.model = service.id + '.' + this.ref;
        }
      }
    }

    if (type === TypeObjectId && !this.plainName) {
      this.plainName = 'objectid';
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

    this.ref = ref;
    this.plain = type;
    schema.path(this.path, this.multi ? [options] : options);
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
