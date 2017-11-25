// @flow

import alaska, { Sled } from 'alaska';
import AppUpdate from '../models/AppUpdate';

export default class Update extends Sled {
  async exec() {
    const serviceModules = alaska.modules.services[alaska.main.id];
    if (!serviceModules || !serviceModules.updates) return;

    // $Flow
    let records: AppUpdate[] = await AppUpdate.find();
    let recordsMap = {};
    records.forEach((record) => {
      recordsMap[record.key] = record;
    });

    // eslint-disable-next-line
    for (let key in serviceModules.updates) {
      if (recordsMap[key]) continue;

      console.log('Apply update script ', key);

      let mod = serviceModules.updates[key];
      if (!(typeof mod === 'function')) {
        console.log(`Update script "${key}" must export a async function as default!`);
        process.exit();
      }

      await mod();
      await (new AppUpdate({ key })).save();
    }
  }
}
