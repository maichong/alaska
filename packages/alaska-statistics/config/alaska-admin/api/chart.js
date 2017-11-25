'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Chart = require('../../../models/Chart');

var _Chart2 = _interopRequireDefault(_Chart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  await ctx.checkAbility('admin');
  //abilities
  let id = ctx.query.id || ctx.error(404);
  // $Flow  findById
  let chart = await _Chart2.default.findById(id);

  if (!chart) ctx.error(404);

  if (chart.abilities) {
    for (let ability of chart.abilities) {
      // $Flow ability Object string
      await ctx.checkAbility(ability);
    }
  }

  ctx.body = await chart.getData(ctx);
};