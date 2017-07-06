// @flow

import { Sled } from 'alaska';
import ChartSource from '../models/ChartSource';
import ChartData from '../models/ChartData';
import BuildData from './BuildData';

export default class AutoBuild extends Sled {
  async exec() {
    // $Flow  findOne
    let source: ChartSource = await ChartSource.findOne()
      .where('autoBuild').gt(0)
      .where({
        $or: [
          { nextAt: { $lt: new Date() } },
          { nextAt: null }
        ]
      })
      .sort('nextAt');

    if (!source) return;
    source.nextAt = new Date(Date.now() + source.autoBuild);
    await source.save();

    let startDate;

    if (source.type === 'time') {
      //时间轴类型数据源,需要增量构建以优化速度
      // $Flow  findOne
      let lastData: ChartData = await ChartData.findOne({ source }).sort('-x');
      if (lastData) {
        await lastData.remove();
        startDate = lastData.x;
      }
    }
    await BuildData.run({ chartSource: source, startDate });
  }

}
