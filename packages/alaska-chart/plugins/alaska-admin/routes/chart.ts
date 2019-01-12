import * as Router from 'koa-router';
import * as _ from 'lodash';
import { Context } from 'alaska-http';
import { Model } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import adminService from 'alaska-admin';
import userService from 'alaska-user';
import Chart from '../../../models/Chart';
import * as echarts from 'echarts/lib/echarts';

export default function (router: Router) {
  router.get('/chart/:id', async (ctx: Context) => {
    if (!userService.hasAbility(ctx.user, 'admin')) ctx.throw(403);
    let chart = await Chart.findById(ctx.params.id);
    if (!chart) ctx.throw(404);

    const xAxis = chart.reverse ? 'yAxis' : 'xAxis';
    const yAxis = chart.reverse ? 'xAxis' : 'yAxis';

    let echartOption: echarts.EChartOption = _.defaultsDeep({
      title: {
        text: chart.title,
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

    for (let s of chart.series) {
      let modelId = s.source;
      let model = Model.lookup(modelId);
      if (!model) continue;

      let abliityFilters = await userService.createFilters(ctx.user, model.id + '.read');
      if (!abliityFilters) continue;
      let userFilters = await model.createFiltersByContext(ctx);

      // @ts-ignore
      echartOption.legend.data.push(s.title);
      let series: echarts.EChartOption.Series = s.options || {};
      series.type = s.type;
      // @ts-ignore
      series.name = s.title;
      // @ts-ignore
      series.data = await chart.getSeriesData(s, mergeFilters(abliityFilters, userFilters));
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
    ctx.body = echartOption;
  });
}
