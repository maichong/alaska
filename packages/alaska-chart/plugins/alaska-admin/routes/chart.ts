import * as _ from 'lodash';
import { Context, Router } from 'alaska-http';
import userService from 'alaska-user';
import Chart from '../../../models/Chart';

export default function (router: Router) {
  // get chart list by place
  router.get('/chart', async (ctx: Context) => {
    if (!userService.hasAbility(ctx.user, 'admin')) ctx.throw(403);
    let place = ctx.query._place || ctx.throw(400, '_place is required');

    let charts = await Chart.find({ place }).sort(Chart.defaultSort);

    ctx.body = await Promise.all(charts.map((chart) => chart.getChartOption(ctx)));
  });


  // get chart
  router.get('/chart/:id', async (ctx: Context) => {
    if (!userService.hasAbility(ctx.user, 'admin')) ctx.throw(403);
    let chart = await Chart.findById(ctx.params.id);
    if (!chart) ctx.throw(404);

    ctx.body = await chart.getChartOption(ctx);
  });
}
