import * as echarts from 'echarts';
import { Model, Filters } from 'alaska-model';
import { Context } from 'alaska-http';
import { ChartOptions, SeriesOptions } from '..';

declare class Chart extends Model {
  /**
   * 导出当前图表的选项设置
   * @param {ChartOptions} chart 图表设置或图表记录
   * @param {Context} [ctx] 可选Context，如果不传入，则代表不自动检查权限
   * @param {Filters} [filters] 可选过滤器
   */
  static getChartOption(chart?: ChartOptions, ctx?: Context, filters?: Filters): Promise<echarts.EChartOption>;

  /**
   * 统计某个数据列
   * @param {ChartOptions} chart 图表设置或图表记录
   * @param {Series} series 数据列对象
   * @param {Filters} [filters] 可选过滤器
   */
  static getSeriesData(chart: ChartOptions, series: SeriesOptions, filters?: Filters): Promise<any[]>;
}

interface Chart extends ChartFields { }

interface ChartFields extends ChartOptions {
  place: string;
  createdAt: Date;
  sort: number;
}

export default Chart;
