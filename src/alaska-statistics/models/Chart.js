// @flow

import _ from 'lodash';
import moment from 'moment';
import Color from 'color';
import { Model } from 'alaska';
import random from 'number-random';
import type { ChartType, ChartData, ChartPoint, ChartDataSets, ChartOptions } from 'chart.js';
import service from '../';
import ChartDataModel from './ChartData';
import ChartSource from './ChartSource';

const monthLabels = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'Aguest',
  'September', 'October', 'November', 'December'];
const weekLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const quarterLabels = ['', 'Spring', 'Summer', 'Autumn', 'Winter'];

const backgroundClearer = {
  line: 0.8,
  bar: 0.8
};

function randomColor(): Color {
  let h = random(2, 30) + [0, 120, 240][random(0, 2)];
  let s = random(40, 90);
  let l = random(30, 70);
  return new Color(`hsl(${h},${s}%,${l}%)`);
}

function randomColorList(count, lighten): {
  backgroundColor: string[],
  hoverBackgroundColor: string[],
  borderColor: string[],
  queue: Array<[string, string, string]>
} {
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
    list.push(new Color(color.rgb()));
    color.rotate(rotate);
  }
  list.sort(() => (Math.random() > 0.5 ? 1 : -1)).forEach((c) => {
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

function getCycleLabel(x: string, unit: string): string {
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

export default class Chart extends Model<Chart> {
  static label = 'Chart';
  static icon = 'line-chart';
  static defaultColumns = 'title type sources createdAt';
  static defaultSort = '-sort';

  static actions = {
    build: {
      title: 'Build Data',
      sled: 'BuildData',
      style: 'success',
      depends: '_id'
    }
  };

  static groups = {
    review: {
      title: 'Review'
    }
  };

  static fields = {
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
      view: 'ChartReview',
    }
  };
  title: string;
  type: ChartType;
  sources: Object[];
  options: ChartOptions;
  datasets: { [id: string]: ChartDataSets };
  abilities: Object[];
  createdAt: Date;
  review: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async getData(ctx: Alaska$Context) {
    const t = ctx ? ctx.t : (str) => service.t(str);
    let chart: Chart = this;
    let options: ChartOptions = _.defaultsDeep({
      responsive: true
    }, chart.options);

    let res: {
      type: ChartType,
      data: ChartData,
      options: ChartOptions
    } = {
      type: chart.type,
      data: {
        datasets: [],
        labels: []
      },
      options
    };

    let datasets: ChartDataSets[] = res.data.datasets;
    let labels: string[] = res.data.labels;

    let datasetsConfigs = chart.datasets || {};

    if (!options.title) {
      options.title = {};
    }
    if (!options.title.text) {
      options.title.text = chart.title;
    }

    let sources: ChartSource[] = [];
    if (chart.populated('sources')) {
      sources = chart.sources;
    } else if (_.size(chart.sources)) {
      //不使用in查询,牺牲性能为了保证数据源顺序
      for (let id of chart.sources) {
        // $Flow  findById
        let tmp: ChartSource = await ChartSource.findById(id);
        sources.push(tmp);
      }
    }

    let colorMap = {};
    let colorsQueue = randomColorList(30, backgroundClearer[chart.type]).queue;

    for (let source of sources) {
      let query = ChartDataModel.find({ source: source._id }).select('x y');
      if (source.type === 'cycle' || source.type === 'time') {
        query.sort('x');
      } else if (source.sort) {
        query.sort(source.sort);
      }
      if (source.limit) {
        if (source.type === 'time') {
          query.where('x').gte(moment().subtract(source.limit, source.unit + 's').toDate());
        } else {
          query.limit(source.limit);
        }
      }
      // $Flow  find
      let dataRecords: ChartDataModel[] = await query;
      let dataPoints: ChartPoint[] = [];
      //填充0
      if (chart.type === 'line' && source.type === 'time' && dataRecords.length) {
        let dataMap = {};
        for (let d of dataRecords) {
          let key = d.x.getTime().toString();
          dataMap[key] = d.y;
        }
        let start = moment(dataRecords[0].x);
        let end = dataRecords[dataRecords.length - 1].x;
        if (source.limit) {
          end = moment(start).add(source.limit, source.unit + 's');
        }
        while (!start.isAfter(end)) {
          let key = start.valueOf().toString();
          if (!dataMap[key]) {
            dataMap[key] = 0;
          }
          start.add(1, source.unit + 's');
        }
        dataPoints = Object.keys(dataMap).sort().map((xx) => {
          let y = dataMap[xx];
          let x = new Date(parseInt(xx));
          return { x, y };
        });
      }
      let tmp: ChartDataSets = _.defaultsDeep({}, datasetsConfigs[source.id], {
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
        let backgroundColors: string[] = [];
        let hoverBackgroundColors: string[] = [];
        let borderColors: string[] = [];
        let chartData: number[] = [];
        for (let d: ChartDataModel of dataRecords) {
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
              let c: [string, string, string] = colorsQueue.shift();
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
        let chartData: ChartPoint[] = [];
        for (let d of dataPoints) {
          chartData.push(d);
        }
        tmp.data = chartData;
      }

      //判断是否需要多种颜色
      if (chart.type === 'line' || chart.type === 'radar' ||
        (sources.length > 1 && chart.type !== 'pie' && chart.type !== 'doughnut')) {
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

        xAxes.time = _.defaultsDeep({}, xAxes.time, {
          unit: source.unit,
          tooltipFormat
        });
      }
    }
    return res;
  }
}
