"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const RegisterNav_1 = require("./RegisterNav");
const RegisterMenu_1 = require("./RegisterMenu");
const AdminMenu_1 = require("../models/AdminMenu");
class Init extends alaska_sled_1.Sled {
    async exec() {
        RegisterNav_1.default.run({
            id: 'default',
            label: 'Default',
            ability: 'admin',
            activated: true
        });
        RegisterMenu_1.default.run({
            id: 'admin.settings',
            label: 'Settings',
            icon: 'cogs',
            type: 'link',
            link: '/settings',
            ability: 'alaska-settings.Settings.update',
            service: 'alaska-settings',
            activated: true
        });
        alaska_settings_1.default.register({
            id: 'adminLogo',
            title: 'Admin Logo',
            service: 'alaska-admin',
            type: 'ImageFieldView'
        });
        alaska_settings_1.default.register({
            id: 'adminLoginLogo',
            title: 'Admin Login Logo',
            service: 'alaska-admin',
            type: 'ImageFieldView'
        });
        alaska_settings_1.default.register({
            id: 'adminIcon',
            title: 'Admin Icon',
            service: 'alaska-admin',
            type: 'ImageFieldView'
        });
        alaska_settings_1.default.register({
            id: 'adminCopyright',
            title: 'Admin Copyright',
            service: 'alaska-admin',
            type: 'TextFieldView',
            value: 'Powered By Alaska'
        });
        let menus = _.reduce(await AdminMenu_1.default.find(), (res, menu) => {
            res[menu.id] = menu;
            return res;
        }, {});
        for (let serviceId of Object.keys(this.service.main.modules.services)) {
            const { service } = this.service.main.modules.services[serviceId];
            if (!service.models)
                continue;
            for (let modelName of Object.keys(service.models)) {
                let Model = service.models[modelName];
                if (Model.hidden) {
                    continue;
                }
                let id = `model.${Model.service.id}.${Model.key}`.toLowerCase();
                if (menus[id]) {
                    continue;
                }
                let ability = `${Model.id}.`;
                await RegisterMenu_1.default.run({
                    id,
                    label: Model.label,
                    icon: Model.icon,
                    type: 'link',
                    link: `/list/${serviceId}/${Model.modelName}`,
                    ability: `${ability}read`,
                    service: serviceId,
                    activated: true
                }).catch((e) => console.error(e.stack));
            }
        }
    }
}
exports.default = Init;
