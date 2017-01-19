// @flow

export default class Field {

  static classOfField = true;
  static plain = String;
  static dbOptions: string[];
  static viewOptions: string[];
  static views: {
    cell?:Alaska$Field$View;
    view?:Alaska$Field$View;
    filter?:Alaska$Field$View;
  };

  // Mongoose
  get: Function | void;
  set: Function | void;
  default: any | void;
  index: boolean | void;
  unique: boolean | void;
  sparse: boolean | void;
  text: boolean | void;
  required: boolean | void;
  select: boolean | void;

  // Alaska
  label: string;
  path: string;
  group: string | void;
  hidden: boolean | void;
  fixed: boolean | void;
  horizontal: boolean | void;
  nolabel: boolean | void;
  disabled: boolean | void;
  super: boolean | void;
  help: string | void;
  cell: string | void;
  view: string | void;
  filter: string | void;
  depends: Alaska$Field$depends | void;
  dataType: Function;

  _options: Alaska$Field$options;
  _schema: Mongoose$Schema;
  _model: Class<Alaska$Model>;
  type: Class<Alaska$Field>;

  /**
   * @param {Object} options
   * @param {mongoose.Schema} schema
   * @param {Model} model
   */
  constructor(options: Alaska$Field$options, schema: Object, model: Class<Alaska$Model>) {
    this._options = options;
    this._schema = schema;
    this._model = model;

    // $Flow
    let FieldClass: Class<Alaska$Field> = this.type = options.type;

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
    ].concat(FieldClass.dbOptions);

    Object.keys(options).forEach((key) => {
      let value = options[key];
      if (value && value instanceof Promise) {
        value.then((v) => {
          // $Flow
          this[key] = v;
          if (keys.indexOf(key) > -1) {
            this.initSchema();
          }
        });
      } else {
        // $Flow
        this[key] = value;
      }
    });

    if (this.init) {
      this.init();
    }
  }

  initSchema() {
    let schema = this._schema;
    let options = {
      type: this.dataType || this.type.plain
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
    ].concat(this.type.dbOptions);

    keys.forEach((key) => {
      // $Flow
      if (this[key] !== undefined) {
        // $Flow
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
  viewOptions() {
    // $Flow
    let field: Alaska$Field = this;
    let options = {
      label: field.label,
      path: field.path,
      default: field.default,
      hidden: field.hidden,
      group: field.group,
      fixed: field.fixed,
      disabled: field.disabled,
      help: field.help,
      depends: field.depends,
      required: field.required,
      horizontal: field.horizontal,
      nolabel: field.nolabel,
      cell: field.cell,
      view: field.view,
      filter: field.filter,
      super: field.super
    };

    let FieldClass = this.type;

    if (FieldClass.views) {
      if (!options.cell && options.cell !== false && FieldClass.views.cell) {
        options.cell = FieldClass.views.cell.name;
      }
      if (!options.view && FieldClass.views.view) {
        options.view = FieldClass.views.view.name;
      }
      if (!options.filter && options.filter !== false && FieldClass.views.filter) {
        options.filter = FieldClass.views.filter.name;
      }
    }

    if (FieldClass.viewOptions && FieldClass.viewOptions.length) {
      FieldClass.viewOptions.forEach((key) => {
        if (typeof key === 'function') {
          key(options, field);
        } else if (typeof key === 'object' && key.key) {
          options[key.key] = key.value;
        } else if (field[key] !== undefined) {
          options[key] = field[key];
        }
      });
    }

    return options;
  }

  /**
   * 创建查询过滤器,传入客户端提交的值,返回格式化的/安全的MongoDB查询值
   * 如果返回undefined,则视为此过滤器无效
   * @method createFilter
   * @param {Object} filter   客户端提交的值
   * @param {Object} filters  此次查询所有的filters,特殊情况下可以不返回值,而直接修改此对象
   * @returns {Object}        返回格式化后的值
   */
  createFilter: (filter: Object, filters: Object)=> Object;

  /**
   * 自定义初始化方法
   */
  init: () => void;
}
