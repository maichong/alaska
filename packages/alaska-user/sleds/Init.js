"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const RegisterAbility_1 = require("../sleds/RegisterAbility");
const RegisterRole_1 = require("../sleds/RegisterRole");
const Ability_1 = require("../models/Ability");
class Init extends alaska_sled_1.Sled {
    async exec() {
        let tasks = [
            RegisterRole_1.default.run({
                id: 'root',
                title: 'Root',
                abilities: ['admin']
            }),
            RegisterRole_1.default.run({
                id: 'admin',
                title: 'Admin',
                abilities: ['admin']
            }),
            RegisterRole_1.default.run({
                id: 'user',
                title: 'User',
                abilities: ['user']
            }),
            RegisterRole_1.default.run({
                id: 'guest',
                title: 'Guest',
                abilities: []
            }),
            RegisterAbility_1.default.run({
                id: 'user',
                title: 'Authenticated user'
            }),
            RegisterAbility_1.default.run({
                id: 'admin',
                title: 'Admin login'
            }),
            RegisterAbility_1.default.run({
                id: 'root',
                title: 'Root'
            }),
            RegisterAbility_1.default.run({
                id: 'alaska-user.User.update:self',
                title: 'update user self'
            }),
            alaska_settings_1.default.register({
                id: 'user.closeRegister',
                title: 'Close Register',
                service: 'alaska-user',
                type: 'CheckboxFieldView',
            }),
            alaska_settings_1.default.register({
                id: 'user.closeRegisterReason',
                title: 'Close Register Reason',
                service: 'alaska-user',
                type: 'TextFieldView',
            })
        ];
        let res = await Promise.all(tasks);
        let root = res[0];
        const rootAbilities = _.clone(root.abilities);
        let abilities = _.keyBy(await Ability_1.default.find(), 'id');
        for (let serviceId of Object.keys(this.service.main.modules.services)) {
            const { service } = this.service.main.modules.services[serviceId];
            if (!service.models)
                continue;
            for (let modelName of Object.keys(service.models)) {
                let Model = service.models[modelName];
                let ability = `${Model.id}.`;
                const registerAbility = async (action) => {
                    if (action === 'add')
                        return;
                    let id = ability + action;
                    if (rootAbilities.indexOf(id) < 0) {
                        rootAbilities.push(id);
                    }
                    if (['read', 'create', 'remove', 'update'].includes(action) && Model.fields.user) {
                        let userAbility = `${id}:user`;
                        if (!abilities[userAbility]) {
                            await RegisterAbility_1.default.run({
                                id: userAbility,
                                title: `${action} own ${Model.modelName}`
                            });
                        }
                    }
                    if (abilities[id])
                        return;
                    await RegisterAbility_1.default.run({
                        id,
                        title: `${action} all ${Model.modelName}`
                    });
                };
                await Promise.all(['read', 'create', 'remove', 'update', 'export'].map(registerAbility));
                await Promise.all(_.keys(Model.actions).map(registerAbility));
            }
        }
        ['root', 'admin', 'user'].forEach((a) => {
            if (!rootAbilities.includes(a)) {
                rootAbilities.push(a);
            }
        });
        if (!_.isEqual(root.abilities, rootAbilities)) {
            root.abilities = rootAbilities;
            await root.save();
        }
    }
}
exports.default = Init;
