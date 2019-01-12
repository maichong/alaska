import * as _ from 'lodash';
import { Model, Filters } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import Series from './Series';
import chartService, { Slice, KeyParser, ValueParser } from '..';

export default class Chart extends Model {
  static label = 'Chart';
  static icon = 'line-chart';
  static defaultColumns = 'title sort createdAt';
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
    createdAt: {
      label: 'Created At',
      type: Date
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
  reverse: boolean;
  series: Series[];
  createdAt: Date;
  options?: echarts.EChartOption;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async getSeriesData(series: Series, filters?: Filters): Promise<any[]> {
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

    if (this.reverse) {
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
}
