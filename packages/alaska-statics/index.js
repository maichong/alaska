"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const isDirectory = require("is-directory");
const _ = require("lodash");
const collie = require("collie");
const alaska_1 = require("alaska");
const staticCache = require("koa-static-cache");
class StaticsExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        collie(main, 'initStatics', async () => {
            main.debug('initStatics');
            let statics = _.filter(main.config.get('alaska-statics'), (config) => !config.disabled);
            if (!statics.length)
                return;
            statics.forEach((options) => {
                let dir = options.dir;
                if (Path.isAbsolute(dir)) {
                    dir = Path.join(process.cwd(), dir);
                }
                if (!isDirectory.sync(dir))
                    throw new Error(`Static dir is not found: ${dir}`);
                main.debug('statics', options.prefix, '->', dir);
                main.app.use(staticCache(dir, options));
            });
        });
        main.post('initHttp', async () => {
            await main.initStatics();
        });
    }
}
StaticsExtension.after = ['alaska-http'];
exports.default = StaticsExtension;
