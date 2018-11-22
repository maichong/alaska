import { Service } from 'alaska';
import Update from './sleds/Update';
/**
 * @class UpdateService
 */
class UpdateService extends Service {
  async postInit() {
    let MAIN = this.main;
    if (MAIN.config.get('autoUpdate')) {
      MAIN.pre('ready', async () => {
        //检查更新脚本
        await Update.run();
      });
    }
  }
}

export default new UpdateService({
  id: 'alaska-update'
});
