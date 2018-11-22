import { Sled } from 'alaska-sled';
import AppUpdate from '../models/AppUpdate';
import { UpdateServiceModules } from '..';

export default class Update extends Sled<void, void> {
  async exec() {
    const { modules } = this.service.main;
    const serviceModules: UpdateServiceModules = modules.services[this.service.main.id];
    if (!serviceModules || !serviceModules.updates) return;

    let records: AppUpdate[] = await AppUpdate.find();
    let recordsMap: { [key: string]: AppUpdate } = {};
    records.forEach((record) => {
      recordsMap[record.key] = record;
    });

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
