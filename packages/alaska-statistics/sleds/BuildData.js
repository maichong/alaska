// @flow

import _ from 'lodash';
import moment from 'moment';
import { Sled } from 'alaska';
import service from '../';
import ChartSource from '../models/ChartSource';
import ChartData from '../models/ChartData';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFirstDate(date, unit) {
  return moment(date).startOf(unit);
}

function getLastDate(date, unit) {
  return moment(date).endOf(unit);
}

function getCycleX(date, unit) {
  date = moment(date);
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
  date = moment(date);
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
    date.month((date.quarter() * 4) - 3);
  }
  return date.valueOf().toString();
}

async function buildTimeData(source, Model, filters) {
  const { x, y, reducer, unit } = source;
  // $Flow findOne
  let query: Mongoose$Query = Model.findOne(filters);
  if (!filters || !filters[x]) {
    query.where(x).gt(new Date(0));
  }
  // $Flow  findOne
  let first: Alaska$Model = await query.sort(x);
  // $Flow findOne
  let lastRecord: Alaska$Model = await Model.findOne(filters).sort('-' + x);
  let firstDate = getFirstDate(first[x], unit);
  let lastDate = getLastDate(lastRecord[x], unit);

  let from = firstDate;
  let to = moment(from).add(1, unit + 's');

  let size = (lastDate.valueOf() - firstDate.valueOf()) / moment.duration(1, unit + 's').as('milliseconds');

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
      let list: Alaska$Model[] = await modeQuery;
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
    _.forEach(result, (yy, xx) => {
      if (reducer === 'average') {
        yy /= count[xx];
      }
      yy = _.round(yy, precision);
      (new ChartData({ source, x: new Date(xx * 1), y: yy })).save();
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
        await (new ChartData({
          source,
          x: from.toDate(),
          y: count
        })).save();
      }
      from = moment(to);
      to = moment(from).add(1, unit + 's');
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
      let list: Alaska$Model[] = await Model.find(filters).select(y);
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
        value = _.round(value, source.precision || 0);
        await (new ChartData({
          source,
          x: from.toDate(),
          y: value
        })).save();
      }
      from = moment(to);
      to = moment(from).add(1, unit + 's');
    }
  }
}

async function buildCycleData(source, Model, filters) {
  const { x, y, reducer, unit } = source;
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
    let list: Alaska$Model[] = await query;
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
  _.forEach(result, (yy, xx) => {
    if (reducer === 'average') {
      yy /= count[xx];
    }
    yy = _.round(yy, precision);
    (new ChartData({ source, x: parseInt(xx), y: yy })).save();
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
    let list: Alaska$Model[] = await query;
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
  _.forEach(result, (yy, xx) => {
    if (reducer === 'average') {
      yy /= count[xx];
    }
    yy = _.round(yy, precision);
    (new ChartData({ source, x: xx, y: yy })).save();
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
    let list: Alaska$Model[] = await query;
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
    result = _.map(result, (y, x) => ({ x, y }));
  }
  result.forEach(({ x, y }) => (new ChartData({ source, x, y })).save());
}

async function buildChartSource(chartSource, startDate) {
  const { model, type, reducer, x } = chartSource;
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

    await ChartData.remove({ source: chartSource._id }).where(x).gte(startDate);
  } else {
    await ChartData.remove({ source: chartSource._id });
  }
  let Model = service.model(model);
  let count = await Model.where(filters).count();

  if (!count) return;

  const reducers = service.config('reducers') || {};
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
    service.error('Unknown chart source type');
  }
}

export default class BuildData extends Sled {
  async exec(params: {
    chartSource:Object;
    chart:Object;
    startDate:Date;
  }) {
    const { chartSource, chart, startDate } = params;
    if (chartSource) {
      await buildChartSource(chartSource, startDate);
      return;
    }

    if (chart) {
      // $Flow  find
      let sources: ChartSource[] = await ChartSource.find().where('_id').in(chart.sources);
      for (let source of sources) {
        await buildChartSource(source, startDate);
      }
    }
  }
}
