'use strict';

/**
 * field 默认方法
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-02
 * @author Liang <liang@maichong.it>
 */

class Field {

  /**
   * @param {object} options
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
   * @returns {object}
   */
  viewOptions() {
    let field = this;
    let options = {
      label: field.label,
      path: field.path,
      hidden: field.hidden,
      group: field.group,
      disabled: field.disabled,
      note: field.note,
      depends: field.depends,
      required: field.required,
      fullWidth: field.fullWidth
    };

    if (this.type.views) {
      if (field.cell) {
        options.cell = field.cell;
      } else if (this.type.views.cell) {
        options.cell = this.type.views.cell.name;
      }
      if (field.view) {
        options.view = field.view;
      } else if (this.type.views.view) {
        options.view = this.type.views.view.name;
      }
    }

    if (this.type.viewOptions && this.type.viewOptions.length) {
      this.type.viewOptions.forEach(function (key) {
        if (field[key] !== undefined) {
          options[key] = field[key];
        }
      });
    }

    return options;
  }

  /**
   * 创建查询过滤器
   * @method createFilter
   * @param {string} search
   * @param {object} filters
   * @returns {object}
   */
}

Field.plain = String;
module.exports = Field;