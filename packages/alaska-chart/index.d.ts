import { Service } from 'alaska';
import { Model } from 'alaska-model';
import Chart from './models/Chart';
import Series from './models/Series';

declare module 'alaska-http' {
  interface Context {
    chart: Chart;
  }
}

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
    series: Series;
  }): Slice<V> | string | number | Promise<Slice<V> | string | number>;
}

export interface ValueParser<V=any, T={}> {
  <K>(input: {
    model: typeof Model;
    record: Model;
    valueField: string;
    slice: Slice<V> & T;
    results: Map<string, Slice<V>>;
    series: Series;
  }): void | Promise<void>;
}

export interface ChartProps {
  place?: string;
  chart?: string;
  filters?: any;
  theme?: string;
}
