import * as _ from 'lodash';
import { Service } from 'alaska';
import LockDriver from 'alaska-lock';
import AppUpdate from './models/AppUpdate';
import { UpdateServiceModules } from '.';

/**
 * @class UpdateService
 */
class UpdateService extends Service {
  async postInit() {
    const me = this;
    const main = this.main;
    if (main.config.get('autoUpdate')) {
      main.pre('ready', async () => {
        //检查更新脚本
        await me.update();
      });
    }
  }

  async update() {
    const { modules } = this.main;
    const serviceModules: UpdateServiceModules = modules.services[this.main.id];
    if (!serviceModules || _.isEmpty(serviceModules.updates)) return;
    let locker: LockDriver;
    let lock = this.config.get('lock');
    if (lock) {
      locker = this.createDriver(lock) as LockDriver;
      await locker.lock();
    }

    let records: AppUpdate[] = await AppUpdate.find();
    let recordsMap: { [key: string]: AppUpdate } = {};
    records.forEach((record) => {
      recordsMap[record.key] = record;
    });

    for (let key in serviceModules.updates) {
      if (recordsMap[key]) continue;

      console.log('Apply update script', key);
      let mod = serviceModules.updates[key];
      if (!(typeof mod === 'function')) {
        console.log(`Update script "${key}" must export a async function as default!`);
        if (locker) {
          await locker.unlock();
        }
        process.exit(1);
      }

      await mod();
      await (new AppUpdate({ key })).save();
    }

    if (locker) {
      await locker.unlock();
      locker.free();
    }
  }
}

export default new UpdateService({
  id: 'alaska-update'
});
