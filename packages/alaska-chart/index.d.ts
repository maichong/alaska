import { Service } from 'alaska';
import { Model } from 'alaska-model';
import Chart from './models/Chart';
import Series from './models/Series';

export class ChartService extends Service {
  models: {
    Chart: typeof Chart;
  };
  keyParsers: Map<string, KeyParser>;
  valueParsers: Map<string, ValueParser>;
}

declare const chartService: ChartService;

export default chartService;

export interface Slice<V> {
  key: string;
  keySort: any;
  value?: V;
  result: any[];
}

export interface KeyParser<V=any> {
  (input: {
    model: typeof Model;
    record: Model;
    keyField: string;
    results: Map<string, Slice<V>>;
    series: SeriesOptions;
  }): Slice<V> | string | number | Promise<Slice<V> | string | number>;
}

export interface ValueParser<V=any, T={}> {
  <K>(input: {
    model: typeof Model;
    record: Model;
    valueField: string;
    slice: Slice<V> & T;
    results: Map<string, Slice<V>>;
    series: SeriesOptions;
  }): void | Promise<void>;
}

export interface ChartProps {
  place?: string;
  chart?: string | ChartOptions;
  filters?: any;
  theme?: string;
}

export interface SeriesOptions {
  title?: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'effectScatter' | 'radar' | 'heatmap' | 'map' | 'funnel' | 'gauge';
  coordinateSystem?: 'grid' | 'polar' | 'geo';
  keyAxisType: 'time' | 'cycle' | 'category' | 'value';
  keyParser: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | string;
  valueParser?: 'count' | 'sum' | 'average' | 'min' | 'max' | string;
  source: string;
  keyAxis: string;
  valueAxis?: string;
  precision?: number;
  limit?: number;
  sort?: 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc';
  options?: echarts.EChartOption.Series;
  filters?: any;
}

export interface ChartOptions {
  title?: string;
  reverse?: boolean;
  series: SeriesOptions[];
  options?: echarts.EChartOption;
}
