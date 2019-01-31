import * as _ from 'lodash';
import { Context, Router } from 'alaska-http';
import userService from 'alaska-user';
import Chart from '../../../models/Chart';
import { ChartOptions } from '../../..';

export default function (router: Router) {
  // get chart list by place
  router.get('/chart', async (ctx: Context) => {
    if (!userService.hasAbility(ctx.user, 'admin')) ctx.throw(403);
    let place = ctx.query._place;
    let chart: ChartOptions = ctx.query._chart;
    if (!place && !chart) ctx.throw(400, '_place or _chart is required!');

    if (place) {
      let charts = await Chart.find({ place }).sort(Chart.defaultSort);

      ctx.body = await Promise.all(charts.map((c) => Chart.getChartOption(c, ctx)));
      return;
    }

    // chart
    if (_.isEmpty(chart.series)) ctx.throw(400, 'chart.series is required!');

    ctx.body = [await Chart.getChartOption(chart, ctx)];
  });


  // get chart
  router.get('/chart/:id', async (ctx: Context) => {
    if (!userService.hasAbility(ctx.user, 'admin')) ctx.throw(403);
    let chart = await Chart.findById(ctx.params.id);
    if (!chart) ctx.throw(404);

    ctx.body = await Chart.getChartOption(chart, ctx);
  });
}
