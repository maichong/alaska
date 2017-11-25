'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ChartSource = require('../models/ChartSource');

var _ChartSource2 = _interopRequireDefault(_ChartSource);

var _ChartData = require('../models/ChartData');

var _ChartData2 = _interopRequireDefault(_ChartData);

var _BuildData = require('./BuildData');

var _BuildData2 = _interopRequireDefault(_BuildData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AutoBuild extends _alaska.Sled {
  async exec() {
    // $Flow  findOne
    let source = await _ChartSource2.default.findOne().where('autoBuild').gt(0).where({
      $or: [{ nextAt: { $lt: new Date() } }, { nextAt: null }]
    }).sort('nextAt');

    if (!source) return;
    source.nextAt = new Date(Date.now() + source.autoBuild);
    await source.save();

    let startDate;

    if (source.type === 'time') {
      //时间轴类型数据源,需要增量构建以优化速度
      let lastData = await _ChartData2.default.findOne({ source }).sort('-x');
      if (lastData) {
        await lastData.remove();
        startDate = lastData.x;
      }
    }
    await _BuildData2.default.run({ chartSource: source, startDate });
  }
}
exports.default = AutoBuild;