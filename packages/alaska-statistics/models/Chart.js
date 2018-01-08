'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _alaska = require('alaska');

var _numberRandom = require('number-random');

var _numberRandom2 = _interopRequireDefault(_numberRandom);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _ChartData = require('./ChartData');

var _ChartData2 = _interopRequireDefault(_ChartData);

var _ChartSource = require('./ChartSource');

var _ChartSource2 = _interopRequireDefault(_ChartSource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const monthLabels = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'Aguest', 'September', 'October', 'November', 'December'];
const weekLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const quarterLabels = ['', 'Spring', 'Summer', 'Autumn', 'Winter'];

const backgroundClearer = {
  line: 0.8,
  bar: 0.8
};

function randomColor() {
  let h = (0, _numberRandom2.default)(2, 30) + [0, 120, 240][(0, _numberRandom2.default)(0, 2)];
  let s = (0, _numberRandom2.default)(40, 90);
  let l = (0, _numberRandom2.default)(30, 70);
  return new _color2.default(`hsl(${h},${s}%,${l}%)`);
}

function randomColorList(count, lighten) {
  let res = {
    backgroundColor: [],
    hoverBackgroundColor: [],
    borderColor: [],
    queue: []
  };

  let color = randomColor();

  let rotate = parseInt(360 / (count + 1));

  let list = [];

  while (count > 0) {
    count -= 1;
    list.push(new _color2.default(color.rgb()));
    color.rotate(rotate);
  }
  list.sort(() => Math.random() > 0.5 ? 1 : -1).forEach(c => {
    let c1 = c.lighten(0.2).hex();
    let c2 = c.lighten(0.1).hex();
    let c3 = c.lighten(lighten || 0.1).hex();
    res.borderColor.push(c1);
    res.hoverBackgroundColor.push(c2);
    res.backgroundColor.push(c3);
    res.queue.push([c1, c2, c3]);
  });

  return res;
}

function getCycleLabel(x, unit) {
  if (unit === 'week') {
    return weekLabels[Number(x)] || String(x);
  }
  if (unit === 'quarter') {
    return quarterLabels[Number(x)] || String(x);
  }
  if (unit === 'month') {
    return monthLabels[Number(x)] || String(x);
  }
  return String(x);
}

class Chart extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async getData(ctx) {
    const t = ctx ? ctx.t : str => _3.default.t(str);
    let chart = this;
    let options = _lodash2.default.defaultsDeep({
      responsive: true
    }, chart.options);

    let res = {
      type: chart.type,
      data: {
        datasets: [],
        labels: []
      },
      options
    };

    let datasets = res.data.datasets;
    let labels = res.data.labels;

    let datasetsConfigs = chart.datasets || {};

    if (!options.title) {
      options.title = {};
    }
    if (!options.title.text) {
      options.title.text = chart.title;
    }

    let sources = [];
    if (chart.populated('sources')) {
      sources = chart.sources;
    } else if (_lodash2.default.size(chart.sources)) {
      //不使用in查询,牺牲性能为了保证数据源顺序
      for (let id of chart.sources) {
        // $Flow  findById
        let tmp = await _ChartSource2.default.findById(id);
        sources.push(tmp);
      }
    }

    let colorMap = {};
    let colorsQueue = randomColorList(30, backgroundClearer[chart.type]).queue;

