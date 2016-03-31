'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * field 默认方法
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-02
 * @author Liang <liang@maichong.it>
 */

class Field {

  /**
   * @param {Object} options
   * @param {mongoose.Schema} schema
   * @param {Model} model
   */
  constructor(options, schema, model) {
    this._options = options;
    this._schema = schema;
    this._model = model;
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }
    if (this.init) {
      this.init();
    }
  }

  initSchema() {
    let schema = this._schema;
    let options = {
      type: this.dataType || this.type.plain
    };
    ['get', 'set', 'default', 'index', 'required', 'select'].concat(this.type.options).forEach(key => {
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
      hidden: field.hidden,
      group: field.group,
      disabled: field.disabled,
      help: field.help,
      depends: field.depends,
      required: field.required,
      fullWidth: field.fullWidth,
      cell: field.cell,
      view: field.view
    };

    let type = this.type;

    if (type.views) {
      if (!options.cell && type.views.cell) {
        options.cell = type.views.cell.name;
      }
      if (!options.view && type.views.view) {
        options.view = type.views.view.name;
      }
    }

    if (this.type.viewOptions && this.type.viewOptions.length) {
      this.type.viewOptions.forEach(function (key) {
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
exports.default = Field;
Field.plain = String;