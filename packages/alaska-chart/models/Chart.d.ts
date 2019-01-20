import * as echarts from 'echarts';
import { Model, Filters } from 'alaska-model';
import { Context } from 'alaska-http';
import Series from './Series';

declare class Chart extends Model {
  /**
   * 导出当前图表的选项设置
   * @param {Context} [ctx] 可选Context，如果不传入，则代表不自动检查权限
   * @param {Filters} [filters] 可选过滤器
   */
  getChartOption(ctx?: Context, filters?: Filters): Promise<echarts.EChartOption>;

  /**
   * 统计某个数据列
   * @param {Series} series 数据列对象
   * @param {Filters} [filters] 可选过滤器
   */
  getSeriesData(series: Series, filters?: Filters): Promise<any[]>;
}

interface Chart extends ChartFields { }

export interface ChartFields {
  title: string;
  place: string;
  reverse: boolean;
  series: Series[];
  createdAt: Date;
  sort: number;
  options?: echarts.EChartOption;
}

export default Chart;
