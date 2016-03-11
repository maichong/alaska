"use strict";

/**
 * field 默认方法
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-02
 * @author Liang <liang@maichong.it>
 */

exports.plain = String;

/**
 * 初始化Schema
 * @param field   alaksa.Model中的字段配置
 * @param schema
 * @param Model
 */
exports.initSchema = function (field, schema, Model) {
  schema.path(field.path, field.dataType || this.plain);
};

/**
 * alaska-admin-view 前端控件初始化参数
 * @param field
 * @param Model
 */
exports.viewOptions = function (field, Model) {
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

  if (this.views) {
    if (field.cell) {
      options.cell = field.cell;
    } else if (this.views.cell) {
      options.cell = this.views.cell.name;
    }
    if (field.view) {
      options.view = field.view;
    } else if (this.views.view) {
      options.view = this.views.view.name;
    }
  }

  return options;
};

/**
 * 格式化数据
 * @param field   alaksa.Model中的字段配置
 * @param record  模型记录
 * @returns {*}
 */
exports.format = function (field, record) {
  return record[field.path];
};