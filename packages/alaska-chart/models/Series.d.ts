import * as echarts from 'echarts';
import { Model } from 'alaska-model';

declare class Series extends Model { }
interface Series extends SeriesFields { }

export interface SeriesFields {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'effectScatter' | 'radar' | 'heatmap' | 'map' | 'funnel' | 'gauge';
  coordinateSystem: 'grid' | 'polar' | 'geo';
  keyAxisType: 'time' | 'cycle' | 'category' | 'value';
  keyParser: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | string;
  valueParser: 'count' | 'sum' | 'average' | 'min' | 'max' | string;
  source: string;
  keyAxis: string;
  valueAxis?: string;
  precision?: number;
  limit?: number;
  sort?: 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc';
  options?: echarts.EChartOption.Series;
  filters?: any;
}

export default Series;
