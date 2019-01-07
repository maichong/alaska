import { Service } from 'alaska';
import Chart from './models/Chart';

declare module 'alaska-http' {
  interface Context {
    chart: Chart;
  }
}

export class ChartService extends Service {
  models: {
    Chart: typeof Chart;
  };
}

declare const chartService: ChartService;

export default chartService;
