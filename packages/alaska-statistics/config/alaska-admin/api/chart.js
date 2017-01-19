//@flow

import Chart from '../../../models/Chart';

export default async function (ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  //abilities
  let id = ctx.query.id || ctx.error(404);
  // $Flow  findById
  let chart: Chart = await Chart.findById(id);

  if (!chart) ctx.error(404);

  if (chart.abilities) {
    for (let ability of chart.abilities) {
      // $Flow ability Object string
      await ctx.checkAbility(ability);
    }
  }

  ctx.body = await chart.getData(ctx);
}
