import * as _ from 'lodash';
import * as FSD from 'fsd';
import { ObjectMap, Service, ServiceOptions } from 'alaska';
import { RecordId } from 'alaska-model';
import LruCacheDriver from 'alaska-cache-lru';
import File from './models/File';
import { FileDriverConfig } from '.';

class FileService extends Service {
  drivers: ObjectMap<FileDriverConfig>;
  cache: LruCacheDriver<File | false>;

  constructor(options: ServiceOptions) {
    super(options);
    this.drivers = {};

    this.resolveConfig().then(() => {
      try {
        this.cache = this.createDriver(this.config.get('cache')) as LruCacheDriver<File | false>;
        let configs: ObjectMap<FileDriverConfig> = this.config.get('drivers');
        if (!configs) throw new Error('Missing config [alaska-file/drivers]');
        for (let key of _.keys(configs)) {
          let config = _.assign({}, configs[key]);
          if (!config.adapter) throw new Error(`Missing config [alaska-file/drivers.${key}.adapter]`);
          if (!config.adapterOptions) throw new Error(`Missing config [alaska-file/drivers.${key}.adapterOptions]`);
          let Adapter = this.main.modules.libraries[config.adapter] || this.error(`Missing adapter library [${config.adapter}]!`);
          config.fsd = FSD({ adapter: new Adapter(config.adapterOptions) });
          if (!config.allowed) {
            config.allowed = [];
          }
          if (typeof config.pathFormat === 'undefined') {
            config.pathFormat = '/YYYY/MM/DD/{ID}.{EXT}';
          }
          if (!config.maxSize) {
            config.maxSize = 10485760;
          }
          this.drivers[key] = config;
        }
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    });
  }

  async getFile(id: RecordId): Promise<File | null> {
    let idStr = String(id);
    let cache: File | false = await this.cache.get(idStr);
    if (cache === false) return null;
    if (cache) return cache;
    try {
      cache = await File.findById(id);
    } catch (e) { }
    if (!cache) cache = false;
    this.cache.set(idStr, cache);
    return cache ? cache : null;
  }
}

export default new FileService({
  id: 'alaska-file'
});
