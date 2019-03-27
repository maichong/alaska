"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const _ = require("lodash");
const FSD = require("fsd");
class ImageService extends alaska_1.Service {
    constructor(options) {
        super(options);
        this.drivers = {};
        this.resolveConfig().then(() => {
            try {
                let configs = this.config.get('drivers');
                if (!configs)
                    throw new Error('Missing config [alaska-image:drivers]');
                for (let key of _.keys(configs)) {
                    let config = _.assign({}, configs[key]);
                    if (!config.adapter)
                        throw new Error(`Missing config [alaska-image:drivers.${key}.adapter]`);
                    if (!config.adapterOptions)
                        throw new Error(`Missing config [alaska-image:drivers.${key}.adapterOptions]`);
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
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }
}
exports.default = new ImageService({
    id: 'alaska-image'
});
