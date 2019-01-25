import { Service } from 'alaska';

/**
 * @class UpdateService
 */
class UpdateService extends Service {
  async postInit() {
    const main = this.main;
    const Update = this.sleds && this.sleds.Update;
    if (main.config.get('autoUpdate')) {
      if (!Update) {
        this.debug('Skip auto update, missing alaska-sled');
        return;
      }
      main.pre('ready', async () => {
        //检查更新脚本
        await Update.run();
      });
    }
  }
}

export default new UpdateService({
  id: 'alaska-update'
});
