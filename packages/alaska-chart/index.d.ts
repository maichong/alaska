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
  /**
   * 图表位置，自动加载此位置中所有的图表
   * place、chart、data 三选一
   */
  place?: string;
  /**
   * 图表ID，或图表设置
   * place、chart、data 三选一
   */
  chart?: string | ChartOptions;
  /**
   * EChart设置，如果存在，则直接渲染显示，忽略 place 和 chart，不再自动加载数据
   * place、chart、data 三选一
   */
  data?: echarts.EChartOption;
  /**
   * 自定义数据过滤器
   */
  filters?: any;
  /**
   * EChart皮肤
   */
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
