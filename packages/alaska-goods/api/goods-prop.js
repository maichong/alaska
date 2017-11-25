'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.list = list;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function list(ctx, next) {
  let filters = ctx.state.filters || ctx.query.filters || {};
  let cat = ctx.state.cat || ctx.query.cat;
  filters.activated = true;
  if (cat) {
    filters = {
      $or: [_extends({}, filters, {
        catsIndex: cat
      }), _extends({}, filters, {
        common: true
      })]
    };
  }
  ctx.state.filters = filters;
  await next();
  if (cat) {
    // $Flow body类型不确定 body为object时属性和值也不固定 results确定不了类型 line 27
    _lodash2.default.forEach(ctx.body.results, prop => {
      prop.values = _lodash2.default.filter(prop.values, value => {
        let record;
        if (value.getRecord) {
          record = value.getRecord();
        }
        return !record || record.common || record.catsIndex && record.catsIndex.indexOf(cat) > -1;
      }, []);
    });
  }
}