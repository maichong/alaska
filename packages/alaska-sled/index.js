"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const sled_1 = require("./sled");
exports.Sled = sled_1.default;
const debug_1 = require("./debug");
exports.BEFORE = function BEFORE(serviceId, hook) {
    hook._before = serviceId;
};
exports.AFTER = function AFTER(serviceId, hook) {
    hook._after = serviceId;
};
function setSledDefaults(sled, service, name) {
    if (!sled.service)
        sled.service = service;
    if (!sled.sledName)
        sled.sledName = name;
    if (!sled.id)
        sled.id = `${service.id}.${name}`;
}
class SledExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        sled_1.default.main = main;
        _.forEach(main.modules.services, (s) => {
            let service = s.service;
            service.sleds = {};
            _.forEach(s.sleds, (sled, name) => {
                service.sleds[name] = sled;
                setSledDefaults(sled, service, name);
            });
            _.forEach(s.plugins, (plugin, pluginName) => {
                _.forEach(plugin.sleds, (settings, name) => {
                    if (!settings) {
                        throw new Error(`Invalid sled settings [${pluginName}/sled/${name}]`);
                    }
                    if (typeof settings === 'function') {
                        if (settings.classOfSled) {
                            service.sleds[name] = settings;
                        }
                        else {
                            service.sleds[name] = settings(service.sleds[name]);
                            if (!service.models[name] || !service.models[name].classOfModel) {
                                throw new Error(`Sled generator should return a Sled class [${pluginName}/sleds/${name}]`);
                            }
                            setSledDefaults(service.sleds[name], service, name);
                            return;
                        }
                    }
                    let sled = service.sleds[name];
                    if (!sled)
                        throw new Error(`Can not apply sled settings, ${service.id}.${name} not found!`);
                    let { pre, post } = settings;
                    if (pre) {
                        if (!pre._id)
                            pre._id = plugin.id;
                        sled.pre(pre);
                    }
                    if (post) {
                        if (!post._id)
                            post._id = plugin.id;
                        sled.post(post);
                    }
                });
            });
        });
        main.pre('start', async () => {
            for (let [sid, service] of main.allServices) {
                let Init = service.sleds.Init;
                if (!Init)
                    continue;
                debug_1.default(sid, 'Init');
                await Init.run();
            }
        });
    }
}
SledExtension.after = ['alaska-model'];
exports.default = SledExtension;
