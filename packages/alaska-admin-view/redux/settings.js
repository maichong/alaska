"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const redux_actions_1 = require("redux-actions");
const effects_1 = require("redux-saga/effects");
const tr = require("grackle");
const api_1 = require("../utils/api");
const user_1 = require("./user");
exports.APPLY_SETTINGS = 'APPLY_SETTINGS';
exports.REFRESH_SETTINGS = 'REFRESH_SETTINGS';
exports.LOCALE_SETTING = 'LOCALE_SETTING';
const INITIAL_STATE = {
    authorized: false,
    user: null,
    icon: '',
    logo: '',
    loginLogo: '',
    copyright: '',
    superMode: false,
    locale: '',
    locales: {},
    services: {},
    models: {},
    abilities: {},
    navItems: [],
    menuItems: []
};
exports.applySettings = redux_actions_1.createAction(exports.APPLY_SETTINGS);
exports.refreshSettings = redux_actions_1.createAction(exports.REFRESH_SETTINGS);
exports.localeSetting = redux_actions_1.createAction(exports.LOCALE_SETTING, (locale) => ({ locale }));
exports.default = redux_actions_1.handleActions({
    APPLY_SETTINGS: (state, action) => {
        let settings = action.payload;
        tr.setLocale(settings.locale);
        _.forEach(settings.locales, (langGroup, serviceId) => {
            tr.learn(langGroup, serviceId === 'alaska-admin' ? '' : serviceId);
        });
        return settings;
    },
    LOCALE_SETTING: (state, action) => {
        let locale = action.payload.locale;
        tr.setLocale(locale);
        return Object.assign({}, state, { locale });
    },
    LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
function* settingsSaga() {
    try {
        let settings = yield api_1.default.get('/settings');
        settings.models = {};
        _.forEach(settings.services, (service) => {
            _.forEach(service.models, (model, modelName) => {
                settings.models[model.id] = model;
                for (let key of Object.keys(model.actions)) {
                    if (model.actions[key]) {
                        model.actions[key].key = key;
                    }
                }
                if (model && model.fields) {
                    model.serviceId = service.id;
                    model.abilities = {};
                    let ability = `${model.id}.`;
                    _.forEach(settings.abilities, (can, key) => {
                        if (key.indexOf(ability) !== 0)
                            return;
                        let name = key.substr(ability.length);
                        model.abilities[name] = can;
                    });
                }
                function checkAbility(action) {
                    if (!model.abilities[action])
                        return false;
                    return true;
                }
                model.canCreate = !model.nocreate && checkAbility('create');
                model.canUpdate = !model.noupdate && checkAbility('update');
                model.canRemove = !model.noremove && checkAbility('remove');
                model.canUpdateRecord = function (record) {
                    if (model.canUpdate)
                        return true;
                    if (model.noupdate)
                        return false;
                    if (!model.abilities.update)
                        return false;
                    return true;
                };
                model.canRemoveRecord = function (record) {
                    if (model.canRemove)
                        return true;
                    if (model.noremove)
                        return false;
                    if (!model.abilities.remove)
                        return false;
                    return true;
                };
            });
        });
        yield effects_1.put(exports.applySettings(settings));
        yield effects_1.put(user_1.applyUser(settings.user));
    }
    catch (e) {
        console.error(e);
    }
}
exports.settingsSaga = settingsSaga;
