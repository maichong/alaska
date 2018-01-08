'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  try {
    await ctx.checkAbility('admin');
    let serviceId = ctx.state.service || ctx.query._service;
    let modelName = ctx.state.model || ctx.query._model;
    let path = ctx.state.path || ctx.query._path;
    let body = ctx.state.body || ctx.request.body;
    let id = body.id || ctx.request.body.id;
    if (!serviceId || !modelName || !path) {
      _alaska2.default.error('Invalid parameters');
    }
    let s = _alaska2.default.services[serviceId];
    if (!s) {
      _alaska2.default.error('Invalid parameters');
    }
    let Model = s.getModel(modelName);
    let ability = `admin.${Model.key}.`;
    if (id) {
      ability += 'update';
      if (Model.actions && Model.actions.update && Model.actions.update.ability) {
        ability = Model.actions.update.ability;
      }
    } else {
      ability += 'create';
      if (Model.actions && Model.actions.create && Model.actions.create.ability) {
        ability = Model.actions.create.ability;
      }
    }
    await ctx.checkAbility(ability);

    let FieldType = Model._fields[path].type;
    if (!FieldType || !FieldType.upload) {
      _alaska2.default.error('Invalid field');
    }
    // $Flow
    let img = await FieldType.upload(ctx.files.file, Model._fields[path]);
    if (ctx.state.editor || ctx.query._editor) {
      ctx.body = {
        success: true,
        file_path: img.url
      };
    } else {
      ctx.body = img;
    }
  } catch (error) {
    if (ctx.state.editor || ctx.query._editor) {
      ctx.body = {
        success: false,
        msg: error.message
      };
    } else {
      throw error;
    }
  }
};