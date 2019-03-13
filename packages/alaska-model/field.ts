import { FieldOption, Model, Field as FieldType, FieldViewOption, FieldDataType, AbilityCheckGate } from 'alaska-model';
import { Schema } from 'mongoose';
import { DependsQueryExpression } from 'check-depends';
import * as AdminView from 'alaska-admin-view';

export default class Field {
  static readonly classOfField = true;
  static plain = String;
  static plainName?: string;
  static dbOptions?: string[];
  static viewOptions?: FieldViewOption[];
  static defaultOptions?: Object;

  readonly instanceOfField: true;
  _options: FieldOption;
  _schema: Schema;
  _model: typeof Model;
  type: typeof FieldType;

  // Mongoose
  get?: Function;
  set?: Function;
  default?: any;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  text?: boolean;
  required?: boolean;
  select?: boolean;

  // Alaska
  defaultValue?: any;
  label: string;
  path: string;
  group?: string;
  disabled?: DependsQueryExpression | AbilityCheckGate[];
  hidden?: DependsQueryExpression | AbilityCheckGate[];
  protected?: DependsQueryExpression | AbilityCheckGate[];
  private?: DependsQueryExpression | AbilityCheckGate[];
  super?: DependsQueryExpression | AbilityCheckGate[];
  fixed?: DependsQueryExpression | AbilityCheckGate[];
  horizontal?: boolean;
  nolabel?: boolean;
  help?: string;
  cell?: string;
  view?: string;
  filter?: string;
  after?: string;
  plain: FieldDataType;

  constructor(options: FieldOption, schema: Schema, model: typeof Model) {
    this.instanceOfField = true;
    this._options = options;
    this._schema = schema;
    this._model = model;

    // @ts-ignore 此时 options.type 已经经过Model.init处理，一定为Field类
    let FieldClass: typeof FieldType = options.type;
    this.type = FieldClass;

    // 设置Field类默认选项
    if (FieldClass.defaultOptions) {
      Object.assign(this, FieldClass.defaultOptions);
    }

    // 所有数据库选项
    let dbOptions = [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].concat(FieldClass.dbOptions || []);

    // 遍历初始化选项
    Object.keys(options).forEach((key: keyof FieldOption) => {
      let value = options[key];
      if (value && value instanceof Promise) {
        // 当初始化选项是一个promise对象，则代表此选项需要异步加载
        value.then((v) => {
          // @ts-ignore
          this[key] = v;
          if (dbOptions.indexOf(key) > -1) {
            // 如果选项是数据库选项，异步加载后重新初始化数据库Schema
            this.initSchema();
          }
        });
      } else {
        // @ts-ignore
        this[key] = value;
      }
    });

    // 执行自定义初始化方法
    this.init();
  }

  /**
   * 初始化数据库Schema
   */
  initSchema() {
    let schema = this._schema;

    let options = {
      type: this.plain || (<typeof Field> this.constructor).plain
    };

    let keys = [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].concat(this.type.dbOptions || []);

    keys.forEach((key) => {
      // @ts-ignore
      if (typeof this[key] !== 'undefined') {
        // @ts-ignore
        options[key] = this[key];
      }
    });
    schema.path(this.path, options);
  }


  /**
   * 注册underscore方法
   * @param name
   * @param fn
   */
  underscoreMethod(name: string, fn: Function) {
    this._model.underscoreMethod(this.path, name, fn);
  }

  /**
   * 获取前端控件参数
   * @returns {Object}
   */
  viewOptions(): AdminView.Field {
    let field: FieldType = this;
    let FieldClass = this.type;


    // TODO: ability 支持
    // let ability = field.ability;
    // if (typeof ability === 'function') {
    //   ability = `js:${ability.toString()}`;
    // }

    let plainName = field.plainName || FieldClass.plainName;
    if (!plainName) {
      if (field.plain === String || FieldClass.plain === String) {
        plainName = 'string';
      } else if (field.plain === Date || FieldClass.plain === Date) {
        plainName = 'date';
      } else if (field.plain === Number || FieldClass.plain === Number) {
        plainName = 'number';
      } else if (field.plain === Boolean || FieldClass.plain === Boolean) {
        plainName = 'bool';
      } else {
        plainName = '';
      }
    }

    let options: AdminView.Field = {
      label: field.label,
      path: field.path,
      plainName,
      default: field.default,
      // ability,
      super: field.super,
      hidden: field.hidden,
      protected: field.protected,
      disabled: field.disabled,
      group: field.group,
      fixed: field.fixed,
      help: field.help,
      required: field.required,
      horizontal: field.horizontal,
      nolabel: field.nolabel,
      cell: field.cell,
      view: field.view,
      filter: field.filter,
      after: field.after,
      filters: field.filters,
    };

    if (FieldClass.viewOptions && FieldClass.viewOptions.length) {
      FieldClass.viewOptions.forEach((key) => {
        if (typeof key === 'function') {
          key(options, field);
        } else if (typeof key === 'object' && key.key) {
          // @ts-ignore
          options[key.key] = key.value;
          // @ts-ignore
        } else if (typeof field[key] !== 'undefined') {
          // @ts-ignore
          options[key] = field[key];
        }
      });
    }

    return options;
  }

  /**
   * 自定义初始化方法
   */
  init() {
    // 抽象方法
  }

  /**
   * 格式化过滤参数，返回null代表无效
   * @param value
   */
  parseFilter(value: any): null | any {
    return this.parse(value);
  }

  /**
   * 格式化值，将值格式化为MongoDB支持的类型，返回null代表无效值
   * @param value
   */
  parse(value: any): null | any {
    return value;
  }
}
