//@flow

import Chart from '../../../models/Chart';

export default async function (ctx) {
  await ctx.checkAbility('admin');
  //abilities
  let id = ctx.query.id || ctx.error(404);

  let chart = await Chart.findById(id);

  if (!chart) ctx.error(404);

  if (chart.abilities) {
    for (let ability of chart.abilities) {
      await ctx.checkAbility(ability);
    }
  }

  ctx.body = await chart.getData(ctx);
}
