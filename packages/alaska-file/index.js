"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const FSD = require("fsd");
const alaska_1 = require("alaska");
const File_1 = require("./models/File");
class FileService extends alaska_1.Service {
    constructor(options) {
        super(options);
        this.drivers = {};
        this.resolveConfig().then(() => {
            try {
                this.cache = this.createDriver(this.config.get('cache'));
                let configs = this.config.get('drivers');
                if (!configs)
                    throw new Error('Missing config [alaska-file/drivers]');
                for (let key of _.keys(configs)) {
                    let config = _.assign({}, configs[key]);
                    if (!config.adapter)
                        throw new Error(`Missing config [alaska-file/drivers.${key}.adapter]`);
                    if (!config.adapterOptions)
                        throw new Error(`Missing config [alaska-file/drivers.${key}.adapterOptions]`);
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
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }
    async getFile(id) {
        let idStr = String(id);
        let cache = await this.cache.get(idStr);
        if (cache === false)
            return null;
        if (cache)
            return cache;
        try {
            cache = await File_1.default.findById(id);
        }
        catch (e) { }
        if (!cache)
            cache = false;
        this.cache.set(idStr, cache);
        return cache ? cache : null;
    }
}
exports.default = new FileService({
    id: 'alaska-file'
});