    for (let source of sources) {
      let query = _ChartData2.default.find({ source: source._id }).select('x y');
      if (source.type === 'cycle' || source.type === 'time') {
        query.sort('x');
      } else if (source.sort) {
        query.sort(source.sort);
      }
      if (source.limit) {
        if (source.type === 'time') {
          query.where('x').gte((0, _moment2.default)().subtract(source.limit, source.unit + 's').toDate());
        } else {
          query.limit(source.limit);
        }
      }
      // $Flow  find
      let dataRecords = await query;
      let dataPoints = [];
      //填充0
      if (chart.type === 'line' && source.type === 'time' && dataRecords.length) {
        let dataMap = {};
        for (let d of dataRecords) {
          let key = d.x.getTime().toString();
          dataMap[key] = d.y;
        }
        let start = (0, _moment2.default)(dataRecords[0].x);
        let end = dataRecords[dataRecords.length - 1].x;
        if (source.limit) {
          end = (0, _moment2.default)(start).add(source.limit, source.unit + 's');
        }
        while (!start.isAfter(end)) {
          let key = start.valueOf().toString();
          if (!dataMap[key]) {
            dataMap[key] = 0;
          }
          start.add(1, source.unit + 's');
        }
        dataPoints = Object.keys(dataMap).sort().map(xx => {
          let y = dataMap[xx];
          let x = new Date(parseInt(xx));
          return { x, y };
        });
      }
      let tmp = _lodash2.default.defaultsDeep({}, datasetsConfigs[source.id], {
        label: source.title,
        data: [],
        borderWidth: 1
      });
      datasets.push(tmp);

      //如果是线状图 并且为了统计数量,则默认Y轴从0开始计数
      if (['line', 'bar'].indexOf(chart.type) > -1 && source.reducer === 'count') {
        if (!options.scales) {
          options.scales = {};
        }
        if (!options.scales.yAxes) {
          options.scales.yAxes = [{}];
        }
        let yAxes = options.scales.yAxes[0];
        if (!yAxes.ticks) {
          yAxes.ticks = {};
        }
        yAxes.ticks.beginAtZero = true;
      }

      //映射label与Y周值
      if (chart.type !== 'line' || source.type !== 'time') {
        let backgroundColors = [];
        let hoverBackgroundColors = [];
        let borderColors = [];
        let chartData = [];
        for (let d of dataRecords) {
          // $Flow TODO
          let label = await source.getXLabel(d.x);
          label = t(getCycleLabel(label, source.unit));
          let index = labels.indexOf(label);
          if (index === -1) {
            index = labels.length;
            labels.push(label);
          }
          chartData[index] = d.y;
          if (chart.type !== 'bar') {
            let color = colorMap[label];
            if (!color) {
              let c = colorsQueue.shift();
              if (!c) {
                c = randomColorList(1, backgroundClearer[chart.type]).queue[0];
              }
              colorMap[label] = c;
              color = c;
            }
            backgroundColors.push(color[0]);
            hoverBackgroundColors.push(color[1]);
            borderColors.push(color[2]);
          }
        }
        tmp.borderColor = borderColors;
        tmp.hoverBackgroundColor = hoverBackgroundColors;
        tmp.backgroundColor = backgroundColors;
        tmp.data = chartData;
        if (chart.type !== 'bar') continue;
      } else {
        let chartData = [];
        for (let d of dataPoints) {
          chartData.push(d);
        }
        tmp.data = chartData;
      }

      //判断是否需要多种颜色
      if (chart.type === 'line' || chart.type === 'radar' || sources.length > 1 && chart.type !== 'pie' && chart.type !== 'doughnut') {
        let c = colorsQueue.shift() || [];
        tmp.borderColor = c[0];
        tmp.backgroundColor = c[2];
      } else {
        let colors = randomColorList(tmp.data.length, backgroundClearer[chart.type]);
        tmp.backgroundColor = colors.backgroundColor;
        tmp.hoverBackgroundColor = colors.hoverBackgroundColor;
        if (chart.type !== 'pie' && chart.type !== 'doughnut' && chart.type !== 'polarArea') {
          tmp.borderColor = colors.borderColor;
        } else {
          tmp.borderWidth = 0;
        }
      }

      //如果数据源类型为时间线,则将图表X轴标尺设置为时间类型
      if (source.type === 'time') {
        if (!options.scales) {
          options.scales = {};
        }
        if (!options.scales.xAxes) {
          options.scales.xAxes = [{}];
        }
        let xAxes = options.scales.xAxes[0];
        xAxes.type = 'time';
        let tooltipFormat = 'll';
        if (source.unit === 'hour' || source.unit === 'minute') {
          tooltipFormat = 'lll';
        }

        xAxes.time = _lodash2.default.defaultsDeep({}, xAxes.time, {
          unit: source.unit,
          tooltipFormat
        });
      }
    }
    return res;
  }
}
exports.default = Chart;
Chart.label = 'Chart';
Chart.icon = 'line-chart';
Chart.defaultColumns = 'title type sources createdAt';
Chart.defaultSort = '-sort';
Chart.actions = {
  build: {
    title: 'Build Data',
    sled: 'BuildData',
    style: 'success',
    depends: '_id'
  }
};
Chart.groups = {
  review: {
    title: 'Review'
  }
};
Chart.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  type: {
    label: 'Type',
    type: 'select',
    switch: true,
    default: 'line',
    options: [{
      label: 'Line Chart',
      value: 'line'
    }, {
      label: 'Bar Chart',
      value: 'bar'
    }, {
      label: 'Radar Chart',
      value: 'radar'
    }, {
      label: 'Pie Chart',
      value: 'pie'
    }, {
      label: 'Doughnut Chart',
      value: 'doughnut'
    }, {
      label: 'Polar Area Chart',
      value: 'polarArea'
    }]
  },
  sources: {
    label: 'Chart Source',
    ref: ['ChartSource']
  },
  options: {
    label: 'Options',
    type: Object
  },
  datasets: {
    label: 'Source Options',
    type: Object
  },
  abilities: {
    label: 'Ability',
    ref: ['alaska-user.Ability'],
    optional: true
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  review: {
    type: String,
    cell: false,
    filter: false,
    group: 'review',
    view: 'ChartReview'
  }
};