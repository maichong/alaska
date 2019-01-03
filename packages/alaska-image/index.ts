import { Service, ObjectMap, ServiceOptions } from 'alaska';
import * as _ from 'lodash';
import * as FSD from 'fsd';
import { ImageDriverConfig } from '.';

class ImageService extends Service {
  drivers: ObjectMap<ImageDriverConfig>;

  constructor(options: ServiceOptions) {
    super(options);
    this.drivers = {};

    this.resolveConfig().then(() => {
      let configs: ObjectMap<ImageDriverConfig> = this.config.get('drivers');
      if (!configs) throw new Error('Missing config [alaska-image:drivers]');
      for (let key of _.keys(configs)) {
        let config = _.assign({}, configs[key]);
        if (!config.adapter) throw new Error(`Missing config [alaska-image:drivers.${key}.adapter]`);
        if (!config.adapterOptions) throw new Error(`Missing config [alaska-image:drivers.${key}.adapterOptions]`);
        let Adapter = this.main.modules.libraries[config.adapter] || this.error(`Missing adapter library [${config.adapter}]!`);
        config.fsd = FSD({ adapter: new Adapter(config.adapterOptions) });
        if (!config.allowed) {
          config.allowed = ['jpg', 'png', 'webp', 'gif', 'svg'];
        }
        if (typeof config.pathFormat === 'undefined') {
          config.pathFormat = '/YYYY/MM/DD/{ID}.{EXT}';
        }
        if (!config.maxSize) {
          config.maxSize = 5242880;
        }
        this.drivers[key] = config;
      }
    });
  }
}

export default new ImageService({
  id: 'alaska-image'
});
