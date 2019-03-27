"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const alaska_1 = require("alaska");
class RoutesExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        let inited = [];
        _.forEach(main.modules.services, (s) => {
            let service = s.service;
            collie(service, 'initRoutes', async () => {
                service.debug('initRoutes');
                inited.push(service.id);
                let prefix = service.config.get('prefix');
                if (prefix === false)
                    return;
                _.forEach(s.plugins, (plugin) => {
                    _.forEach(plugin.routes, (route) => {
                        route(main.getRouter(prefix));
                    });
                });
                _.forEach(s.routes, (route) => {
                    route(main.getRouter(prefix));
                });
                for (let [id, sub] of service.services) {
                    if (inited.includes(id))
                        continue;
                    await sub.initRoutes();
                }
            });
        });
        main.post('initHttp', async () => {
            await main.initRoutes();
        });
    }
}
RoutesExtension.after = ['alaska-http'];
exports.default = RoutesExtension;
