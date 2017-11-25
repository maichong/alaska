'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _alaska = require('alaska');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _ChartSource = require('../models/ChartSource');

var _ChartSource2 = _interopRequireDefault(_ChartSource);

var _ChartData = require('../models/ChartData');

var _ChartData2 = _interopRequireDefault(_ChartData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFirstDate(date, unit) {
  return (0, _moment2.default)(date).startOf(unit);
}

function getLastDate(date, unit) {
  return (0, _moment2.default)(date).endOf(unit);
}

function getCycleX(date, unit) {
  date = (0, _moment2.default)(date);
  if (!date.isValid()) return '';
  switch (unit) {
    case 'quarter':
      //季度循环 1~4
      return date.quarter();
    case 'month':
      //月份循环 1~12
      return date.month() + 1;
    case 'week':
      //每周天数 0~6
      return date.day();
    case 'day':
      //每月天数 1~31
      return date.date();
    case 'hour':
      //每小时 0~23
      return date.hour();
    default:
      return '';
  }
}

function getTimeX(date, unit) {
  date = (0, _moment2.default)(date);
  switch (unit) {
    case 'year':
    case 'quarter':
    case 'month':
      date.date(1);
      break;
    case 'week':
    case 'day':
      date.hour(0);
      break;
    case 'hour':
      date.minute(0);
      break;
    case 'minute':
      date.second(0);
      break;
    default:
      break;
  }
  date.millisecond(0);
  if (unit.toString() === 'year') {
    date.month(1);
  } else if (unit.toString() === 'quarter') {
    date.month(date.quarter() * 4 - 3);
  }
  return date.valueOf().toString();
}

async function buildTimeData(source, Model, filters) {
  const {
    x, y, reducer, unit
  } = source;
  // $Flow findOne
  let query = Model.findOne(filters);
  if (!filters || !filters[x]) {
    query.where(x).gt(new Date(0));
  }
  let first = await query.sort(x);
  // $Flow findOne
  let lastRecord = await Model.findOne(filters).sort('-' + x);
  let firstDate = getFirstDate(first[x], unit);
  let lastDate = getLastDate(lastRecord[x], unit);

  let from = firstDate;
  let to = (0, _moment2.default)(from).add(1, unit + 's');

  let size = (lastDate.valueOf() - firstDate.valueOf()) / _moment2.default.duration(1, unit + 's').as('milliseconds');

  if (size > 1000) {
    //查询次数优化
    let result = {};
    let count = {};
    let last = null;

    let select = x;
    if (reducer !== 'count') {
      select += ' ' + y;
    }
    while (true) {
      await sleep(10);
      let modeQuery = Model.find(filters).sort('_id').limit(1000).select(select);
      if (last) {
        modeQuery.where('_id').gt(last);
      }
      // $Flow  find
      let list = await modeQuery;
      if (!list.length) break;
      for (let record of list) {
        last = record._id;
        let key = getTimeX(record.get(x), unit);
        if (!result[key]) {
          result[key] = 0;
          count[key] = 0;
        }
        switch (reducer) {
          case 'count':
            result[key] += 1;
            break;
          case 'max':
            result[key] = Math.max(result[key], record.get(y));
            break;
          case 'min':
            result[key] = Math.min(result[key], record.get(y));
            break;
          case 'sum':
          case 'average':
            count[key] += 1;
            result[key] += record.get(y) || 0;
            break;
          default:
            break;
        }
      }
    }

    let precision = source.precision || 0;
    _lodash2.default.forEach(result, (yy, xx) => {
      if (reducer === 'average') {
        yy /= count[xx];
      }
      yy = _lodash2.default.round(yy, precision);
      new _ChartData2.default({ source, x: new Date(xx * 1), y: yy }).save();
    });
    return;
  }

  if (reducer === 'count') {
    while (true) {
      await sleep(10);
      if (from.isAfter(lastDate)) {
        break;
      }
      if (!filters) {
        filters = {};
      }
      if (!filters[x]) {
        filters[x] = {};
      }
      filters[x].$gte = from;
      filters[x].$lt = to;
      let count = await Model.count(filters);
      if (count) {
        await new _ChartData2.default({
          source,
          x: from.toDate(),
          y: count
        }).save();
      }
      from = (0, _moment2.default)(to);
      to = (0, _moment2.default)(from).add(1, unit + 's');
    }
  } else {
    //sum avg min max
    while (true) {
      await sleep(10);
      if (from.isAfter(lastDate)) {
        break;
      }
      if (!filters) {
        filters = {};
      }
      if (!filters[x]) {
        filters[x] = {};
      }
      filters[x].$gte = from;
      filters[x].$lt = to;
      // $Flow find
      let list = await Model.find(filters).select(y);
      if (list.length) {
        let value = 0;
        for (let item of list) {
          let v = item.get(y) || 0;
          switch (reducer) {
            case 'sum':
            case 'average':
              value += v;
              break;
            case 'min':
              value = Math.min(value, v);
              break;
            case 'max':
              value = Math.max(value, v);
              break;
            default:
              break;
          }
        }
        if (reducer === 'average') {
          let tmp = value / list.length;
          value = tmp;
        }
        value = _lodash2.default.round(value, source.precision || 0);
        await new _ChartData2.default({
          source,
          x: from.toDate(),
          y: value
        }).save();
      }
      from = (0, _moment2.default)(to);
      to = (0, _moment2.default)(from).add(1, unit + 's');
    }
  }
}

async function buildCycleData(source, Model, filters) {
  const {
    x, y, reducer, unit
  } = source;
  let last;
  let result = {};
  let count = {};
  let select = x;
  if (reducer !== 'count') {
    select += ' ' + y;
  }

  while (true) {
    await sleep(10);
    let query = Model.find(filters).sort('_id').limit(1000).select(select);
    if (last) {
      query.where('_id').gt(last);
    }
    // $Flow  find
    let list = await query;
    if (!list.length) break;
    for (let record of list) {
      last = record._id;
      let key = getCycleX(record.get(x), unit);
      if (!result[key]) {
        result[key] = 0;
        count[key] = 0;
      }
      switch (reducer) {
        case 'count':
          result[key] += 1;
          break;
        case 'max':
          result[key] = Math.max(result[key], record.get(y));
          break;
        case 'min':
          result[key] = Math.min(result[key], record.get(y));
          break;
        case 'sum':
        case 'average':
          count[key] += 1;
          result[key] += record.get(y) || 0;
          break;
        default:
          break;
      }
    }
  }

  let precision = source.precision || 0;
  _lodash2.default.forEach(result, (yy, xx) => {
    if (reducer === 'average') {
      yy /= count[xx];
    }
    yy = _lodash2.default.round(yy, precision);
    new _ChartData2.default({ source, x: parseInt(xx), y: yy }).save();
  });
}

async function buildEnumData(source, Model, filters) {
  const { x, y, reducer } = source;
  let last;
  let result = {};
  let count = {};
  let select = x;
  if (reducer !== 'count') {
    select += ' ' + y;
  }

  while (true) {
    await sleep(10);
    let query = Model.find(filters).sort('_id').limit(1000).select(select);
    if (last) {
      query.where('_id').gt(last);
    }
    // $Flow  find
    let list = await query;
    if (!list.length) break;
    for (let record of list) {
      last = record._id;
      let key = record.get(x);
      if (!result[key]) {
        result[key] = 0;
        count[key] = 0;
      }
      switch (reducer) {
        case 'count':
          result[key] += 1;
          break;
        case 'max':
          result[key] = Math.max(result[key], record.get(y));
          break;
        case 'min':
          result[key] = Math.min(result[key], record.get(y));
          break;
        case 'sum':
        case 'average':
          count[key] += 1;
          result[key] += record.get(y) || 0;
          break;
        default:
          break;
      }
    }
  }

  let precision = source.precision || 0;
  _lodash2.default.forEach(result, (yy, xx) => {
    if (reducer === 'average') {
      yy /= count[xx];
    }
    yy = _lodash2.default.round(yy, precision);
    new _ChartData2.default({ source, x: xx, y: yy }).save();
  });
}

async function buildCustomData(source, Model, filters, custom) {
  let last;
  let result = {};
  while (true) {
    await sleep(10);
    let query = Model.find(filters).sort('_id').limit(1000);
    if (last) {
      query.where('_id').gt(last);
    }
    if (custom.select) {
      query.select(custom.select);
    }
    // $Flow  find
    let list = await query;
    if (!list.length) break;
    for (let record of list) {
      result = custom.fn(result, record);
      last = record._id;
    }
  }
  if (custom.final) {
    result = custom.final(result);
  } else {
    // $Flow lodash描述不匹配
    result = _lodash2.default.map(result, (y, x) => ({ x, y }));
  }
  result.forEach(({ x, y }) => new _ChartData2.default({ source, x, y }).save());
}

async function buildChartSource(chartSource, startDate) {
  const {
    model, type, reducer, x
  } = chartSource;
  let filters = chartSource._.filters.filter();

  //增量更新
  if (type === 'time' && startDate) {
    if (!filters) {
      filters = {};
    }
    if (!filters[x]) {
      filters[x] = {};
    }
    filters[x].$gte = startDate;

    await _ChartData2.default.remove({ source: chartSource._id }).where(x).gte(startDate);
  } else {
    await _ChartData2.default.remove({ source: chartSource._id });
  }
  let Model = _3.default.getModel(model);
  let count = await Model.where(filters).count();

  if (!count) return;

  const reducers = _3.default.getConfig('reducers') || {};
  let custom = reducers[reducer];

  if (custom) {
    await buildCustomData(chartSource, Model, filters, custom);
    return;
  }

  if (type === 'time') {
    //按时间线统计
    await buildTimeData(chartSource, Model, filters);
  } else if (type === 'enum') {
    await buildEnumData(chartSource, Model, filters);
  } else if (type === 'cycle') {
    await buildCycleData(chartSource, Model, filters);
  } else {
    _3.default.error('Unknown chart source type');
  }
}

class BuildData extends _alaska.Sled {
  async exec(params) {
    const { chartSource, chart, startDate } = params;
    if (chartSource) {
      await buildChartSource(chartSource, startDate);
      return;
    }

    if (chart) {
      // $Flow  find
      let sources = await _ChartSource2.default.find().where('_id').in(chart.sources);
      for (let source of sources) {
        await buildChartSource(source, startDate);
      }
    }
  }
}
exports.default = BuildData;