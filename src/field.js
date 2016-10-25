/**
 * field 默认方法
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-02
 * @author Liang <liang@maichong.it>
 */

export default class Field {

  static plain = String;

  /**
   * @param {Object} options
   * @param {mongoose.Schema} schema
   * @param {Model} model
   */
  constructor(options, schema, model) {
    this._options = options;
    this._schema = schema;
    this._model = model;

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
    ].concat(options.type.options);

    Object.keys(options).forEach((key) => {
      let value = options[key];
      if (value && value instanceof Promise) {
        value.then((v) => {
          this[key] = v;
          if (keys.indexOf(key) > -1) {
            this.initSchema();
          }
        });
      } else {
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
    ].concat(this.type.options);

    keys.forEach((key) => {
      if (this[key] !== undefined) {
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
    let field = this;
    let options = {
      label: field.label,
      path: field.path,
      default: field.default,
      hidden: field.hidden,
      group: field.group,
      static: field.static,
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

    let type = this.type;

    if (type.views) {
      if (!options.cell && options.cell !== false && type.views.cell) {
        options.cell = type.views.cell.name;
      }
      if (!options.view && type.views.view) {
        options.view = type.views.view.name;
      }
      if (!options.filter && options.filter !== false && type.views.filter) {
        options.filter = type.views.filter.name;
      }
    }

    if (this.type.viewOptions && this.type.viewOptions.length) {
      this.type.viewOptions.forEach((key) => {
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
}
