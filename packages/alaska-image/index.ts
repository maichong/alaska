import * as _ from 'lodash';
import * as FSD from 'fsd';
import { Service, ObjectMap, ServiceOptions } from 'alaska';
import { RecordId } from 'alaska-model';
import LruCacheDriver from 'alaska-cache-lru';
import Image from './models/Image';
import { ImageDriverConfig } from '.';

class ImageService extends Service {
  drivers: ObjectMap<ImageDriverConfig>;
  cache: LruCacheDriver<Image | false>;

  constructor(options: ServiceOptions) {
    super(options);
    this.drivers = {};

    this.resolveConfig().then(() => {
      this.cache = this.createDriver(this.config.get('cache')) as LruCacheDriver<Image | false>;
      try {
        let configs: ObjectMap<ImageDriverConfig> = this.config.get('drivers');
        if (!configs) throw new Error('Missing config [alaska-image/drivers]');
        for (let key of _.keys(configs)) {
          let config = _.assign({}, configs[key]);
          if (!config.adapter) throw new Error(`Missing config [alaska-image/drivers.${key}.adapter]`);
          if (!config.adapterOptions) throw new Error(`Missing config [alaska-image/drivers.${key}.adapterOptions]`);
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
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    });
  }

  async getImage(id: RecordId): Promise<Image | null> {
    let idStr = String(id);
    let cache: Image | false = await this.cache.get(idStr);
    if (cache === false) return null;
    if (cache) return cache;
    try {
      cache = await Image.findById(id);
    } catch (e) { }
    if (!cache) cache = false;
    this.cache.set(idStr, cache);
    return cache ? cache : null;
  }
}

export default new ImageService({
  id: 'alaska-image'
});
