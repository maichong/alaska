'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Field {

  /**
   * @param {Object} options
   * @param {mongoose.Schema} schema
   * @param {Model} model
   */


  // Mongoose
  constructor(options, schema, model) {
    this._options = options;
    this._schema = schema;
    this._model = model;

    // $Flow
    let FieldClass = options.type;
    this.type = FieldClass;

    // 设置Field类默认选项
    if (FieldClass.defaultOptions) {
      Object.assign(this, FieldClass.defaultOptions);
    }

    // 所有数据库选项
    let dbOptions = ['get', 'set', 'default', 'index', 'unique', 'text', 'sparse', 'required', 'select'].concat(FieldClass.dbOptions || []);

    // 遍历初始化选项
    Object.keys(options).forEach(key => {
      let value = options[key];
      if (value && value instanceof Promise) {
        // 当初始化选项是一个promise对象，则代表此选项需要异步加载
        value.then(v => {
          // $Flow
          this[key] = v;
          if (dbOptions.indexOf(key) > -1) {
            // 如果选项是数据库选项，异步加载后重新初始化数据库Schema
            this.initSchema();
          }
        });
      } else {
        // $Flow
        this[key] = value;
      }
    });

    // 如果Field对象存在init方法，执行自定义初始化方法
    if (this.init) {
      this.init();
    }
  }

  /**
   * 初始化数据库Schema
   */


  // Alaska
  initSchema() {
    let schema = this._schema;
    let options = {
      type: this.dataType || this.type.plain
    };

    let keys = ['get', 'set', 'default', 'index', 'unique', 'text', 'sparse', 'required', 'select'].concat(this.type.dbOptions || []);

    keys.forEach(key => {
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
  underscoreMethod(name, fn) {
    this._model.underscoreMethod(this.path, name, fn);
  }

  /**
   * 获取前端控件参数
   * @returns {Object}
   */
  viewOptions() {
    // $Flow
    let field = this;
    let FieldClass = this.type;

    let ability = field.ability;
    if (typeof ability === 'function') {
      ability = 'js:' + ability.toString();
    }

    let options = {
      label: field.label,
      path: field.path,
      default: field.default,
      ability,
      super: field.super,
      hidden: field.hidden,
      depends: field.depends,
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
      after: field.after
    };

    if (FieldClass.viewOptions && FieldClass.viewOptions.length) {
      FieldClass.viewOptions.forEach(key => {
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


  /**
   * 自定义初始化方法
   */
}
exports.default = Field;
Field.classOfField = true;
Field.plain = String;