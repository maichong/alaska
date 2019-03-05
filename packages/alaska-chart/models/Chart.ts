import * as _ from 'lodash';
import * as echarts from 'echarts';
import { Model, Filters } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import Series from './Series';
import chartService, { Slice, KeyParser, ValueParser, SeriesOptions, ChartOptions } from '..';
import { Context } from 'alaska-http';
import userService from 'alaska-user';

export default class Chart extends Model {
  static label = 'Chart';
  static icon = 'line-chart';
  static defaultColumns = 'title place sort createdAt';
  static defaultSort = '-sort';

  static groups = {
    series: {
      title: 'Series',
      panel: false
    },
    review: {
      panel: false
    }
  };

  static api = {
  };

  static fields = {
    title: {
      label: 'Chart Title',
      type: String,
      required: true
    },
    place: {
      label: 'Place',
      type: String
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    sort: {
      label: 'Sort',
      type: Number
    },
    reverse: {
      label: 'Reverse',
      type: Boolean
    },
    options: {
      label: 'Chart Options',
      type: Object
    },
    series: {
      label: 'Series',
      type: 'subdoc',
      ref: Series,
      multi: true,
      group: 'series'
    },
    chartPreview: {
      type: String,
      view: 'ChartReview',
      group: 'review'
    }
  };

  title: string;
  place: string;
  reverse: boolean;
  series: Series[];
  createdAt: Date;
  sort: number;
  options?: echarts.EChartOption;

  /**
   * 导出当前图表的选项设置
   * @param {ChartOptions} chart 图表设置或图表记录
   * @param {Context} [ctx] 可选Context，如果不传入，则代表不自动检查权限
   * @param {Filters} [filters] 可选过滤器
   */
  static async getChartOption(chart?: ChartOptions, ctx?: Context, filters?: Filters): Promise<echarts.EChartOption> {
    const xAxis = chart.reverse ? 'yAxis' : 'xAxis';
    const yAxis = chart.reverse ? 'xAxis' : 'yAxis';

    let echartOption: echarts.EChartOption = _.defaultsDeep({
      title: {
        text: chart.title || '',
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: []
      },
      [xAxis]: {},
      [yAxis]: {
        type: 'value'
      },
      series: []
    }, chart.options);

    for (let s of chart.series || []) {
      let modelId = s.source;
      let model = Model.lookup(modelId);
      if (!model) continue;

      if (ctx && !ctx.state.ignoreAuthorization) {
        let abliityFilters = await userService.createFilters(ctx.user, `${model.id}.read`);
        if (!abliityFilters) continue;
        let userFilters = await model.createFiltersByContext(ctx);
        filters = mergeFilters(filters, abliityFilters, userFilters);
      }

      // @ts-ignore
      echartOption.legend.data.push(s.title);
      let series: echarts.EChartOption.Series = s.options || {};
      series.type = s.type;
      // @ts-ignore
      series.name = s.title;
      // @ts-ignore
      series.data = await Chart.getSeriesData(chart, s, filters);
      let xAxisType: echarts.EChartOption.BasicComponents.CartesianAxis.Type;
      switch (s.keyAxisType) {
        case 'time':
          xAxisType = 'time';
          break;
        case 'cycle':
        case 'category':
          xAxisType = 'category';
          break;
        case 'value':
          xAxisType = 'value';
          break;
      }
      let xAxisOption = echartOption[xAxis];
      if (Array.isArray(xAxisOption)) {
        // @ts-ignore
        let index = series.xAxisIndex || 0;
        xAxisOption = xAxisOption[index] || xAxisOption[0];
        if (xAxisOption) {
          xAxisOption.type = xAxisType;
        }
      } else {
        xAxisOption.type = xAxisType;
      }

      echartOption.series.push(series);
    }
    return echartOption;
  }

  /**
   * 统计某个数据列
   * @param {ChartOptions} chart 图表设置或图表记录
   * @param {Series} series 数据列对象
   * @param {Filters} [filters] 可选过滤器
   */
  static async getSeriesData(chart: ChartOptions, series: SeriesOptions, filters?: Filters): Promise<any[]> {
    if (!series.keyAxis) return [];
    let keyParser: KeyParser = chartService.keyParsers.get(series.keyParser);
    let valueParser: ValueParser = chartService.valueParsers.get(series.valueParser);
    if (!keyParser || !valueParser) return [];

    let model = Model.lookup(series.source);
    if (!model) return [];

    let results: Map<string, Slice<any>> = new Map();

    if (series.filters && filters) {
      filters = mergeFilters(series.filters, filters);
    } else {
      filters = filters || series.filters;
    }

    await model.find(filters).select(`_id ${series.keyAxis} ${series.valueAxis || ''}`).cursor().eachAsync(async (record) => {
      let key = await keyParser({ model, record, results, series, keyField: series.keyAxis });
      let slice: Slice<any>;
      if (key && typeof key === 'object' && key.result && key.key) {
        slice = key;
      } else {
        slice = results.get(String(key));
        if (!slice) {
          slice = { keySort: record.get(series.keyAxis) || key, key: String(key), result: [key] };
          results.set(String(key), slice);
        }
      }
      await valueParser({ model, record, results, series, valueField: series.valueAxis, slice });
    });

    let data: Slice<any>[] = [];
    results.forEach((slice) => {
      data.push(slice);
    });

    if (series.keyAxisType === 'category') {
      switch (series.sort) {
        case 'key-asc':
          data = _.orderBy(data, ['keySort'], ['asc']);
          break;
        case 'key-desc':
          data = _.orderBy(data, ['keySort'], ['desc']);
          break;
        case 'value-asc':
          data = _.orderBy(data, ['value'], ['asc']);
          break;
        case 'value-desc':
          data = _.orderBy(data, ['value'], ['desc']);
          break;
      }

      if (series.limit) {
        data = _.slice(data, 0, series.limit);
      }
    }

    if (chart.reverse) {
      return data.map((slice) => {
        if (series.type === 'pie') {
          return { value: slice.key, name: slice.value };
        }
        return (Array.isArray(slice.value) ? slice.value : [slice.value]).concat(slice.result);
      });
    }

    return data.map((slice) => {
      if (series.type === 'pie') {
        return { name: slice.key, value: slice.value };
      }
      return slice.result.concat(slice.value);
    });
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
